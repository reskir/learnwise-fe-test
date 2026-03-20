"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Stack,
  Text,
  Pagination,
  Center,
  Loader,
  Badge,
  Group,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Streamdown } from "streamdown";
import { apiJson } from "@/lib/api/client";
import type { Generation, GenerationsFilters } from "@/lib/api/types";

const PAGE_SIZE = 5;

type GenerationsListProps = {
  filters: GenerationsFilters;
};

export function GenerationsList({ filters }: GenerationsListProps) {
  const [page, setPage] = useState(1);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }
    return params.toString();
  }, [
    filters.assistant_id,
    filters.course_id,
    filters.before_date,
    filters.after_date,
  ]);

  const {
    data: generations,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["generations", filters],
    queryFn: () =>
      apiJson<{ generations: Generation[] }>(
        queryString
          ? `/chat/temporary/generations?${queryString}`
          : "/chat/temporary/generations",
      ),
    select: (data) => data.generations,
  });

  const totalPages = useMemo(
    () => (generations ? Math.ceil(generations.length / PAGE_SIZE) : 0),
    [generations],
  );
  const currentPage = Math.min(page, totalPages || 1);
  const paginatedData = useMemo(
    () =>
      generations?.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [generations, currentPage],
  );

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader aria-label="Loading generations" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Box
        py="xl"
        style={{
          textAlign: "center",
          border: "2px dashed var(--border)",
          borderRadius: "var(--radius)",
          padding: "2rem",
        }}
      >
        <Text size="sm" c="red" mb="xs">
          {error instanceof Error
            ? error.message
            : "Failed to load generations"}
        </Text>
        <Button variant="light" color="red" size="xs" onClick={() => refetch()}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!generations?.length) {
    return (
      <Box
        py="xl"
        style={{
          textAlign: "center",
          border: "2px dashed var(--border)",
          borderRadius: "var(--radius)",
          padding: "2rem",
        }}
      >
        <Text size="sm" c="dimmed">
          No generations found
        </Text>
      </Box>
    );
  }

  return (
    <Stack gap="sm">
      {paginatedData?.map((gen, index) => (
        <Card
          key={`${gen.date}-${index}`}
          padding="md"
          radius="md"
          className="result-card-enter"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            animationDelay: `${index * 50}ms`,
          }}
        >
          <Group justify="space-between" mb="xs" wrap="wrap" gap={6}>
            <Group gap={6}>
              <Badge
                size="sm"
                variant="light"
                style={{
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  border:
                    "1px solid color-mix(in srgb, var(--primary) 20%, transparent)",
                }}
              >
                {gen.course_id}
              </Badge>
              <Badge
                size="sm"
                variant="light"
                style={{
                  background: "var(--muted)",
                  color: "var(--muted-foreground)",
                  border: "1px solid var(--border)",
                }}
              >
                {gen.assistant_id}
              </Badge>
            </Group>
            <Text size="xs" c="dimmed">
              {new Date(gen.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </Group>

          <Streamdown mode="static">
            {gen.generation.length > 300
              ? gen.generation.slice(0, 300) + "..."
              : gen.generation}
          </Streamdown>
        </Card>
      ))}

      {totalPages > 1 && (
        <Center mt="sm">
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={setPage}
            aria-label="Generations pagination"
            size="sm"
          />
        </Center>
      )}
    </Stack>
  );
}
