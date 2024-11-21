/* eslint-disable @typescript-eslint/no-explicit-any */
import {AOAIListResponse, About, DeploymentListResponse, FileListResponse, messages } from './models';

export async function getAbout(): Promise<About> {
    const response = await fetch('/about');
    return await response.json();
}

export async function getDeployments(): Promise<DeploymentListResponse> {
    const response = await fetch('/getDeploymentInfo');
    return await response.json();
}

export async function getDeploymentsWService(serviceRg: string, serviceName: string): Promise<DeploymentListResponse> {
    const response = await fetch('/getDeploymentInfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            },
        body: JSON.stringify({
            resource_group_name: serviceRg,
            account_name: serviceName
        })
    });
    return await response.json();
}

export async function uploadFile(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/uploadFile', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('File upload failed');
    }
}

export async function getFiles(): Promise<FileListResponse> {
    const response = await fetch('/getFiles');
    return await response.json();
}


export async function getUploadedFiles(): Promise<FileListResponse> {
    const response = await fetch('/getUploadedFiles');
    return await response.json();
}
export async function getAOAIService(): Promise<AOAIListResponse> {
    const response = await fetch('/getAOAIAccounts');
    return await response.json();
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAOAIResponse(fileName: string, deploymentName: string, messages: messages, docLength: number, maxTokens:number, temperature:number, topP:number): Promise<any> {
    console.log("getAOAIResponse");
    const response = await fetch('/getAOAIResponse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileName: fileName,
                deploymentName: deploymentName,
                messages: messages,
                docLength: docLength,
                maxTokens: maxTokens,
                temperature: temperature,
                topP: topP
                })
        });
    return await response.json();
}

export async function getAOAIRawDocResponse(fileName: string, deploymentName: string, messages: messages, docLength: number, maxTokens:number, temperature:number, topP:number): Promise<any> {
    console.log("getAOAIRawDocResponse");
    const response = await fetch('/getAOAIRawDocResponse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileName: fileName,
                deploymentName: deploymentName,
                messages: messages,
                docLength: docLength,
                maxTokens: maxTokens,
                temperature: temperature,
                topP: topP
                })
        });
    return await response.json();
}


export async function getSummary (selectedFile: string, docLength: number, sentenceCount:number, useAbstractive: boolean) {
    const response = await fetch('/getSummary', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileName: selectedFile,
                docLength: docLength,
                sentenceCount: sentenceCount,
                useAbstractive: useAbstractive
                })
        });
    return await response.json();
}