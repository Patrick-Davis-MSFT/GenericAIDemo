param name string
param location string = resourceGroup().location
param tags object = {}
param webAppName string
param webAppPlanName string
param applicationInsightsName string
param cosmosCS string
param keyVaultName string
param rssURI string = 'https://www.cisa.gov/cybersecurity-advisories/ics-advisories.xml'
param databaseName string
param endpoint string
param aboutcollection string
param alertcollection string

param AZURE_OPENAI_SERVICE string
param AZURE_OPENAI_ENDPOINT string
param AZURE_OPENAI_COMPLETION_DEPLOYMENT string
param AZURE_OPENAI_DEPLOYMENT_MODEL string
param AZURE_OPENAI_DEPLOYMENT_MAX_TOKENS int
param AZURE_OPENAI_RESOURCE_GROUP string

param AZURE_MULTI_AI_SERVICE_NAME string
param AZURE_MULTI_AI_SERVICE_ENDPOINT string

param AZURE_SEARCH_NAME string
param AZURE_SEARCH_INDEX_NAME string

param sbNamespace string
param queueName string
param AZURE_STORAGE_ACCOUNT string
param storeContainers array = [
  {
    name: 'htmldownload'
    publicAccess: 'None'
  }
  {
    name: 'procesed'
    publicAccess: 'None'
  }
  {
    name: 'upload'
    publicAccess: 'None'
  }
  {
    name: 'plaintext'
    publicAccess: 'None'
  }
]

resource webAppPlan 'Microsoft.Web/serverfarms@2022-03-01' existing = {
  name: webAppPlanName
}



module functionApp '../core/host/functions.bicep' = {
  name: 'functionApp-${name}'
  params: {
    name: 'fn-${name}'
    location: location
    tags: union(tags, { 'azd-service-name': 'functionApp' })
    appServicePlanId: webAppPlan.id
    runtimeName: 'python'
    runtimeVersion: '3.10'
    keyVaultName: keyVaultName
    applicationInsightsName: applicationInsightsName
    storageAccountName: AZURE_STORAGE_ACCOUNT
    appSettings: {
      AZURE_COSMOS_CONNECTION_STRING: cosmosCS
      AZURE_STORAGE_ACCOUNT: AZURE_STORAGE_ACCOUNT
      AZURE_INITIAL_CONTAINER: storeContainers[0].name
      AZURE_PROCESSED_CONTAINER: storeContainers[1].name
      AZURE_STORAGE_ACCOUNT_CS: '@Microsoft.KeyVault(SecretUri=${AZURE_STORAGE_ACCOUNT})'
      AZURE_COSMOS_DATABASE_NAME: databaseName
      AZURE_COSMOS_ENDPOINT: endpoint
      AZURE_COSMOS_ABOUT_COLLECTION: aboutcollection
      AZURE_COSMOS_ALERT_COLLECTION: alertcollection
      AZURE_SERVICE_BUS_CONNECTION_STRING: '@Microsoft.KeyVault(SecretUri=${kvSBCS.properties.secretUri})'
      AZURE_SERVICE_BUS_NAMESPACE: serviceBusNamespace.name
      AZURE_SERVICE_BUS_QUEUE: serviceBusQueue.name
      AZURE_RSS_URI: rssURI
      AZURE_OPENAI_SERVICE: AZURE_OPENAI_SERVICE
      AZURE_OPENAI_ENDPOINT: AZURE_OPENAI_ENDPOINT
      AZURE_SEARCH_NAME: AZURE_SEARCH_NAME
      AZURE_OPENAI_COMPLETION_DEPLOYMENT: AZURE_OPENAI_COMPLETION_DEPLOYMENT
      AZURE_OPENAI_DEPLOYMENT_MODEL: AZURE_OPENAI_DEPLOYMENT_MODEL
      AZURE_OPENAI_DEPLOYMENT_MAX_TOKENS: AZURE_OPENAI_DEPLOYMENT_MAX_TOKENS
      AZURE_SEARCH_INDEX_NAME: AZURE_SEARCH_INDEX_NAME
      AZURE_OPENAI_RESOURCE_GROUP: AZURE_OPENAI_RESOURCE_GROUP
      AZURE_MULTI_AI_SERVICE_NAME: AZURE_MULTI_AI_SERVICE_NAME
      AZURE_MULTI_AI_SERVICE_ENDPOINT: AZURE_MULTI_AI_SERVICE_ENDPOINT

    }
  }
}



resource serviceBusNamespace 'Microsoft.ServiceBus/namespaces@2022-10-01-preview' = {
  name: sbNamespace
  location: location
  sku: {
    name: 'Standard'
  }
}

resource kv 'Microsoft.KeyVault/vaults@2022-07-01' existing =  {
  name: keyVaultName
}

resource kvSBCS 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = { 
  name: 'sb-connection-cs'
  parent: kv
  properties: {
    value: listKeys(resourceId('Microsoft.ServiceBus/namespaces/AuthorizationRules', sbNamespace, 'RootManageSharedAccessKey'), '2021-06-01-preview').primaryConnectionString
  }
}

resource serviceBusQueue 'Microsoft.ServiceBus/namespaces/queues@2022-10-01-preview' = {
  parent: serviceBusNamespace
  name: '${queueName}'
  properties: {
    lockDuration: 'PT5M'
    maxSizeInMegabytes: 1024
    requiresDuplicateDetection: false
    defaultMessageTimeToLive: 'P1D'
    deadLetteringOnMessageExpiration: true
    duplicateDetectionHistoryTimeWindow: 'PT1M'
    maxDeliveryCount: 10
    enableBatchedOperations: true
    autoDeleteOnIdle: 'P2D'
  }
}

output functionAppURI string = functionApp.outputs.uri
output functionAppPrincipalId string = functionApp.outputs.identityPrincipalId
output serviceBusNamespaceName string = serviceBusNamespace.name
output serviceBusQueueName string = serviceBusQueue.name
output serviceBusConnectStringKey string = kvSBCS.name
output rssURI string = rssURI
