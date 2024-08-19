import os
import json
from azure.storage.blob import BlobServiceClient
from openai import AzureOpenAI
from azure.identity import DefaultAzureCredential



class sendaoai():
    def __init__(self, defaultCreds, fileContainer, txtContainer, storageAcct, aoai_endpoint, storageAcctSuffix=".blob.core.windows.net"):
        self.defaultCreds = defaultCreds
        self.fileContainer = fileContainer
        self.txtContainer = txtContainer
        self.storageAcct = storageAcct
        self.aoai_endpoint = aoai_endpoint
        self.storageAcctSuffix = storageAcctSuffix
    
    def token_provider(self, scopes=None):
        return self.defaultCreds.get_token("https://cognitiveservices.azure.com/.default").token
    
    def chat_completion_to_dict(self, chat_completion):
        return {
            'id': chat_completion.id,
            'choices': [self.choice_to_dict(choice) for choice in chat_completion.choices],
            'created': chat_completion.created,
            'model': chat_completion.model,
            'object': chat_completion.object,
            'system_fingerprint': chat_completion.system_fingerprint,
            'usage': self.usage_to_dict(chat_completion.usage),
            'prompt_filter_results': chat_completion.prompt_filter_results,
        }

    def choice_to_dict(self, choice):
        return {
            'finish_reason': choice.finish_reason,
            'index': choice.index,
            'logprobs': choice.logprobs,
            'message': self.message_to_dict(choice.message),
            'content_filter_results': choice.content_filter_results,
        }

    def message_to_dict(self, message):
        return {
            'content': message.content,
            'role': message.role,
            'function_call': message.function_call,
            'tool_calls': message.tool_calls,
        }

    def usage_to_dict(self, usage):
        return {
            'completion_tokens': usage.completion_tokens,
            'prompt_tokens': usage.prompt_tokens,
            'total_tokens': usage.total_tokens,
        }

    def run(self, fileName, deploymentName, messages, maxLength, function=[], code="", temperature=0.7, max_tokens=1500, top_p=1): 
        if(fileName != None):
            orgFileName = fileName.strip()
            splitFileName = orgFileName.split(".")
            if (splitFileName[1].startswith("txt")):
                txtFileName = orgFileName.split(".")[0] + ".txt"
            elif (splitFileName[1].startswith("csv")):
                txtFileName = orgFileName.split(".")[0] + ".csv"
            elif (splitFileName[1].startswith("tsv")):
                txtFileName = orgFileName.split(".")[0] + ".tsv"
            elif (splitFileName[1].startswith("json")):
                txtFileName = orgFileName.split(".")[0] + ".json"
            elif (splitFileName[1].startswith("md")):
                txtFileName = orgFileName.split(".")[0] + ".md"
            else:
                txtFileName = orgFileName.split(".")[0] + ".txt"
            

            #Get file Text
            blob_service_client = BlobServiceClient(account_url=f"https://{self.storageAcct}{self.storageAcctSuffix}", credential=self.defaultCreds)
            container_client = blob_service_client.get_container_client(self.txtContainer)
            blob_client = container_client.get_blob_client(txtFileName)
            fileText = blob_client.download_blob().readall().decode('utf-8')
            
            #shorten file text to limit of azure open AI model
            fileText = fileText[0:maxLength]

            #Insert File Text into message
            for message in messages:
                message['content'] = message['content'].replace("{{doc}}", fileText)
                message['content'] = message['content'].replace("{{docName}}", orgFileName)
                #print(message['content'])

        #build Azure Open AI request
        #create client
        aoaiclient = AzureOpenAI(azure_endpoint=self.aoai_endpoint, azure_ad_token_provider=self.token_provider, api_version="2023-12-01-preview")
        hasTools = False
        if (function and len(function) > 0 and code != ""):
            tools = function

        if (hasTools): 
        #Call Azure Open AI request
            response = aoaiclient.chat.completions.create(
                model=deploymentName,
                messages=messages,
                tools=tools,
                tool_choice="auto",
                max_tokens = max_tokens,
                temperature = temperature,
                top_p = top_p
            )
        else:
            response = aoaiclient.chat.completions.create(
                model=deploymentName,
                messages=messages,
                max_tokens = max_tokens,
                temperature = temperature,
                top_p = top_p
            )
        r = self.chat_completion_to_dict(response)
        return r    