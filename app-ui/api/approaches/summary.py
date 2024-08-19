import os
import json
from azure.storage.blob import BlobServiceClient
from azure.identity import DefaultAzureCredential
from azure.ai.textanalytics import (TextAnalyticsClient, ExtractiveSummaryAction, AbstractiveSummaryAction)
import chardet



class summary():
    def __init__(self, defaultCreds, fileContainer, txtContainer, storageAcct, lang_endpoint, storageAcctSuffix=".blob.core.windows.net"):
        self.defaultCreds = defaultCreds
        self.fileContainer = fileContainer
        self.txtContainer = txtContainer
        self.storageAcct = storageAcct
        self.lang_endpoint = lang_endpoint
        self.storageAcctSuffix = storageAcctSuffix

    def run(self, fileName,  docLength, sentenceCount, useAbstractive): 
    
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
        fileText = fileText[0:docLength]

        if (useAbstractive):
            # Create a client
            text_analytics_client = TextAnalyticsClient(endpoint=self.lang_endpoint, credential=self.defaultCreds)
            actions = [AbstractiveSummaryAction()]
            poller = text_analytics_client.begin_analyze_actions([fileText], actions, language="en")
            document_results = poller.result()
            retVal = {}
            retVal["summary"] = ""
            retVal["SummarySentence"]= []
            print("Doc Summary Abstractive")
            for results in document_results:
                for result in results:
                    print(result)
                    for summary in result['summaries']:
                        retVal["summary"] += summary.text + " "
            return retVal
            
        else:
            # Create a client
            text_analytics_client = TextAnalyticsClient(endpoint=self.lang_endpoint, credential=self.defaultCreds)
            actions = [ExtractiveSummaryAction(max_sentence_count=sentenceCount)]
            poller = text_analytics_client.begin_analyze_actions([fileText], actions, language="en")
            document_results = poller.result()
        
            retVal = {}
            retVal["summary"] = ""
            retVal["SummarySentence"]= []
            print("Doc Summary Extractive " + str(sentenceCount) + " sentences")
            print(document_results)
            for result in document_results:
                print(result)
                summary_result = result[0]  # first document, first result
                if summary_result.is_error:
                    retVal["error"] = "Error code '{}' and message '{}'".format(
                        summary_result.code, summary_result.message
                    )
                else:
                    for sentence in summary_result.sentences:
                        print(sentence.text)
                        retVal["summary"] += sentence.text + " "
                        sentRaw = {
                                "text": sentence.text,
                                "rank_score": sentence.rank_score,
                                "offset": sentence.offset,
                                "length": sentence.length
                        }    
                        retVal["SummarySentence"].append(sentRaw)
            return retVal