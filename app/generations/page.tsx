"use client";

import { useState } from "react";
import { Stack, Text } from "@mantine/core";
import { GenerationsFiltersPanel } from "@/app/components/generations/GenerationsFilters";
import { GenerationsList } from "@/app/components/generations/GenerationsList";
import type { GenerationsFilters } from "@/lib/api/types";

export default function GenerationsPage() {
  const [filters, setFilters] = useState<GenerationsFilters>({});

  return (
    <Stack gap="md" maw={900} mx="auto">
      <Text fw={700} size="lg" style={{ letterSpacing: "-0.02em" }}>
        Generation History
      </Text>

      <GenerationsFiltersPanel filters={filters} onChange={setFilters} />
      <GenerationsList filters={filters} />
    </Stack>
  );
}
