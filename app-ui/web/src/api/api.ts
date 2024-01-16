import {About, DeploymentListResponse, FileListResponse, messages } from './models';

export async function getAbout(): Promise<About> {
    const response = await fetch('/about');
    return await response.json();
}

export async function getDeployments(): Promise<DeploymentListResponse> {
    const response = await fetch('/getDeploymentInfo');
    return await response.json();
}

export async function getFiles(): Promise<FileListResponse> {
    const response = await fetch('/getFiles');
    return await response.json();
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAOAIResponse(fileName: string, deploymentName: string, messages: messages): Promise<any> {
    const response = await fetch('/getAOAIResponse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileName: fileName,
                deploymentName: deploymentName,
                messages: messages
                })
        });
    return await response.json();
}