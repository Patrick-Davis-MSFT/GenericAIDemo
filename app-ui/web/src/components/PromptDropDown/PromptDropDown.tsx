/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import { useState, useEffect, FormEvent } from "react";
import { Dropdown, IDropdownOption } from "@fluentui/react/lib/Dropdown";
import React from "react";
import { Stack, StackItem, TextField } from "@fluentui/react";
import { message, messages } from "../../api/models";

interface prompt {
  id: number;
  name: string;
  messages: messages;
}

export type promptArray = prompt[];

interface PromptDropdownProps {
  setPrompts: (promptId: string | number) => void;
  selMessages?: messages;
  setSelMessages: (messages: messages) => void;
  inPromptList?: promptArray
}

const defaultPromptList: promptArray = [
  {
    id: 1,
    name: "Text Generation",
    messages: [
      {
        role: "system",
        content:
          "You are a policy researcher skilled in writing comprehensive, informative reports in any language based on the following document.\n\n{{doc}}",
      },
      {
        role: "user",
        content:
          "Return a professional looking report in markdown with an appropriate title. The report contains the main points from the provided document. Include information about main topics: e.g. What is the reasoning? Why is this topic important? Include things like where, when, why, and who. Then include a summary of whether or not the topic and reasoning was impactful and why.",
      },
    ],
  },
  {
    id: 2,
    name: "Translation",
    messages: [
      {
        role: "system",
        content:
          "You are a language expert capable of translating from one language to another. Rewrite the user prompt in Greek.",
      },
      {
        role: "user",
        content:
          "While I was not trained to be an interpreter, I am very good at it.",
      },
    ],
  },
  {
    id: 3,
    name: "Summarization",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI assistant that writes comprehensive executive summaries at a user's request for the following text.\n\nText:\n\n{{doc}}",
      },
      {
        role: "user",
        content:
          "Draft an executive summary for the above State of the Union. Provide enough detail in the summary so I am aware of any important points that impact me as a policy researcher who helps the understand the exhibit. Return the summary as a markdown report.",
      },
    ],
  },
  {
    id: 4,
    name: "Content Extraction",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI assistant that extracts content from the document below and returns a JSON document with attribute and value pairs based on the user's request for later data mining processes.\n\ndocument:\n\n{{doc}}",
      },
      {
        role: "user",
        content:
          "From the document return a JSON object containing relevant properties for example:\n\ntopic, government and non-government agencies, impacted agencies, people, places, things, quotes, funding amounts, and other important properties needed for data mining.\n\nFormat dates as YYYY-MM-DD.",
      },
    ],
  },
  {
    id: 5,
    name: "Custom Messages for OpenAI",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI assistant that fulfills the users request in regards to the document.\n\n{{doc}}",
      },
      {
        role: "user",
        content: "Tell a joke based on a topic in the document",
      },
    ],
  },
];
export const PromptDropDown: React.FC<PromptDropdownProps> = ({
  setPrompts,
  setSelMessages,
  inPromptList,
}) => {
  const [promptOpt, setPromptOpt] = useState<IDropdownOption[]>([]); // Update the type of modelOpt
  const [selectedMessages, setSelectedMessages] = useState<messages>([]);
  const [sysMsg, setSysMsg] = useState<string>();
  const [usrMsg, setUsrMsg] = useState<string>();
  const [promptList, setPromptList] = useState<promptArray>(inPromptList? inPromptList: defaultPromptList);

  const ddSelectPrompt = (option?: IDropdownOption) => {
    if (option && option.key) {
      console.log(promptList[Number(option.key) - 1].messages);
      setSelectedMessages(promptList[Number(option.key) - 1].messages);
      setSelMessages(promptList[Number(option.key) - 1].messages);
      setPrompts(option.text);

      setSysMsg(
        promptList[Number(option.key) - 1].messages.filter(
          (i) => i.role === "system"
        )[0].content
      );
      setUsrMsg(
        promptList[Number(option.key) - 1].messages.filter(
          (i) => i.role === "user"
        )[0].content
      );
    }
  };

  const updateMessage = (
    event: FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string | undefined
  ): void => {
    const elementKey = (event.target as HTMLElement).getAttribute("data-key");
    if (elementKey === "system" && sysMsg) {
      setSysMsg(newValue || "");
    }
    if (elementKey === "user" && usrMsg) {
      setUsrMsg(newValue || "");
    }
    let tmpSel = selectedMessages;
    tmpSel.forEach((i) => {
      if (i.role === elementKey) {
        i.content = newValue || "";
      }
    });
    setSelectedMessages(tmpSel);
    setSelMessages(tmpSel);
  };

  useEffect(() => {

    if ((!promptOpt || promptOpt.length == 0) && promptList) {
      const temp = promptList.map((i) => {
        return { key: i.id, text: i.name };
      });
      console.log(temp);
      setPromptOpt(temp);
    }
  }, [promptOpt, promptList]);

  return (
    <Stack>
      <StackItem>
        <Dropdown
          placeholder="Select a Prompt"
          label="Prompt Use Cases"
          options={promptOpt}
          onChange={(_e, option) => ddSelectPrompt(option)}
        />
      </StackItem>
      {selectedMessages && selectedMessages.length > 0 ? (
        <>
          <StackItem>
            <TextField
              label="System Prompt"
              data-key="system"
              value={sysMsg}
              multiline
              rows={10}
              onChange={updateMessage}
            />
          </StackItem>
          <StackItem>
            <TextField
              label="User Prompt"
              data-key="user"
              value={usrMsg}
              multiline
              rows={4}
              onChange={updateMessage}
            />
          </StackItem>
        </>
      ) : (
        <></>
      )}
    </Stack>
  );
};
