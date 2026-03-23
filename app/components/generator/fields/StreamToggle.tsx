"use client";

import { Switch } from "@mantine/core";
import { useGeneratorFormContext } from "../GeneratorForm";

export const StreamToggle = () => {
  const form = useGeneratorFormContext();

  return (
    <Switch
      label="Enable streaming"
      key={form.key("isStreamed")}
      {...form.getInputProps("isStreamed", { type: "checkbox" })}
    />
  );
};
