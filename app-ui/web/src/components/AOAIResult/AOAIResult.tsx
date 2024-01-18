/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Text, Stack } from "@fluentui/react";
import ReactMarkdown from "react-markdown";

interface ResProps {
  res: {
    error?: string;
    id?: string;
    choices?: Array<any>;
    created?: number;
    model?: string;
    object?: string;
    system_fingerprint?: any;
    usage?: {
      completion_tokens: number;
      prompt_tokens: number;
      total_tokens: number;
    };
    prompt_filter_results?: Array<any>;
  };
}

export const AOAIResults: React.FC<ResProps> = ({ res }) => {
  if (res.error) {
    return (
      <Stack tokens={{ childrenGap: 10 }}>
        <Text variant="large">AOAI Error</Text>
        <Text>Error: {res.error}</Text>
      </Stack>
    );
  }
  if (!res || !res.usage || !res.choices || !res.prompt_filter_results) {
    return (
      <Stack tokens={{ childrenGap: 10 }}>
        <Text variant="large">Response Details</Text>
        <Text>No response selected</Text>
      </Stack>
    );
  }
  let dateString: string | undefined = res.created?.toString();
  if (res.created) {
    const timestamp = res.created;
    const date = new Date(timestamp * 1000);
    dateString = date.toLocaleString();
  }
  return (
    <Stack tokens={{ childrenGap: 10 }}>
      <Text variant="large">Response Details</Text>
      <Text>ID: {res.id}</Text>
      <Text>Created: {dateString}</Text>
      <Text>Model: {res.model}</Text>
      <Text>Object: {res.object}</Text>
      <Text>System Fingerprint: {res.system_fingerprint}</Text>
      <Text variant="mediumPlus">Choices</Text>
      {res.choices.map((choice, index) => (
        <Stack key={index} tokens={{ childrenGap: 5 }}>
          <Text style={{ fontWeight: "bold", color: "darkblue" }}>
            Message Content Below:
          </Text>
          <div
            style={{
              border: "1px solid black",
              padding: 25,
              borderRadius: 15,
              margin: 5,
              backgroundColor: "#e6e6e6",
            }}
          >
            <ReactMarkdown>{choice.message.content}</ReactMarkdown>
          </div>
          <Text>Finish Reason: {choice.finish_reason}</Text>
          <Text>Index: {choice.index}</Text>
          <Text>Message Role: {choice.message.role}</Text>
          <Text>
            Hate: Filtered:{" "}
            {choice.content_filter_results.hate.filtered ? "true" : "false"}
          </Text>
          <Text>
            Hate: Severity: {choice.content_filter_results.hate.severity}
          </Text>
          <Text>
            Self Harm: Filtered:{" "}
            {choice.content_filter_results.self_harm.filtered
              ? "true"
              : "false"}
          </Text>
          <Text>
            Self Harm: Severity:{" "}
            {choice.content_filter_results.self_harm.severity}
          </Text>
          <Text>
            Sexual: Filtered:{" "}
            {choice.content_filter_results.sexual.filtered ? "true" : "false"}
          </Text>
          <Text>
            Sexual: Severity: {choice.content_filter_results.sexual.severity}
          </Text>
          <Text>
            Violence: Filtered:{" "}
            {choice.content_filter_results.violence.filtered ? "true" : "false"}
          </Text>
          <Text>
            Violence: Severity:{" "}
            {choice.content_filter_results.violence.severity}
          </Text>
        </Stack>
      ))}
      <Text variant="mediumPlus">Prompt Filter Results</Text>
      {res.prompt_filter_results.map((result, index) => (
        <Stack key={index} tokens={{ childrenGap: 5, padding: 10 }}>
          <Text>Prompt Index: {result.prompt_index}</Text>
          <Text>
            Hate: Filtered:{" "}
            {result.content_filter_results.hate.filtered ? "true" : "false"}
          </Text>
          <Text>
            Hate: Severity: {result.content_filter_results.hate.severity}
          </Text>
          <Text>
            Self Harm: Filtered:{" "}
            {result.content_filter_results.self_harm.filtered
              ? "true"
              : "false"}
          </Text>
          <Text>
            Self Harm: Severity:{" "}
            {result.content_filter_results.self_harm.severity}
          </Text>
          <Text>
            Sexual: Filtered:{" "}
            {result.content_filter_results.sexual.filtered ? "true" : "false"}
          </Text>
          <Text>
            Sexual: Severity: {result.content_filter_results.sexual.severity}
          </Text>
          <Text>
            Violence: Filtered:{" "}
            {result.content_filter_results.violence.filtered ? "true" : "false"}
          </Text>
          <Text>
            Violence: Severity:{" "}
            {result.content_filter_results.violence.severity}
          </Text>
        </Stack>
      ))}
      <Stack tokens={{ childrenGap: 5 }}>
        <Text variant="mediumPlus">Usage</Text>
        <Text>Completion Tokens: {res.usage.completion_tokens}</Text>
        <Text>Prompt Tokens: {res.usage.prompt_tokens}</Text>
        <Text>Total Tokens: {res.usage.total_tokens}</Text>
      </Stack>
    </Stack>
  );
};

export default AOAIResults;
