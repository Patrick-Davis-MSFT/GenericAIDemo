export type About = {
    "appName": "string",
    "appVersion": "string",
    "deploy_datetime": "string"
}

export type DeploymentListResponse = 
    [{
        "id": "string",
        "name": "string",
        "model": "string",
        "version": "string",
    }
]
export type FileListResponse = [
    {
        "name": "string",
        "size": "string",
        "last_modified": "string",
        "content_type": "string"
    }
]

export type AOAIListResponse = [
    {
        "id": "string",
        "name": "string",
        "kind": "string",
        "sku": "string"
    }
]

export type AOAISetting = {
    "id": "string",
    "name": "string",
    "kind": "string",
    "sku": "string"
}

export type message = 
    {
        "role": string,
        "content": string,
    }

export type messages = message[]

export type AOAIResponse = {
    id: string,
}