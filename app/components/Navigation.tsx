"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Group, Text, UnstyledButton } from "@mantine/core";

const links = [
  { href: "/", label: "Generator" },
  { href: "/generations", label: "History" },
];

type NavigationProps = {
  children?: ReactNode;
};

export function Navigation({ children }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation">
      <Group
        h={60}
        px="md"
        justify="space-between"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--card)",
        }}
      >
        <Group gap="xs">
          <Text
            fw={800}
            size="md"
            style={{
              letterSpacing: "-0.02em",
              color: "var(--primary)",
            }}
          >
            LearnWise
          </Text>
          <Text
            fw={400}
            size="md"
            c="dimmed"
            style={{ letterSpacing: "-0.01em" }}
          >
            Quiz
          </Text>

          <Group gap={4} ml="md">
            {links.map((link) => (
              <UnstyledButton
                key={link.href}
                component={Link}
                href={link.href}
                px="sm"
                py={6}
                style={{
                  borderRadius: "var(--radius)",
                  fontSize: 13,
                  fontWeight: pathname === link.href ? 600 : 500,
                  color:
                    pathname === link.href
                      ? "var(--primary)"
                      : "var(--muted-foreground)",
                  background:
                    pathname === link.href
                      ? "var(--primary-light)"
                      : "transparent",
                  transition: "all 0.15s ease",
                }}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </UnstyledButton>
            ))}
          </Group>
        </Group>
        {children}
      </Group>
    </nav>
  );
}
