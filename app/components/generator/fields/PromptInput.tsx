"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
    [form]
  );

  const debouncedFlush = useMemo(
    () => debounce((value: string) => flushToForm(value), DEBOUNCE_MS),
    [flushToForm]
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
    },
    [debouncedFlush]
  );

  // Sync from form → local when form resets or external changes
  const formValue = form.getValues().prompt;
  useEffect(() => {
    if (formValue !== localValue && formValue === "") {
      setLocalValue("");
    }
  }, [formValue]);

  return (
    <Textarea
      label="Prompt"
      placeholder="Enter your prompt for generating quiz questions..."
      minRows={3}
      required
      aria-required
      value={localValue}
      onChange={handleChange}
      error={form.errors.prompt}
      // Flush immediately on blur so form has latest value before submit
      onBlur={() => {
        debouncedFlush.cancel();
        flushToForm(localValue);
      }}
    />
  );
};
