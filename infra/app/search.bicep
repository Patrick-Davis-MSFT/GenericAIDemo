param authOptions object = {}
param searchName string
param keyVaultName string
param location string = resourceGroup().location
param tags object = {}
param disableLocalAuth bool = false
param encryptionWithCmk object = {
  enforcement: 'Unspecified'
}
@allowed([
  'default'
  'highDensity'
])
param hostingMode string = 'default'
param networkRuleSet object = {
  bypass: 'None'
  ipRules: []
}
param partitionCount int = 1
@allowed([
  'enabled'
  'disabled'
])
param publicNetworkAccess string = 'enabled'
param replicaCount int = 1
@allowed([
  'disabled'
  'free'
  'standard'
])
param semanticSearch string = 'free'
param searchsku object = {
  name: 'standard'
}
param seachAdminKVKey string = 'search-admin-key'


resource kv 'Microsoft.KeyVault/vaults@2022-07-01' existing =  {
  name: keyVaultName
}


resource search 'Microsoft.Search/searchServices@2023-11-01' = {
  name: searchName
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    authOptions: authOptions
    disableLocalAuth: disableLocalAuth
    encryptionWithCmk: encryptionWithCmk
    hostingMode: hostingMode
    networkRuleSet: networkRuleSet
    partitionCount: partitionCount
    publicNetworkAccess: publicNetworkAccess
    replicaCount: replicaCount
    semanticSearch: semanticSearch
  }
  sku: searchsku
}


resource kvSBCS 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = { 
  name: seachAdminKVKey
  parent: kv
  properties: {
    value: search.listAdminKeys().primaryKey
  }
}


output AZURE_SEARCH_ADMIN_KEY string = kvSBCS.properties.secretUri
output AZURE_SEARCH_ENDPOINT string = 'https://${search.name}.search.windows.net'
output AZURE_SEARCH_NAME string = search.name
output AZURE_SEARCH_PRINCIPAL_ID string = search.identity.principalId
