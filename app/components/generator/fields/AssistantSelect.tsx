"use client";

import { Select } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import { useGeneratorFormContext } from "../GeneratorForm";
import type { Assistant } from "@/lib/api/types";

export const AssistantSelect = () => {
  const form = useGeneratorFormContext();

  const { data: assistants, isError } = useQuery({
    queryKey: ["assistants"],
    queryFn: () =>
      apiJson<{ assistants: Assistant[] }>("/chat/temporary/assistants"),
    select: (data) =>
      data.assistants.map((assistant) => ({
        value: assistant.id,
        label: assistant.name,
      })),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Select
      label="Assistant"
      placeholder="Select assistant"
      data={assistants ?? []}
      withAsterisk
      key={form.key("assistant_id")}
      {...form.getInputProps("assistant_id")}
      error={
        isError
          ? "Failed to load assistants"
          : form.getInputProps("assistant_id").error
      }
    />
  );
};
