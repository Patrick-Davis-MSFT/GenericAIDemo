/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-inner-declarations */
import { useState, useEffect } from "react";
import { getAOAIResponse, getAOAIService, getDeployments, getFiles } from "../api";
import {
  AOAIListResponse,
  AOAISetting,
  DeploymentListResponse,
  FileListResponse,
  messages,
} from "../api/models";
import { ModelDropDown } from "../components/ModelDropDown/ModelDropDown";
import React from "react";
import { FileDropDown } from "../components/FileDropDown/FileDropDown";
import { PromptDropDown } from "../components/PromptDropDown/PromptDropDown";
import {
  DefaultButton,
  PrimaryButton,
  Slider,
  Spinner,
  SpinnerSize,
  Stack,
  Text,
} from "@fluentui/react";
import { AOAIResults } from "../components/AOAIResult/AOAIResult";
import { ServiceDropDown } from "../components/AOAIServiceDropdown/AOAIServiceDropdown";

export default function blankPage() {
  const [deploymentListResponse, setDeploymentListResponse] =
    useState<DeploymentListResponse>();
  const [selectedDeployment, setSelectedDeployment] = useState<string>();
  const [selectedFile, setSelectedFile] = useState<string>();
  const [fileList, setFileList] = useState<FileListResponse>();
  const [selectedPrompt, setSelectedPrompt] = useState<string | number>();
  const [selMessages, setSelMessages] = useState<messages>();
  const [aoaiResult, setAoaiResult] = useState<any>();
  const [docLength, setDocLength] = useState<number>(10000);
  const [maxTokens, setMaxTokens] = useState<number>(4000);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [topP, setTopP] = useState<number>(0);
  const [disableRunIt, setDisableRunIt] = useState<boolean>(false);
  
  const [selAOAIService, setSelAOAIService] = useState<AOAISetting>();
  const [serviceList, setServiceList] = useState<AOAIListResponse>();

  
  useEffect(() => {
    if (!serviceList) {
      async function fetchData() {
        const res = await getAOAIService();
        console.log(res);
        setServiceList(res);
      }
      fetchData();
    }
  }, [serviceList]);
  
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

  useEffect(() => {
    if (!fileList) {
      async function fetchData() {
        const res = await getFiles();
        console.log(res);
        setFileList(res);
      }
      fetchData();
    }
  }, [fileList]);

  const runAOAI = () => {
    async function fetchData() {
      if (selectedFile && selectedDeployment && selMessages) {
        setDisableRunIt(true);
        const res = await getAOAIResponse(
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

  const sliderOnChange = (value: number) => setDocLength(value);
  const onChangeMaxTokens = (value: number) => setMaxTokens(value);
  const onChangeTempature = (value: number) => setTemperature(value);
  const onChangeTopP = (value: number) => setTopP(value);

  return (
    <div>
      <Stack>
        <Stack.Item align="center">
          <Text variant="mega" style={{ color: "black" }}>
            Azure Open AI Demo
          </Text>
        </Stack.Item>
      </Stack>
      <Stack tokens={{ childrenGap: 10, padding: 25 }}>
      { true ? <></>: (
      <Stack.Item>
         <h2 style={{ color: "black" }}>
            (ToDo){" "}
            {selAOAIService ? (
              <span>Service Selected: {selAOAIService?.name} ({selAOAIService?.id})</span>
            ) : (
              "Pick an AOAI Service"
            )}
          </h2>
          <ServiceDropDown serviceList={serviceList} setAOAIService={setSelAOAIService} />
        </Stack.Item>)}
        <Stack.Item>
          <h2 style={{ color: "black" }}>
            1){" "}
            {selectedFile ? (
              <span>File Selected: {selectedFile}</span>
            ) : (
              " Pick a File"
            )}
          </h2>
          <FileDropDown fileList={fileList} setFile={setSelectedFile} />
        </Stack.Item>
        <Stack.Item>
          <h2 style={{ color: "black" }}>
            2){" "}
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
          <h2 style={{ color: "black" }}>
            3){" "}
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
          />
        </Stack.Item>
        <Stack.Item>
          <Stack tokens={{ childrenGap: 10, padding: 5 }}>
            <Stack.Item>
              <h2 style={{ color: "black" }}>4) AOAI Parameters</h2>
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
                max={128000}
                step={100}
                defaultValue={128000}
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
  );
}
