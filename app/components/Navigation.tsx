"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Group, Text, UnstyledButton } from "@mantine/core";

const links = [
  { href: "/", label: "Generator" },
  { href: "/generations", label: "Generations" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation">
      <Group
        h={60}
        px="md"
        justify="space-between"
        className="border-b border-gray-200"
      >
        <Text fw={700} size="lg">
          LearnWise Quiz
        </Text>
        <Group gap="sm">
          {links.map((link) => (
            <UnstyledButton
              key={link.href}
              component={Link}
              href={link.href}
              px="md"
              py="xs"
              className={`rounded-md transition-colors ${
                pathname === link.href
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100"
              }`}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              <Text size="sm" fw={500}>
                {link.label}
              </Text>
            </UnstyledButton>
          ))}
        </Group>
      </Group>
    </nav>
  );
}
