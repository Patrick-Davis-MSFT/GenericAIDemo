param openAiServiceName string
param openAICompletion string
param openAICompletionModel string
param openAIQuotaTokens int = 10
param openAICompletionVersion string 
param publicNetworkAccess string = 'Enabled'
param tags object = {}
param sku object = {
  name: 'S0'
}
param openAILocation string = 'eastus'

param languageServiceName string
param languageServiceLocation string

param multiserviceAccountName string

resource openAiAccount 'Microsoft.CognitiveServices/accounts@2023-05-01'  =   {
  name: openAiServiceName
  location: openAILocation
  tags: tags
  kind: 'OpenAI'
  properties: {
    customSubDomainName: openAiServiceName
    publicNetworkAccess: publicNetworkAccess
    networkAcls: {
      defaultAction: 'Allow'
    }

  }
  sku: sku
}


resource languageService 'Microsoft.CognitiveServices/accounts@2023-10-01-preview' = {
  name: languageServiceName
  location: languageServiceLocation
  kind: 'TextAnalytics'
  sku: {
    name: 'F0'
  }
  properties: {
    customSubDomainName: openAiServiceName
    publicNetworkAccess: publicNetworkAccess
    networkAcls: {
      defaultAction: 'Allow'
    }
  }
}
resource aiMultiserviceAccount 'Microsoft.CognitiveServices/accounts@2024-06-01-preview' = {
  name: multiserviceAccountName
  location: openAILocation
  tags: tags
  kind: 'CognitiveServices'
  properties: {
    customSubDomainName: multiserviceAccountName
    publicNetworkAccess: publicNetworkAccess
    networkAcls: {
      defaultAction: 'Allow'
    }
  }
  sku: {
    name: 'S0'
  }
  identity: {
    type: 'SystemAssigned'
  }
}

resource CompDeploy 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = {
  parent: openAiAccount
  name: openAICompletion
  properties: {
    model: {
      format: 'OpenAI'
      name: openAICompletionModel
      version: openAICompletionVersion
    }
    raiPolicyName: null
  }
  sku: {
    name: 'Standard'
    capacity: openAIQuotaTokens
  }
}




output AZURE_OPENAI_SERVICE string = openAiAccount.name
output AZURE_OPENAI_ENDPOINT string = openAiAccount.properties.endpoint
output AZURE_OPENAI_COMPLETION_DEPLOYMENT string = CompDeploy.name
output AZURE_OPENAI_DEPLOYMENT_MODEL string = openAICompletionModel
output AZURE_OPENAI_DEPLOYMENT_VERSION string = openAICompletionVersion
output AZURE_OPENAI_QUOTA_TOKENS int = openAIQuotaTokens
output AZURE_LANGUAGE_SERVICE_NAME string = languageService.name
output AZURE_LANGUAGE_SERVICE_ENDPOINT string = languageService.properties.endpoint
output AZURE_MULTI_AI_SERVICE_NAME string = aiMultiserviceAccount.name
output AZURE_MULTI_AI_SERVICE_ENDPOINT string = aiMultiserviceAccount.properties.endpoint
output AZURE_MULTI_AI_SERVICE_PRINCIPAL string = aiMultiserviceAccount.identity.principalId
 
