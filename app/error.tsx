"use client";

import { Button, Center, Stack, Text } from "@mantine/core";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Center h="60vh">
      <Stack align="center" gap="md">
        <Text fw={700} size="lg">
          Something went wrong
        </Text>
        <Text size="sm" c="dimmed" maw={400} ta="center">
          {error.message || "An unexpected error occurred."}
        </Text>
        <Button onClick={reset} variant="light">
          Try again
        </Button>
      </Stack>
    </Center>
  );
}
