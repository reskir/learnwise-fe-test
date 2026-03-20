"use client";

import { useState } from "react";
import { AppShell, Stack, Text } from "@mantine/core";
import { Navigation } from "@/app/components/Navigation";
import { GenerationsFiltersPanel } from "@/app/components/generations/GenerationsFilters";
import { GenerationsList } from "@/app/components/generations/GenerationsList";
import type { GenerationsFilters } from "@/lib/api/types";

export default function GenerationsPage() {
  const [filters, setFilters] = useState<GenerationsFilters>({});

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Navigation />
      </AppShell.Header>

      <AppShell.Main>
        <Stack gap="lg" maw={900} mx="auto">
          <Text component="h1" size="xl" fw={700}>
            Generation History
          </Text>

          <GenerationsFiltersPanel filters={filters} onChange={setFilters} />
          <GenerationsList filters={filters} />
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}
