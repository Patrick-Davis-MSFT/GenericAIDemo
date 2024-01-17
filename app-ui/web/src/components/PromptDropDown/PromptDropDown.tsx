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

type promptArray = prompt[];

interface PromptDropdownProps {
  setPrompts: (promptId: string | number) => void;
  selMessages?: messages;
  setSelMessages: (messages: messages) => void;
}

const promptList: promptArray = [
  {
    id: 1,
    name: "Text Generation",
    messages: [
      {
        role: "system",
        content:
          "You are a historian skilled in writing comprehensive, informative reports in any language.",
      },
      {
        role: "user",
        content:
          "Return a professional looking report in markdown titled, 'Fifty-five from five'. The report contains the first 55 words from five famous speeches. Include information about each speech: e.g. What were the conditions like? Why was the speech made? Include things like where, when, why, and who. Then include a summary of whether or not the speech was impactful and why.",
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
          "Draft an executive summary for the above state of the union Provide enough detail in the summary so I am aware of any important points that impact me as a us citizen who helps the government implement policy. Return the summary as a markdown report.",
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
          "You are a helpful AI assistant that extracts content from the LEASE below and returns a JSON document with attribute and value pairs based on the user's request.\n\nLease:\n\n{{doc}}",
      },
      {
        role: "user",
        content:
          "From the lease return a JSON object containing:\n\nLessor, Lessee, Property Address, Property Description, Net Size of Property, Net Size of Property Units, Gross Size of Property, Gross Size of Property Units, Contract Start Date, Lease Start Date, Lease End Date, Lease Term (include the units), Monthly Lease Amount (include currency), Payment Frequency, Payment Address.\n\nFormat dates as YYYY-MM-DD.",
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
}) => {
  const [promptOpt, setPromptOpt] = useState<IDropdownOption[]>([]); // Update the type of modelOpt
  const [selectedMessages, setSelectedMessages] = useState<messages>([]);
  const [sysMsg, setSysMsg] = useState<string>();
  const [usrMsg, setUsrMsg] = useState<string>();

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
  }, [promptOpt]);

  return (
    <Stack>
      <StackItem>
        <Dropdown
          placeholder="Select a Prompt"
          label="Prompt Use Cases"
          options={promptOpt}
          onChange={(e, option) => ddSelectPrompt(option)}
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
