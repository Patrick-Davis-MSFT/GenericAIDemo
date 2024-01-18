/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Text, Stack } from "@fluentui/react";

interface LangResultProps {
  res: { summary?: string; error?: string };
}

export const LangResult: React.FC<LangResultProps> = ({ res }) => {
  if (res.error) {
    return (
      <Stack tokens={{ childrenGap: 10 }}>
        <Text variant="large">Summarization Error</Text>
        <Text>Error: {res.error}</Text>
      </Stack>
    );
  }
  return (
    <Stack tokens={{ childrenGap: 10 }}>
      <Text variant="large">Response Details</Text>
      <div
            style={{
              border: "1px solid black",
              padding: 25,
              borderRadius: 15,
              margin: 5,
              backgroundColor: "#e6e6e6",
            }}
          >
      <Text>{res.summary?.trim()}</Text>
      </div>
    </Stack>
  );
};
