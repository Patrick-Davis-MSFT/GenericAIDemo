import { Callout, FontWeights, Stack, TextField, mergeStyleSets, Text } from "@fluentui/react";
import React, { FormEvent, useState } from "react";
import {  useId } from '@fluentui/react-hooks';

const styles = mergeStyleSets({
    button: {
      width: 130,
    },
    callout: {
      width: 320,
      maxWidth: '90%',
      padding: '20px 24px',
    },
    title: {
      marginBottom: 12,
      fontWeight: FontWeights.semilight,
    },
    link: {
      display: 'block',
      marginTop: 20,
    },
  });
  

const AOAIPrompt: React.FC = () => {
  const [value, setValue] = useState("");
  const [isValidJson, setIsValidJson] = useState(true);

  const handleChange = (
    _event: FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string | undefined
  ): void => {
    if (!newValue) {
      return;
    }
    setValue(newValue);
    try {
      JSON.parse(newValue);
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
  };

  const inputId = useId('input-prompt');
  const labelId = useId('callout-label');
  const descriptionId = useId('callout-description');

  return (
    <div>
        
      <Stack.Item>
      {!isValidJson && <div>Invalid JSON</div>}
      {!isValidJson && (
        <Callout
          className={styles.callout}
          ariaLabelledBy={labelId}
          ariaDescribedBy={descriptionId}
          role="dialog"
          gapSpace={0}
          target={`#${inputId}`}
          setInitialFocus
        >
          <Text as="h1" block variant="xLarge" className={styles.title} id={labelId}>
            Invalid Json
          </Text>
          <Text block variant="small" id={descriptionId}>
            The JSON Entered is invalid
          </Text>
        </Callout>
      )}
        <TextField
            id={inputId}
          label="System Prompt"
          data-key="system"
          value={value}
          multiline
          rows={10}
          onChange={handleChange}
        />
      </Stack.Item>
    </div>
  );
};

export default AOAIPrompt;
