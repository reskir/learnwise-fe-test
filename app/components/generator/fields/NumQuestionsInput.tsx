"use client";

import { NumberInput } from "@mantine/core";
import { useGeneratorFormContext } from "../GeneratorForm";

export const NumQuestionsInput = () => {
  const form = useGeneratorFormContext();

  return (
    <NumberInput
      label="Number of questions"
      min={1}
      max={3}
      {...form.getInputProps("numQuestions")}
    />
  );
};
