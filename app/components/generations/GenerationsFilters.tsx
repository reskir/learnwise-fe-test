"use client";

import { useMemo } from "react";
import {
  Box,
  Button,
  Collapse,
  Group,
  SimpleGrid,
  Select,
  Text,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { Assistant, Course, GenerationsFilters } from "@/lib/api/types";

type GenerationsFiltersProps = {
  filters: GenerationsFilters;
  onChange: (filters: GenerationsFilters) => void;
};

const chipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 500,
  background: "var(--primary-light)",
  color: "var(--primary)",
  border: "1px solid var(--primary-light)",
  cursor: "pointer",
  transition: "opacity 0.15s ease",
  lineHeight: 1.4,
};

function FilterChips({
  filters,
  assistants,
  courses,
  onChange,
}: {
  filters: GenerationsFilters;
  assistants?: Assistant[];
  courses?: Course[];
  onChange: (filters: GenerationsFilters) => void;
}) {
  const chips = useMemo(() => {
    const result: { label: string; key: keyof GenerationsFilters }[] = [];

    if (filters.assistant_id) {
      const name = assistants?.find((a) => a.id === filters.assistant_id)?.name;
      result.push({
        label: name || filters.assistant_id,
        key: "assistant_id",
      });
    }
    if (filters.course_id) {
      const name = courses?.find((c) => c.id === filters.course_id)?.name;
      result.push({ label: name || filters.course_id, key: "course_id" });
    }
    if (filters.after_date) {
      result.push({
        label: `From ${new Date(filters.after_date).toLocaleDateString()}`,
        key: "after_date",
      });
    }
    if (filters.before_date) {
      result.push({
        label: `Until ${new Date(filters.before_date).toLocaleDateString()}`,
        key: "before_date",
      });
    }

    return result;
  }, [filters, assistants, courses]);

  if (chips.length === 0) return null;

  return (
    <Group gap={6} mt={8}>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          style={chipStyle}
          onClick={() => onChange({ ...filters, [chip.key]: undefined })}
          aria-label={`Remove filter: ${chip.label}`}
        >
          {chip.label}
          <svg
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ width: 12, height: 12, flexShrink: 0 }}
          >
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          style={{
            ...chipStyle,
            background: "transparent",
            color: "var(--muted-foreground)",
            border: "1px solid var(--border)",
          }}
          onClick={() => onChange({})}
          aria-label="Clear all filters"
        >
          Clear all
        </button>
      )}
    </Group>
  );
}

export function GenerationsFiltersPanel({
  filters,
  onChange,
}: GenerationsFiltersProps) {
  const isMobile = useMediaQuery("(max-width: 62em)");
  const [opened, { toggle }] = useDisclosure(false);

  const { data: assistants } = useQuery({
    queryKey: ["assistants"],
    queryFn: () =>
      apiJson<{ assistants: Assistant[] }>("/chat/temporary/assistants"),
    select: (data) => data.assistants,
  });

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: () => apiJson<{ courses: Course[] }>(`/chat/temporary/courses`),
    select: (data) => data.courses,
  });

  const activeCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters],
  );

  const assistantOptions = useMemo(
    () => assistants?.map((a) => ({ value: a.id, label: a.name })) ?? [],
    [assistants],
  );

  const courseOptions = useMemo(
    () => courses?.map((c) => ({ value: c.id, label: c.name })) ?? [],
    [courses],
  );

  const filterFields = (
    <SimpleGrid cols={isMobile ? 1 : 2} spacing="sm">
      <Select
        label="Assistant"
        placeholder="All assistants"
        clearable
        data={assistantOptions}
        value={filters.assistant_id || null}
        onChange={(v) => onChange({ ...filters, assistant_id: v || undefined })}
        size="sm"
      />

      <Select
        label="Course"
        placeholder="All courses"
        clearable
        data={courseOptions}
        value={filters.course_id || null}
        onChange={(v) => onChange({ ...filters, course_id: v || undefined })}
        size="sm"
      />

      <DatePickerInput
        label="After date"
        placeholder="Start date"
        clearable
        value={filters.after_date ? new Date(filters.after_date) : null}
        onChange={(v) =>
          onChange({
            ...filters,
            after_date: v ? new Date(v).toISOString() : undefined,
          })
        }
        size="sm"
      />

      <DatePickerInput
        label="Before date"
        placeholder="End date"
        clearable
        value={filters.before_date ? new Date(filters.before_date) : null}
        onChange={(v) =>
          onChange({
            ...filters,
            before_date: v ? new Date(v).toISOString() : undefined,
          })
        }
        size="sm"
      />
    </SimpleGrid>
  );

  return (
    <Box
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: isMobile ? "0.75rem" : "1rem",
      }}
    >
      {isMobile ? (
        <>
          <Group justify="space-between" align="center">
            <Group gap={8}>
              <Text size="sm" fw={600}>
                Filters
              </Text>
              {activeCount > 0 && (
                <Box
                  component="span"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {activeCount}
                </Box>
              )}
            </Group>
            <Button
              variant="subtle"
              size="xs"
              onClick={toggle}
              style={{ color: "var(--primary)" }}
            >
              {opened ? "Hide" : "Show"}
            </Button>
          </Group>

          <FilterChips
            filters={filters}
            assistants={assistants}
            courses={courses}
            onChange={onChange}
          />

          <Collapse in={opened}>
            <Box mt="sm">{filterFields}</Box>
          </Collapse>
        </>
      ) : (
        <>
          <Text size="sm" fw={600} mb="sm">
            Filters
          </Text>
          {filterFields}
          <FilterChips
            filters={filters}
            assistants={assistants}
            courses={courses}
            onChange={onChange}
          />
        </>
      )}
    </Box>
  );
}
