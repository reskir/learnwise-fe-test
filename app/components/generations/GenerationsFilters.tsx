"use client";

import { Group, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { Assistant, Course, GenerationsFilters } from "@/lib/api/types";

type GenerationsFiltersProps = {
  filters: GenerationsFilters;
  onChange: (filters: GenerationsFilters) => void;
}

export function GenerationsFiltersPanel({
  filters,
  onChange,
}: GenerationsFiltersProps) {
  const { data: assistants } = useQuery({
    queryKey: ["assistants"],
    queryFn: () => apiJson<{ assistants: Assistant[] }>("/chat/temporary/assistants"),
    select: (data) => data.assistants,
  });

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: () =>
      apiJson<{ courses: Course[] }>(
        `/chat/temporary/courses`
      ),
    select: (data) => data.courses,
  });

  return (
    <Group gap="md" align="end" wrap="wrap">
      <Select
        label="Assistant"
        placeholder="All assistants"
        clearable
        data={assistants?.map((a) => ({ value: a.id, label: a.name })) || []}
        value={filters.assistant_id || null}
        onChange={(v) => onChange({ ...filters, assistant_id: v || undefined })}
      />

      <Select
        label="Course"
        placeholder="All courses"
        clearable
        data={courses?.map((c) => ({ value: c.id, label: c.name })) || []}
        value={filters.course_id || null}
        onChange={(v) => onChange({ ...filters, course_id: v || undefined })}
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
      />
    </Group>
  );
}
