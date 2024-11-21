/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-inner-declarations */
import React, { useState, useEffect } from 'react';
import FileUpload from '../../components/FileUpload/FileUpload';
import { getAOAIRawDocResponse, getDeployments, getUploadedFiles } from '../../api/api';
import { DeploymentListResponse, FileListResponse, messages } from '../../api/models';
import { FileDropDown } from '../../components/FileDropDown/FileDropDown';
import { DefaultButton, PrimaryButton, Slider, Spinner, SpinnerSize, Stack, Text } from '@fluentui/react';
import { ModelDropDown } from '../../components/ModelDropDown/ModelDropDown';
import { promptArray, PromptDropDown } from '../../components/PromptDropDown/PromptDropDown';
import AOAIResults from '../../components/AOAIResult/AOAIResult';

const promptList: promptArray = [
    {
        id: 1,
        name: "Explain This Document",
        messages: [
          {
            role: "system",
            content:
              "You are a document helper skilled in deciphering complext writing and explaining the conscepts at tha third grade level. Only use the information and concepts in the associated document below \n\n Document is as follows: \n\n{{doc}}",
          },
          {
            role: "user",
            content:
              "I do not understand this document explain it to me. Also tell me any actions that I need to take due that are included in this document. Include information about main topics: e.g. What is the reasoning? Why is this topic important? Include things like where, when, why, and who. Then include a summary of whether or not the topic and reasoning will effect me and why.",
          },
        ],
      },
      {
        id: 2,
        name: "Explain This Legal Document",
        messages: [
          {
            role: "system",
            content:
              "You are a legal document helper skilled in deciphering complext writing and explaining the conscepts at tha third grade level. Only use the information and concepts in the associated document below \n\n Document is as follows: \n\n{{doc}}",
          },
          {
            role: "user",
            content:
              "I do not understand this legal document that I recieved explain it to me. Also tell me any actions that I need to take due that are included in this document. Also explain what are the consiquences that can happen if I do not follow the instructions. Include information about main topics: e.g. What is the reasoning? Why is this topic important? Include things like where, when, why, and who. Then include a summary of whether or not the topic and reasoning will effect me and why.",
          },
        ],
      }];

export default function DocExplainer() {
    // Select the deployment
  const [deploymentListResponse, setDeploymentListResponse] =
  useState<DeploymentListResponse>();
const [selectedDeployment, setSelectedDeployment] = useState<string>();

useEffect(() => {
    if (!deploymentListResponse) {
      async function fetchData() {
        const res = await getDeployments();
        console.log(res);
        setDeploymentListResponse(res);
      }
      fetchData();
    }
  }, [deploymentListResponse]);

  //Select the prompt
  const [selectedPrompt, setSelectedPrompt] = useState<string | number>();
  const [selMessages, setSelMessages] = useState<messages>();

    const [selectedFile, setSelectedFile] = useState<string>();
    const [fileList, setFileList] = useState<FileListResponse>(); useEffect(() => {
        if (!fileList) {
            async function fetchData() {
                const res = await getUploadedFiles();
                console.log(res);
                setFileList(res);
            }
            fetchData();
        }
    }, [fileList]);

  //set the AOAI parameters  
  const [docLength, setDocLength] = useState<number>(128000);
  const [maxTokens, setMaxTokens] = useState<number>(4200);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [topP, setTopP] = useState<number>(0);
  const sliderOnChange = (value: number) => setDocLength(value);
  const onChangeMaxTokens = (value: number) => setMaxTokens(value);
  const onChangeTempature = (value: number) => setTemperature(value);
  const onChangeTopP = (value: number) => setTopP(value);

  //Run the AOAI components
  const [disableRunIt, setDisableRunIt] = useState<boolean>(false);
  const [aoaiResult, setAoaiResult] = useState<any>();
  const runAOAI = () => {
    async function fetchData() {
      if (selectedFile && selectedDeployment && selMessages) {
        setDisableRunIt(true);
        const res = await getAOAIRawDocResponse(
          selectedFile,
          selectedDeployment,
          selMessages,
          docLength,
          maxTokens,
          temperature,
          topP
        );
        console.log("Chat Respose");
        console.log(res);
        setAoaiResult(res);
      } else {
        setAoaiResult("Please select a file, model, and prompt");
        setDisableRunIt(false);
      }
    }
    fetchData();
  };


    return (
        <div>
            <Stack>      
                  <Stack.Item align="center">
          <Text variant="mega" style={{ color: "black" }}>
            Document Explainer Demo
          </Text>
        </Stack.Item>
        </Stack>
        <Stack tokens={{ childrenGap: 10, padding: 25 }}>
            <Stack.Item>
            <Text>
              This demo allows the user to upload a existing document and ask questions about the document. 
              Allowed file types are those types supported by document intellegence and images if using GPT-4o
              and other omni LLMs. 
            </Text>
            </Stack.Item>
                <Stack.Item>
                    <FileUpload />
                </Stack.Item>
                <Stack.Item>
          <h2 style={{ color: "black" }}>
                        {selectedDeployment ? (
              <span>Model Selected: {selectedDeployment}</span>
            ) : (
              " Pick A Model"
            )}
          </h2>
          <ModelDropDown
            aoaiModel={deploymentListResponse}
            setSelDep={setSelectedDeployment}
          />
        </Stack.Item>
                <Stack.Item>
                    <FileDropDown fileList={fileList} setFile={setSelectedFile} />
                </Stack.Item>     
                   <Stack.Item>
          <h2 style={{ color: "black" }}>
           
            {selectedPrompt ? (
              <span>Prompt Selected: {selectedPrompt}</span>
            ) : (
              " Pick The Prompt"
            )}{" "}
          </h2>
          <span>
            The two keywords are 'doc' for the contents of the document selected
            above and 'docName' for the document name. Place the variables
            inside double currly braces.
          </span>
          <PromptDropDown
            setPrompts={setSelectedPrompt}
            setSelMessages={setSelMessages}
            selMessages={selMessages}
            inPromptList={promptList}
          />
        </Stack.Item>
        <Stack.Item>
        <Stack tokens={{ childrenGap: 10, padding: 5 }}>
            <Stack.Item>
              <h2 style={{ color: "black" }}>AOAI Parameters</h2>
            </Stack.Item>
            <Stack.Item>
              <Text>
                This is the maximum number of characters used in the document.
              </Text>
              <Slider
                label="Document Cutoff Length"
                value={docLength}
                min={1000}
                max={128000}
                step={1000}
                defaultValue={128000}
                onChange={sliderOnChange}
                showValue
                snapToStep
              />
            </Stack.Item>
            <Stack.Item>
              <Text>
                The maximum number of tokens to generate. Requests can use up to
                4096 tokens shared between the prompt and completion.
              </Text>
              <Slider
                label="Max Tokens"
                value={maxTokens}
                min={100}
                max={5000}
                step={100}
                defaultValue={5000}
                onChange={onChangeMaxTokens}
                showValue
                snapToStep
              />
            </Stack.Item>
            <Stack.Item>
              <Text>
                Controls the randomness of the output. A higher value (closer to
                1) makes the output more random, while a lower value (closer to
                0) makes it more deterministic.
              </Text>
              <Slider
                label="Temperature"
                value={temperature}
                min={0.0}
                max={1}
                step={0.1}
                defaultValue={0.5}
                onChange={onChangeTempature}
                showValue
                snapToStep
              />
            </Stack.Item>
            <Stack.Item>
              <Text>
                An alternative to temperature for controlling randomness. It
                specifies the cumulative probability cutoff for token selection.
                Only tokens with cumulative probability less than top_p are
                considered for selection.
              </Text>
              <Slider
                label="Top P"
                value={topP}
                min={0}
                max={1}
                step={0.1}
                defaultValue={0}
                onChange={onChangeTopP}
                showValue
                snapToStep
              />
            </Stack.Item>
          </Stack>
            </Stack.Item>
            <Stack.Item>
          <h2 style={{ color: "black" }}>Result: </h2>
          {aoaiResult ? <AOAIResults res={aoaiResult} /> : <></>}
          {!aoaiResult && disableRunIt ? (
            <Spinner size={SpinnerSize.large} />
          ) : (
            <></>
          )}
          {aoaiResult ? (
            <></>
          ) : (
            <PrimaryButton
              disabled={disableRunIt}
              text="Run it!"
              onClick={runAOAI}
            />
          )}
          {aoaiResult ? (
            <DefaultButton
              text="Clear"
              onClick={() => {
                setAoaiResult(undefined);
                setDisableRunIt(false);
              }}
            />
          ) : (
            <></>
          )}
        </Stack.Item>
            </Stack>
        </div>
    )
}   