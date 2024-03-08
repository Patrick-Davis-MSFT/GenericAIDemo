import { Dropdown, IDropdownOption, Stack } from "@fluentui/react";
import React, { useState, useEffect } from "react";

interface callType {
  type: string;
  api: string[];
  allowedModels: string[];
}
const callTypes: callType[] = [
  {
    type: "Completion",
    api: [
      "2022-12-01",
      "2023-05-15",
      "2023-06-01-preview",
      "2024-02-15-preview",
      "2024-03-01-preview",
    ],
    allowedModels: ["gpt-35-turbo", "gpt-35-turbo-16k", "gpt-4", "gpt-4-32k"],
  },
  {
    type: "Embedding",
    api: [
      "2023-05-15",
      "2023-06-01-preview",
      "2024-02-15-preview",
      "2024-03-01-preview",
    ],
    allowedModels: [
      "text-embedding-ada-002",
      "text-embedding-3-large",
      "text-embedding-3-small",
    ],
  },
  {
    type: "Chat Completion Data",
    api: [
      "2023-05-15",
      "2023-06-01-preview",
      "2024-02-15-preview",
      "2024-03-01-preview",
    ],
    allowedModels: ["gpt-35-turbo", "gpt-35-turbo-16k", "gpt-4", "gpt-4-32k"],
  },
  {
    type: "Chat Completion Functions",
    api: ["2023-12-01-preview"],
    allowedModels: ["gpt-35-turbo", "gpt-35-turbo-16k", "gpt-4", "gpt-4-32k"],
  },
];

interface AOAIAPIProps {
  setCallType: (callType: string) => void;
  setCallAPI: (callAPI: string) => void;
}
export const AOAIAPI: React.FC<AOAIAPIProps> = ({
  setCallType,
  setCallAPI,
}) => {
  const [callTypeOpt, setCallTypeOpt] = useState<IDropdownOption[]>([]);
  const [selectedCallType, setSelectedCallType] = useState<callType>();
  const [apiTypeOpt, setApiTypeOpt] = useState<IDropdownOption[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selCallAPIOpt, setSelCallAPIOpt] = useState<string>();

  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let tmp: IDropdownOption[] = [];
    callTypes.forEach((x) => {
      tmp.push({ key: x.type, text: x.type });
    });
    setCallTypeOpt(tmp);
  }, [callTypeOpt.length]);

  useEffect(() => {
    if (selectedCallType) {
      // eslint-disable-next-line prefer-const
      let tmp: IDropdownOption[] = [];
      console.log(selectedCallType);
      callTypes
        .filter((i) => {
          if(i.type == selectedCallType.type) {return true;}
        })[0]
        .api.forEach((x) => {
          tmp.push({ key: x, text: x });
        });
      setApiTypeOpt(tmp);
    }
  }, [selectedCallType, apiTypeOpt]);

  const ddSelectType = (option?: IDropdownOption) => {
    if (option && option.key) {
      const tmpselectedCallType = callTypes.find((x) => x.type === option.text);
      setSelectedCallType(tmpselectedCallType);
      setCallType(option.key.toString());
    }
  };

  const ddSelectAPI = (option?: IDropdownOption) => {
    if (option && option.key) {
      setSelCallAPIOpt(option.text);
      setCallAPI(option.text);
    }
  };

  return (
    <>
      <Stack.Item>
        <Dropdown
          placeholder="Select an option"
          label="Call Type"
          options={callTypeOpt}
          onChange={(_e, option) => ddSelectType(option)}
        />
      </Stack.Item>
      {selectedCallType ? (
        <Stack.Item>
          <Dropdown
            placeholder="Select an option"
            label="Avaiable APIs"
            options={apiTypeOpt}
            onChange={(_e, option) => ddSelectAPI(option)}
          />{" "}
        </Stack.Item>
      ) : (
        <></>
      )}
    </>
  );
};
