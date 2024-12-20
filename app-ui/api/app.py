import json
import os
import io
import mimetypes
import time
import logging
import threading
import queue
import sys
import re
import base64
import html
from io import BytesIO
from flask import Flask, request, jsonify, send_file, abort, Response
from azure.identity import DefaultAzureCredential
from approaches.versioncheck import versionCheck
from approaches.sendaoai import sendaoai
from approaches.sendrawdocaoai import sendrawdocaoai
from approaches.summary import summary
from azure.mgmt.cognitiveservices import CognitiveServicesManagementClient
from azure.storage.blob import BlobServiceClient

# Replace these with your own values, either in environment variables or directly here
AZURE_COSMOS_ENDPOINT = os.environ.get("AZURE_COSMOS_ENDPOINT", "") or "AZURE_COSMOS_ENDPOINT"
AZURE_COSMOS_DATABASE_NAME = os.environ.get("AZURE_COSMOS_DATABASE_NAME", "") or "AZURE_COSMOS_DATABASE_NAME"
AZURE_COSMOS_ABOUT_COLLECTION = os.environ.get("AZURE_COSMOS_ABOUT_COLLECTION", "") or "AZURE_COSMOS_ABOUT_COLLECTION"
AZURE_COSMOS_ALERT_COLLECTION = os.environ.get("AZURE_COSMOS_ALERT_COLLECTION", "") or "AZURE_COSMOS_ALERT_COLLECTION"
AZURE_COSMOS_CONNECTION_STRING = os.environ.get("AZURE_COSMOS_CONNECTION_STRING", "") or "AZURE_COSMOS_CONNECTION_STRING"

AZURE_OPENAI_ENDPOINT = os.environ.get("AZURE_OPENAI_ENDPOINT", "") or "AZURE_OPENAI_ENDPOINT"
AZURE_OPENAI_SERVICE = os.environ.get("AZURE_OPENAI_SERVICE", "") or "AZURE_OPENAI_SERVICE"

AZURE_RESOURCE_GROUP = os.environ.get("AZURE_RESOURCE_GROUP", "") or "AZURE_RESOURCE_GROUP"
AZURE_SUBSCRIPTION_ID = os.environ.get("AZURE_SUBSCRIPTION_ID", "") or "AZURE_SUBSCRIPTION_ID"
AZURE_OPENAI_RESOURCE_GROUP = os.environ.get("AZURE_OPENAI_RESOURCE_GROUP", "") or "AZURE_OPENAI_RESOURCE_GROUP"

AZURE_STORAGE_ACCOUNT = os.environ.get("AZURE_STORAGE_ACCOUNT", "") or "AZURE_STORAGE_ACCOUNT"
AZURE_STORAGE_CONTAINER_UPLOAD = os.environ.get("AZURE_STORAGE_CONTAINER_UPLOAD", "upload") or "AZURE_STORAGE_CONTAINER_UPLOAD"
AZURE_STORAGE_CONTAINER_PROCESSED = os.environ.get("AZURE_STORAGE_CONTAINER_PROCESSED", "processed") or "AZURE_STORAGE_CONTAINER_PROCESSED"
AZURE_STORAGE_CONTAINER_TEXT = os.environ.get("AZURE_STORAGE_CONTAINER_TEXT", "text") or "AZURE_STORAGE_CONTAINER_TEXT"
AZURE_LANGUAGE_SERVICE_ENDPOINT = os.environ.get("AZURE_LANGUAGE_SERVICE_ENDPOINT", "") or "AZURE_LANGUAGE_SERVICE_ENDPOINT"

AZURE_MULTI_AI_SERVICE_ENDPOINT = os.environ.get("AZURE_MULTI_AI_SERVICE_ENDPOINT", "AZURE_MULTI_AI_SERVICE_ENDPOINT") or "AZURE_MULTI_AI_SERVICE_ENDPOINT"
AZURE_MULTI_AI_SERVICE_NAME = os.environ.get("AZURE_MULTI_AI_SERVICE_NAME", "AZURE_MULTI_AI_SERVICE_NAME") or "AZURE_MULTI_AI_SERVICE_NAME"
# Use the current user identity to authenticate with Azure OpenAI, Cognitive Search and Blob Storage (no secrets needed, 
# just use 'az login' locally, and managed identity when deployed on Azure). If you need to use keys, use separate AzureKeyCredential instances with the 
# keys for each service
# If you encounter a blocking error during a DefaultAzureCredntial resolution, you can exclude the problematic credential by using a parameter (ex. exclude_shared_token_cache_credential=True)
#logging.basicConfig(level=logging.DEBUG)
#azure_credential = DefaultAzureCredential(exclude_shared_token_cache_credential = True, logging_enable=True)
azure_credential = DefaultAzureCredential(exclude_shared_token_cache_credential = True)


# Approach to get 
aoai_approaches = {
    "ver": versionCheck(AZURE_COSMOS_ENDPOINT,
                            AZURE_COSMOS_DATABASE_NAME, 
                            AZURE_COSMOS_ABOUT_COLLECTION,
                            AZURE_COSMOS_CONNECTION_STRING),
    "sendaoai": sendaoai(azure_credential,
                            AZURE_STORAGE_CONTAINER_TEXT,
                            AZURE_STORAGE_ACCOUNT,
                            AZURE_OPENAI_ENDPOINT),
    "sendrawdocaoai": sendrawdocaoai(azure_credential,
                            AZURE_STORAGE_CONTAINER_UPLOAD,
                            AZURE_STORAGE_ACCOUNT,
                            AZURE_MULTI_AI_SERVICE_ENDPOINT,
                            AZURE_OPENAI_ENDPOINT),
    "summary": summary(azure_credential,
                            AZURE_STORAGE_CONTAINER_PROCESSED,
                            AZURE_STORAGE_CONTAINER_TEXT,
                            AZURE_STORAGE_ACCOUNT,
                            AZURE_LANGUAGE_SERVICE_ENDPOINT)
}




app = Flask(__name__)

@app.route("/", defaults={"path": "index.html"})
@app.route("/<path:path>")
def static_file(path):
    return app.send_static_file(path)


@app.route("/about")
def about():
    try:
        impl = aoai_approaches.get("ver")
        r = impl.run()
        id = r["_id"]
        r["_id"] = str(id)
        return jsonify(r)
    except Exception as e:
        logging.exception("Exception in /about")
        return jsonify({"error": str(e)}), 500
    
@app.route("/getAOAIAccounts")
def aoaiAccounts():
    try:
        client = CognitiveServicesManagementClient(
            credential=DefaultAzureCredential(),
            subscription_id=AZURE_SUBSCRIPTION_ID,
        )
        r = client.accounts.list()
        retvalue = []
        
        for item in r:
            #logging.exception(item.as_dict())
            if item.kind == "OpenAI":
                item = {"id": item.id, "name": item.name, "kind": item.kind, "sku": item.sku.name}
                retvalue.append(item)
        
        return jsonify(retvalue)
    except Exception as e:
        logging.exception("Exception in /aoaiAccounts")
        return jsonify({"error": str(e)}), 500

@app.route("/getDeploymentInfo", methods=["GET","POST"])
def getDeploymentInfo():
    try:
        tmpAOAIRg = AZURE_OPENAI_RESOURCE_GROUP
        tmpAOAIService = AZURE_OPENAI_SERVICE
        
        try:
            req = request.get_json()
            if not req:
                a=1 #do nothing
            else:
                tmpAOAIRg = req.get("resource_group_name")
                tmpAOAIService = req.get("account_name")
        except:
            logging.info("No request body provided. Using Defaults")

        client = CognitiveServicesManagementClient(
            credential=DefaultAzureCredential(),
            subscription_id=AZURE_SUBSCRIPTION_ID,
        )
        r = client.deployments.list(
            resource_group_name=tmpAOAIRg,
            account_name=tmpAOAIService,
        )
        retvalue = []
        
        for item in r:
            #logging.exception(item.as_dict())
            item = {"id": item.id, "name": item.name, "model": item.properties.model.name, "version":item.properties.model.version}
            retvalue.append(item)
        
        return jsonify(retvalue)
    except Exception as e:
        logging.exception("Exception in /getDeploymentInfo")
        return jsonify({"error": str(e)}), 500

@app.route("/uploadFile", methods=["POST"])
def upload_file():
    try:
        # Check if the post request has the file part
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files['file']

        # If the user does not select a file, the browser submits an empty file without a filename
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Create the BlobServiceClient object
        blob_service_client = BlobServiceClient(account_url=f"https://{AZURE_STORAGE_ACCOUNT}.blob.core.windows.net", credential=azure_credential)

        # Create a blob client using the local file name as the name for the blob
        blob_client = blob_service_client.get_blob_client(container=AZURE_STORAGE_CONTAINER_UPLOAD, blob=file.filename)

        # Upload the file to Azure Blob Storage
        blob_client.upload_blob(file)

        return jsonify({"message": "File uploaded successfully"}), 200

    except Exception as e:
        logging.exception("Exception in /uploadFile")
        return jsonify({"error": str(e)}), 500


@app.route("/getFiles")
def getFiles():
    try:
        blob_service_client = BlobServiceClient(account_url=f"https://{AZURE_STORAGE_ACCOUNT}.blob.core.windows.net", credential=azure_credential)
        container_client = blob_service_client.get_container_client(AZURE_STORAGE_CONTAINER_PROCESSED)
        blobList = container_client.list_blobs()
        res = []
        for blob in blobList:
            blobRes = {"name": blob.name,
                        "size": blob.size,
                        "content_type": blob.content_settings.content_type,
                        "last_modified": blob.last_modified}
            res.append(blobRes)
        return jsonify(res)
    except Exception as e:
        logging.exception("Exception in /getFiles")
        return jsonify({"error": str(e)}), 500

@app.route("/getUploadedFiles")
def getUploadedFiles():
    try:
        blob_service_client = BlobServiceClient(account_url=f"https://{AZURE_STORAGE_ACCOUNT}.blob.core.windows.net", credential=azure_credential)
        container_client = blob_service_client.get_container_client(AZURE_STORAGE_CONTAINER_UPLOAD)
        blobList = container_client.list_blobs()
        res = []
        for blob in blobList:
            blobRes = {"name": blob.name,
                        "size": blob.size,
                        "content_type": blob.content_settings.content_type,
                        "last_modified": blob.last_modified}
            res.append(blobRes)
        return jsonify(res)
    except Exception as e:
        logging.exception("Exception in /getUploadedFiles")
        return jsonify({"error": str(e)}), 500

@app.route("/getAOAIRawDocResponse", methods=["POST"])
def getAOAIRawDocResponse():
    try:
        # Get the request body
        req = request.get_json()
        if not req:
            return abort(400, "No request body provided")

        # Get the approach
        approach = "sendrawdocaoai"
        if not approach:
            return abort(400, "No approach provided")

        # Get the approach implementation
        impl = aoai_approaches.get(approach)
        if not impl:
            return abort(400, "Unknown approach")

        # Run the approach
        inMsg = req.get("messages")
        #logging.exception(inMsg)
        messages = []
        for msg in inMsg:
            #logging.exception(msg['content'])
            messages.append(msg)
        r = impl.run(fileName=req.get("fileName"), 
                     deploymentName=req.get("deploymentName"), 
                     messages=inMsg, 
                     maxLength=req.get("docLength"),
                     temperature=req.get("temperature"),
                     max_tokens=req.get("max_tokens"),
                     top_p=req.get("topP"))
        #logging.info(r)
        return r
    except Exception as e:
        logging.exception("Exception in /getAOAIRawDocResponse")
        return jsonify({"error": str(e)}), 500
    

@app.route("/getAOAIResponse", methods=["POST"])
def getAOAIResponse():
    try:
        # Get the request body
        req = request.get_json()
        if not req:
            return abort(400, "No request body provided")

        # Get the approach
        approach = "sendaoai"
        if not approach:
            return abort(400, "No approach provided")

        # Get the approach implementation
        impl = aoai_approaches.get(approach)
        if not impl:
            return abort(400, "Unknown approach")

        # Run the approach
        inMsg = req.get("messages")
        #logging.exception(inMsg)
        messages = []
        for msg in inMsg:
            #logging.exception(msg['content'])
            messages.append(msg)
        r = impl.run(fileName=req.get("fileName"), 
                     deploymentName=req.get("deploymentName"), 
                     messages=inMsg, 
                     maxLength=req.get("docLength"),
                     temperature=req.get("temperature"),
                     max_tokens=req.get("max_tokens"),
                     top_p=req.get("topP"))
        #logging.info(r)
        return r
    except Exception as e:
        logging.exception("Exception in /getAOAIResponse")
        return jsonify({"error": str(e)}), 500
    
@app.route("/getSummary", methods=["POST"])
def getSummary():
    try:
        # Get the request body
        req = request.get_json()
        if not req:
            return abort(400, "No request body provided")
        approach = "summary"
        if not approach:
            return abort(400, "No approach provided")

        # Get the approach implementation
        impl = aoai_approaches.get(approach)
        if not impl:
            return abort(400, "Unknown approach")
        
        r = impl.run(fileName=req.get("fileName"), 
                     docLength=req.get("docLength"), 
                     sentenceCount=req.get("sentenceCount"),
                     useAbstractive=req.get("useAbstractive"))
        logging.exception(r)
        return jsonify(r)
    except Exception as e:
        logging.exception("Exception in /runPrompt")
        return jsonify({"error": str(e)}), 500