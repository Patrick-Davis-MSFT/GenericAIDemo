/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-inner-declarations */
import {useState, useEffect} from 'react';
import { getDeployments, getFiles } from '../api';
import { DeploymentListResponse, FileListResponse, messages } from "../api/models";
import {ModelDropDown}  from '../components/ModelDropDown/ModelDropDown';
import React from 'react';
import { FileDropDown } from '../components/FileDropDown/FileDropDown';
import { PromptDropDown } from '../components/PromptDropDown/PromptDropDown';
import { PrimaryButton } from '@fluentui/react';

export default function blankPage() {

    const [deploymentListResponse, setDeploymentListResponse] = useState<DeploymentListResponse>();
    const [selectedDeployment, setSelectedDeployment] = useState<string>();
    const [selectedFile, setSelectedFile] = useState<string>();
    const [fileList, setFileList] = useState<FileListResponse>();
    const [selectedPrompt, setSelectedPrompt] = useState<string | number>();
    const [selMessages, setSelMessages] = useState<messages>();
    useEffect(() => {
        if(!deploymentListResponse) {
            async function fetchData() {
                            const res = await getDeployments();
                            console.log(res);
                            setDeploymentListResponse(res);
                        }
            fetchData();
        }
    }, [deploymentListResponse]);

    useEffect(() => {  
        if(!fileList) {
            async function fetchData() {
                const res = await getFiles();
                console.log(res);
                setFileList(res);
            }
            fetchData();
        }
    }, [fileList]);

    const runAOAI = () => {
        alert("Running");
    }
    return (
        <div>
            <h1 style={{ color: "black"}}>Azure Open AI Demo </h1>
            <h2 style={{ color: "black"}}>1) {selectedFile? (<span>File Selected: {selectedFile}</span>) : " Pick a File"}</h2>
            <FileDropDown fileList={fileList} setFile={setSelectedFile}/>
            <h2 style={{ color: "black"}}>2)  {selectedDeployment? (<span>Model Selected: {selectedDeployment}</span>) : " Pick A Model"}</h2>
            <ModelDropDown aoaiModel={deploymentListResponse} setSelDep={setSelectedDeployment}/>
            <h2 style={{ color: "black"}}>3) {selectedPrompt? (<span>Prompt Selected: {selectedPrompt}</span>) : " Pick The Prompt" } </h2>
            <span>The two keywords are 'doc' for the contents of the document selected above and 'docName' for the document name. Place the variables inside double currly braces.</span>
            <PromptDropDown setPrompts={setSelectedPrompt} setSelMessages={setSelMessages} selMessages={selMessages}/>
            <h2 style={{ color: "black"}}>Result: </h2>
            <PrimaryButton text="Run it!" onClick={runAOAI}/>
        </div>
    )
}   