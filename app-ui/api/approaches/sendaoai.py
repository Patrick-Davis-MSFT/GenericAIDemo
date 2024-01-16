import os

from azure.storage.blob import BlobServiceClient


class versionCheck():
    def __init__(self, defaultCreds, fileContainer, txtContainer, storageAcct, aoai_endpoint):
        self.defaultCreds = defaultCreds
        self.fileContainer = fileContainer
        self.txtContainer = txtContainer
        self.storageAcct = storageAcct
        self.aoai_endpoint = aoai_endpoint
        
    def run(self, fileName, deploymentName, messages, maxLength=7000): 
        if(fileName != None):
            orgFileName = fileName.trim()
            txtFileName = orgFileName.split(".")[0] + ".txt"

            #Get file Text
            blob_service_client = BlobServiceClient(account_url=f"https://{self.storageAcct}.blob.core.windows.net", credential=self.defaultCreds)
            container_client = blob_service_client.get_container_client(self.txtContainer)
            blob_client = container_client.get_blob_client(txtFileName)
            fileText = blob_client.download_blob().readall()
            
            #shorten file text to limit of azure open AI model
            fileText = fileText[0:maxLength]

            #Insert File Text into message
            for message in messages:
                message.contents.Replace("{{doc}}", fileText)
                message.contents.Replace("{{docName}}", orgFileName)

        #build Azure Open AI request

        #Call Azure Open AI request

        return "lkfjflkj"
        