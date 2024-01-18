/* eslint-disable no-inner-declarations */
import { useState, useEffect } from 'react';
import {  FileListResponse } from "../../api/models";
import { getFiles, getSummary } from '../../api';
import { DefaultButton, PrimaryButton, Slider, Spinner, SpinnerSize, Stack, Text, Toggle } from '@fluentui/react';
import { FileDropDown } from '../../components/FileDropDown/FileDropDown';
import { LangResult } from '../../components/LangResult/LangResult';


export default function Summarize() {
    const [selectedFile, setSelectedFile] = useState<string>();
    const [fileList, setFileList] = useState<FileListResponse>();
    const [sentenceCount, setSentenceCount] = useState<number>(20);
    const [useAbstractive, setUseAbstractive] = useState<boolean>(false);
    const [docLength, setDocLength] = useState<number>(125000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [langResult, setLangResult] = useState<any>();
    const [disableRunIt, setDisableRunIt] = useState<boolean>(false);

    const runLang = () => {
        async function fetchData() {
          if (selectedFile) {
            setDisableRunIt(true);
            const res = await getSummary(selectedFile, docLength, sentenceCount, useAbstractive);
            console.log(res);
            setLangResult(res);
            setDisableRunIt(false);
          }
        }
        fetchData();
      }

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
      const sliderOnChange = (value: number) => setDocLength(value);
      const onChangeSentenceCount = (value: number | undefined) => setSentenceCount(value ?? 20);
      const onSummaryTypeChange = (_ev: React.MouseEvent<HTMLElement>, checked?: boolean) => setUseAbstractive(checked ?? false);
    return (
        <div>
<h1 style={{ color: "black" }}>Summarization Demo </h1>
      <Stack tokens={{ childrenGap: 10, padding: 25 }}>
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
      <Stack tokens={{ childrenGap: 10, padding: 5 }}>
            <Stack.Item>
                <h2 style={{ color: "black" }}>2) Summarization Parameters</h2>
                </Stack.Item>
                <Stack.Item>
      <Text>This is the maximum number of characters used in the document.</Text>
      <Slider label="Document Cutoff Length" value={docLength} min={1000} max={125000} step={1000} defaultValue={125000} onChange={sliderOnChange} showValue snapToStep />
      </Stack.Item>
      <Stack.Item>
        <Text>Extractive summarization: Produces a summary by extracting salient sentences within the document.<br/> Abstractive summarization: Generates a summary that may not use the same words as those in the document, but captures the main idea.</Text>
        <Toggle label="Summarization Type" onText="Abstractive" offText="Extractive" onChange={onSummaryTypeChange} />
      </Stack.Item>
      <Stack.Item>
      <Text>Max Sentence Count for the Summary</Text>
      <Slider label="Max Sentence Count" disabled={useAbstractive} value={sentenceCount} min={1} max={20} step={1} defaultValue={20} onChange={onChangeSentenceCount} showValue snapToStep />
      </Stack.Item>
      </Stack>
      <Stack.Item>
      <h2 style={{ color: "black" }}>Summary Result: </h2>
      { langResult ? <LangResult res={langResult}/> : <></> }
      { !langResult && disableRunIt ? <Spinner size={SpinnerSize.large} /> : <></> }
      { langResult ? <></> :<PrimaryButton disabled={disableRunIt} text="Run it!" onClick={runLang} />}
      { langResult ? <DefaultButton text="Clear" onClick={() => {setLangResult(undefined); setDisableRunIt(false);}} /> : <></>}
      </Stack.Item>
      </Stack>
        </div>
    )
}   