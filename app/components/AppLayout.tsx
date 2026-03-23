"use client";

import type { ReactNode } from "react";
import { AppShell } from "@mantine/core";
import { Navigation } from "@/app/components/Navigation";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Navigation />
      </AppShell.Header>
      <AppShell.Main id="main-content">{children}</AppShell.Main>
    </AppShell>
  );
}
