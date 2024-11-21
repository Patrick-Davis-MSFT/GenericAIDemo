import os
import json
from azure.core.credentials import AzureKeyCredential
from azure.storage.blob import BlobServiceClient
from openai import AzureOpenAI
from azure.identity import DefaultAzureCredential
from azure.ai.translation.document import DocumentTranslationClient, DocumentTranslationInput, TranslationTarget
from azure.ai.textanalytics import TextAnalyticsClient
from azure.ai.formrecognizer import DocumentAnalysisClient



class sendrawdocaoai():
    def __init__(self, defaultCreds, fileContainer, storageAcct, mai_endpoint, aoai_endpoint):
        self.defaultCreds = defaultCreds
        self.fileContainer = fileContainer
        self.storageAcct = storageAcct
        self.mai_endpoint = mai_endpoint
        self.aoai_endpoint = aoai_endpoint
    
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
    
    def detect_language(self, text):
        text_analytics_client = TextAnalyticsClient(
            endpoint=self.mai_endpoint,
            credential=self.token_provider
        )

        # Detect the language of the text
        response = text_analytics_client.detect_language(documents=[text])
        detected_language = response[0].primary_language.iso6391_name

        return detected_language

    def translate_to_english(self, text):
        # Create a DocumentTranslationClient
        translation_client = DocumentTranslationClient(
            endpoint=self.mai_endpoint,
            credential=self.defaultCreds
        )

        # Detect the language of the text
        detected_language = self.detect_language(text[0:5000])
        if detected_language == 'en':
            return text

        # Translate the text to English
        translation_input = DocumentTranslationInput(
            source_url=text,
            targets=[
                TranslationTarget(
                    target_url='en',
                    language_code='en'
                )
            ]
        )

        poller = translation_client.begin_translation(translation_input)
        result = poller.result()

        translated_text = ""
        for document in result:
            if document.status == "Succeeded":
                translated_text = document.translated_document_url
            else:
                raise Exception(f"Translation failed with status: {document.status}")

        return translated_text


    def convert_document_to_text(self, file_url):
        # Create a DocumentAnalysisClient
        document_analysis_client = DocumentAnalysisClient(
            endpoint=self.mai_endpoint,
            credential=self.defaultCreds
        )

        poller = document_analysis_client.begin_analyze_document_from_url("prebuilt-read", file_url)
        result = poller.result()

        extracted_text = ""
        for page in result.pages:
            for line in page.lines:
                extracted_text += line.content + "\n"

        return extracted_text
    

    def run(self, fileName, deploymentName, messages, maxLength, function=[], code="", temperature=0.7, max_tokens=1500, top_p=1): 
        if(fileName == None):
            raise ValueError("fileName is required")
            

        #Get file Text
        blob_service_client = BlobServiceClient(account_url=f"https://{self.storageAcct}.blob.core.windows.net", credential=self.defaultCreds)
        container_client = blob_service_client.get_container_client(self.fileContainer)
        blob_client = container_client.get_blob_client(fileName)
        file_url = blob_client.url
        
        fileText = self.convert_document_to_text(file_url)
        #shorten file text to limit of azure open AI model
        fileText = fileText[0:maxLength]
        fileText = self.translate_to_english(fileText)
        #Insert File Text into message
        for message in messages:
            message['content'] = message['content'].replace("{{doc}}", fileText)
            message['content'] = message['content'].replace("{{docName}}", fileName)
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