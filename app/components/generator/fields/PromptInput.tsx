"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Textarea } from "@mantine/core";
import debounce from "lodash.debounce";
import { useGeneratorFormContext } from "../GeneratorForm";

const DEBOUNCE_MS = 2000;

export const PromptInput = () => {
  const form = useGeneratorFormContext();
  const [localValue, setLocalValue] = useState(form.getValues().prompt);

  const flushToForm = useCallback(
    (value: string) => {
      form.setFieldValue("prompt", value);
    },
    [form],
  );

  const debouncedFlush = useMemo(
    () => debounce((value: string) => flushToForm(value), DEBOUNCE_MS),
    [flushToForm],
  );

  // Cancel debounce on unmount
  useEffect(() => {
    return () => debouncedFlush.cancel();
  }, [debouncedFlush]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.currentTarget.value;
      setLocalValue(value);
      debouncedFlush(value);
      if (value.trim() && form.errors.prompt) {
        form.clearFieldError("prompt");
      }
    },
    [debouncedFlush, form],
  );

  // Sync from form → local when form resets (prompt becomes "")
  form.watch("prompt", ({ value }) => {
    if (value === "") {
      setLocalValue("");
    }
  });

  const inputProps = form.getInputProps("prompt");

  return (
    <Textarea
      label="Prompt"
      placeholder="Enter your prompt for generating quiz questions..."
      minRows={3}
      withAsterisk
      key={form.key("prompt")}
      value={localValue}
      onChange={handleChange}
      error={inputProps.error}
      onBlur={() => {
        debouncedFlush.cancel();
        flushToForm(localValue);
        inputProps.onBlur?.();
      }}
    />
  );
};
