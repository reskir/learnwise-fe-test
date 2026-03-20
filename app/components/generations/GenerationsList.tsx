"use client";

import { useState } from "react";
import {
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
}

export function GenerationsList({ filters }: GenerationsListProps) {
  const [page, setPage] = useState(1);

  const queryParams = new URLSearchParams();

  if (filters.assistant_id) queryParams.set("assistant_id", filters.assistant_id);
  if (filters.course_id) queryParams.set("course_id", filters.course_id);
  if (filters.before_date) queryParams.set("before_date",filters.before_date);
  if (filters.after_date) queryParams.set("after_date", filters.after_date);

  const { data: generations, isLoading } = useQuery({
    queryKey: ["generations", filters],
    queryFn: () =>
      apiJson<{ generations: Generation[] }>(
        `/chat/temporary/generations?${queryParams.toString()}`
      ),
    select: (data) => data.generations,
  });

  // Reset page when filters change
  const totalPages = generations ? Math.ceil(generations.length / PAGE_SIZE) : 0;
  const currentPage = Math.min(page, totalPages || 1);
  const paginatedData = generations?.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader aria-label="Loading generations" />
      </Center>
    );
  }

  if (!generations?.length) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No generations found.
      </Text>
    );
  }

  return (
    <Stack gap="md">
      {paginatedData?.map((gen, index) => (
        <Card key={`${gen.date}-${index}`} shadow="sm" padding="md" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <Badge variant="light">{gen.course_id}</Badge>
              <Badge variant="light" color="grape">
                {gen.assistant_id}
              </Badge>
            </Group>
            <Text size="xs" c="dimmed">
              {new Date(gen.date).toLocaleDateString()}
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
        <Center>
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={setPage}
            aria-label="Generations pagination"
          />
        </Center>
      )}
    </Stack>
  );
}
