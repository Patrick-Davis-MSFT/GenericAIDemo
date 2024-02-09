targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

// Optional parameters to override the default azd resource naming conventions. Update the main.parameters.json file to provide values. e.g.,:
// "resourceGroupName": {
//      "value": "myGroupName"
// }
param applicationInsightsDashboardName string = ''
param applicationInsightsName string = ''
param appServicePlanName string = ''
param cosmosAccountName string = ''
param cosmosDatabaseName string = ''
param keyVaultName string = ''
param logAnalyticsName string = ''
param resourceGroupName string = ''
param webServiceName string = ''
param azureOpenAIResourceGroup string
@description('Id of the user or app to assign application roles')
param principalId string = ''

var abbrs = loadJsonContent('./abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = { 'azd-env-name': environmentName }

param AZURE_OPENAI_SERVICE string
param AZURE_OPENAI_COMPLETION_DEPLOYMENT string
param AZURE_OPENAI_DEPLOYMENT_MODEL string
param AZURE_OPENAI_DEPLOYMENT_VERSION string 
param AZURE_OPENAI_DEPLOYMENT_MAX_TOKENS int



param AZURE_SEARCH_INDEX_NAME string = 'searchindex'

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

module storage './core/storage/storage-account.bicep' = {
  name: 'store${resourceToken}'
  scope: rg
  params: {
    location: location
    name: 'store${resourceToken}'
    tags: tags
    sku: {
      name: 'Standard_LRS'
    }
    kind: 'StorageV2'
    accessTier: 'Hot'
    publicNetworkAccess: 'Enabled'
    deleteRetentionPolicy: {
      enabled: false
    }
    containers: storeContainers
  }
}


// Organize resources in a resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

// The application frontend
module web './app/web.bicep' = {
  name: 'web'
  scope: rg
  params: {
    name: !empty(webServiceName) ? webServiceName : '${abbrs.webSitesAppService}web-${resourceToken}'
    location: location
    tags: tags
    appServicePlanId: appServicePlan.outputs.id
    keyVaultName: keyVault.outputs.name
    appSettings: {
      AZURE_COSMOS_CONNECTION_STRING: '@Microsoft.KeyVault(SecretUri=${cosmos.outputs.connectionStringKey})'
      AZURE_COSMOS_DATABASE_NAME: cosmos.outputs.databaseName
      AZURE_COSMOS_ENDPOINT: cosmos.outputs.endpoint
      AZURE_COSMOS_ABOUT_COLLECTION: cosmos.outputs.aboutcollection
      AZURE_COSMOS_ALERT_COLLECTION: cosmos.outputs.alertcollection
      VITE_APPLICATIONINSIGHTS_CONNECTION_STRING: '@Microsoft.KeyVault(SecretUri=${kvAppIn.outputs.kvSecretId})'
      AZURE_STORAGE_ACCOUNT: storage.name
      AZURE_OPENAI_SERVICE: aoai.outputs.AZURE_OPENAI_SERVICE
      AZURE_OPENAI_ENDPOINT: aoai.outputs.AZURE_OPENAI_ENDPOINT
      AZURE_STORAGE_CONTAINER_HTMLDOWNLOAD: storeContainers[0].name
      AZURE_STORAGE_CONTAINER_PROCESSED: storeContainers[1].name
      AZURE_STORAGE_CONTAINER_UPLOAD: storeContainers[2].name
      AZURE_STORAGE_CONTAINER_TEXT: storeContainers[3].name
      AZURE_LANGUAGE_SERVICE_NAME: aoai.outputs.AZURE_LANGUAGE_SERVICE_NAME
      AZURE_LANGUAGE_SERVICE_ENDPOINT: aoai.outputs.AZURE_LANGUAGE_SERVICE_ENDPOINT
      AZURE_OPENAI_RESOURCE_GROUP: azureOpenAIResourceGroup
      AZURE_RESOURCE_GROUP: rg.name
      AZURE_SUBSCRIPTION_ID: subscription().subscriptionId
    }
  }
}

module storageRoleWebApp './core/security/role.bicep' = {
  name: 'storage-role-webApp'
  scope: rg
  params: {
    principalId: web.outputs.SERVICE_WEB_IDENTITY_PRINCIPAL_ID
    roleDefinitionId: '2a2b9908-6ea1-4ae2-8e65-a410df84e7d1'
    principalType: 'ServicePrincipal'
  }
}



// Give the API access to KeyVault
module apiKeyVaultAccess './core/security/keyvault-access.bicep' = {
  name: 'api-keyvault-access'
  scope: rg
  params: {
    keyVaultName: keyVault.outputs.name
    principalId: web.outputs.SERVICE_WEB_IDENTITY_PRINCIPAL_ID
  }
}


// The application database
module cosmos './app/db.bicep' = {
  name: 'cosmos'
  scope: rg
  params: {
    accountName: !empty(cosmosAccountName) ? cosmosAccountName : '${abbrs.documentDBDatabaseAccounts}${resourceToken}'
    databaseName: cosmosDatabaseName
    location: location
    tags: tags
    keyVaultName: keyVault.outputs.name
  }
}

// Create an App Service Plan to group applications under the same payment plan and SKU
module appServicePlan './core/host/appserviceplan.bicep' = {
  name: 'appserviceplan'
  scope: rg
  params: {
    name: !empty(appServicePlanName) ? appServicePlanName : '${abbrs.webServerFarms}${resourceToken}'
    location: location
    tags: tags
    sku: {
      name: 'B1'
    }
  }
}

module pipeline './app/pipelines.bicep' = {
  name: 'pipeline'
  scope: rg
  params: {
    name: 'pipe${resourceToken}'
    location: location
    tags: tags
    webAppName: web.outputs.SERVICE_WEB_NAME
    webAppPlanName: appServicePlan.outputs.name
    applicationInsightsName: monitoring.outputs.applicationInsightsName
    cosmosCS: '@Microsoft.KeyVault(SecretUri=${cosmos.outputs.connectionStringKey})'
    keyVaultName: keyVault.outputs.name
    databaseName: cosmos.outputs.databaseName
    endpoint: cosmos.outputs.endpoint
    aboutcollection: cosmos.outputs.aboutcollection
    alertcollection: cosmos.outputs.alertcollection
    AZURE_OPENAI_SERVICE: aoai.outputs.AZURE_OPENAI_SERVICE
    AZURE_OPENAI_ENDPOINT: aoai.outputs.AZURE_OPENAI_ENDPOINT
    AZURE_OPENAI_COMPLETION_DEPLOYMENT: aoai.outputs.AZURE_OPENAI_COMPLETION_DEPLOYMENT
    AZURE_OPENAI_DEPLOYMENT_MODEL: aoai.outputs.AZURE_OPENAI_DEPLOYMENT_MODEL
    AZURE_OPENAI_DEPLOYMENT_MAX_TOKENS: AZURE_OPENAI_DEPLOYMENT_MAX_TOKENS
    AZURE_SEARCH_NAME: search.outputs.AZURE_SEARCH_NAME
    AZURE_SEARCH_INDEX_NAME: AZURE_SEARCH_INDEX_NAME
    AZURE_STORAGE_ACCOUNT: storage.name
    AZURE_OPENAI_RESOURCE_GROUP: azureOpenAIResourceGroup
    sbNamespace: 'sb-${resourceToken}'
    queueName: 'htmlLoaded'
    storeContainers: [
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
        name: 'text'
        publicAccess: 'None'
      }
    ]
  }
}

module search './app/search.bicep' = {
  name: 'ai-search'
  scope: rg
  params: {
    searchName: 'search-${resourceToken}'
    tags: tags
    location: location
    keyVaultName: keyVault.outputs.name
  }
}

module aoai 'app/aoai.bicep' = {
  name: 'aoai-completion'
  scope: rg
  params:{
  openAILocation: location
  tags: tags
  openAiServiceName: AZURE_OPENAI_SERVICE
  openAICompletion: AZURE_OPENAI_COMPLETION_DEPLOYMENT
  openAICompletionModel: AZURE_OPENAI_DEPLOYMENT_MODEL
  openAICompletionVersion: AZURE_OPENAI_DEPLOYMENT_VERSION
  openAIQuotaTokens: AZURE_OPENAI_DEPLOYMENT_MAX_TOKENS
  languageServiceName: '${AZURE_OPENAI_SERVICE}-lang-${resourceToken}'
  languageServiceLocation: 'eastus'
  }
}

module openAiRoleWebUser './core/security/role.bicep' = {
  name: 'openai-role-user'
  scope: rg
  params: {
    principalId: web.outputs.SERVICE_WEB_IDENTITY_PRINCIPAL_ID
    roleDefinitionId: '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd'
    principalType: 'ServicePrincipal'
  }
}

module AiRoleWebUser './core/security/role.bicep' = {
  name: 'ai-role-user'
  scope: rg
  params: {
    principalId: web.outputs.SERVICE_WEB_IDENTITY_PRINCIPAL_ID
    roleDefinitionId: 'a97b65f3-24c7-4388-baec-2e87135dc908'
    principalType: 'ServicePrincipal'
  }
}

// Store secrets in a keyvault
module keyVault './core/security/keyvault.bicep' = {
  name: 'keyvault'
  scope: rg
  params: {
    name: !empty(keyVaultName) ? keyVaultName : '${abbrs.keyVaultVaults}${resourceToken}'
    location: location
    tags: tags
    principalId: principalId
  }
}

module kvAppIn 'core/security/keyvault-secret.bicep' ={ 
  name: 'appinsights-key'
  scope: rg
  params: {
    name: 'app-insights-key'
    keyVaultName: keyVault.outputs.name
    secretValue: monitoring.outputs.applicationInsightsConnectionString
  }
}


// Monitor application with Azure Monitor
module monitoring './core/monitor/monitoring.bicep' = {
  name: 'monitoring'
  scope: rg
  params: {
    location: location
    tags: tags
    logAnalyticsName: !empty(logAnalyticsName) ? logAnalyticsName : '${abbrs.operationalInsightsWorkspaces}${resourceToken}'
    applicationInsightsName: !empty(applicationInsightsName) ? applicationInsightsName : '${abbrs.insightsComponents}${resourceToken}'
    applicationInsightsDashboardName: !empty(applicationInsightsDashboardName) ? applicationInsightsDashboardName : '${abbrs.portalDashboards}${resourceToken}'
  }
}

//AZD Required Outputs
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output AZURE_RESOURCE_GROUP string = rg.name

// Data outputs
output AZURE_COSMOS_DATABASE_NAME string = cosmos.outputs.databaseName
output AZURE_COSMOS_ENDPOINT string = cosmos.outputs.endpoint
output AZURE_COSMOS_ABOUT_COLLECTION string = cosmos.outputs.aboutcollection
output AZURE_COSMOS_ALERT_COLLECTION string = cosmos.outputs.alertcollection
output AZURE_COSMOS_CONNECTION_STRING_KEY string = substring(cosmos.outputs.connectionStringKey, indexOf(cosmos.outputs.connectionStringKey, 'secrets/')+8)

// App outputs
output AZURE_KEY_VAULT_ENDPOINT string = keyVault.outputs.endpoint
output AZURE_KEY_VAULT_NAME string = keyVault.outputs.name
output VITE_APPLICATIONINSIGHTS_CONNECTION_STRING_KEY string = substring(kvAppIn.outputs.kvSecretId, indexOf(kvAppIn.outputs.kvSecretId, 'secrets/')+8)
output VITE_WEB_BASE_URL string = web.outputs.SERVICE_WEB_URI
output REACT_APP_WEB_BASE_URL string = web.outputs.SERVICE_WEB_URI

// Storage 
output AZURE_STORAGE_ACCOUNT string = storage.name
output AZURE_STORAGE_CONTAINER_HTMLDOWNLOAD string = storeContainers[0].name
output AZURE_STORAGE_CONTAINER_PROCESSED string = storeContainers[1].name
output AZURE_STORAGE_CONTAINER_UPLOAD string = storeContainers[2].name
output AZURE_STORAGE_CONTAINER_TEXT string = storeContainers[3].name


//AOAI 
output AZURE_OPENAI_SERVICE string = aoai.outputs.AZURE_OPENAI_SERVICE
output AZURE_OPENAI_ENDPOINT string = aoai.outputs.AZURE_OPENAI_ENDPOINT
output AZURE_LANGUAGE_SERVICE_NAME string = aoai.outputs.AZURE_LANGUAGE_SERVICE_NAME
output AZURE_LANGUAGE_SERVICE_ENDPOINT string = aoai.outputs.AZURE_LANGUAGE_SERVICE_ENDPOINT
output AZURE_OPENAI_RESOURCE_GROUP string = azureOpenAIResourceGroup
