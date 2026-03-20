"use client";

import { useMemo } from "react";
import { Select } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/AuthProvider";
import { apiJson } from "@/lib/api/client";
import { useGeneratorFormContext } from "../GeneratorForm";
import type { Assistant } from "@/lib/api/types";

export const AssistantSelect = () => {
  const { token } = useAuth();
  const form = useGeneratorFormContext();

  const { data: assistants } = useQuery({
    queryKey: ["assistants"],
    queryFn: () => apiJson<{ assistants: Assistant[] }>("/chat/temporary/assistants", token!),
    enabled: !!token,
    select: (data) => data.assistants,
  });

  const selectData = useMemo(
    () => assistants?.map((a) => ({ value: a.id, label: a.name })) ?? [],
    [assistants]
  );

  return (
    <Select
      label="Assistant"
      placeholder="Select assistant"
      data={selectData}
      required
      aria-required
      {...form.getInputProps("assistant_id")}
    />
  );
};
