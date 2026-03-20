"use client";

import { useMemo } from "react";
import { Select } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import { useGeneratorFormContext } from "../GeneratorForm";
import type { Course } from "@/lib/api/types";

export const CourseSelect = () =>{
  const form = useGeneratorFormContext();
  const { data: courses, isError } = useQuery({
    queryKey: ["courses"],
    queryFn: () =>
      apiJson<{ courses: Course[] }>(
        `/chat/temporary/courses`
      ),
    select: (data) => data.courses,
  });

  const selectData = useMemo(
    () => courses?.map((c) => ({ value: c.id, label: c.name, disabled: !c.available })) ?? [],
    [courses]
  );

  return (
    <Select
      label="Course"
      placeholder="Select course"
      data={selectData}
      required
      aria-required
      error={isError ? "Failed to load courses" : undefined}
      {...form.getInputProps("course_id")}
    />
  );
};
