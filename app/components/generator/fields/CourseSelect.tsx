"use client";

import { Select } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import { useGeneratorFormContext } from "../GeneratorForm";
import type { Course } from "@/lib/api/types";

export const CourseSelect = () => {
  const form = useGeneratorFormContext();
  const { data: courses, isError } = useQuery({
    queryKey: ["courses"],
    queryFn: () => apiJson<{ courses: Course[] }>(`/chat/temporary/courses`),
    select: (data) =>
      data.courses.map((course) => ({
        value: course.id,
        label: course.name,
        disabled: !course.available,
      })),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Select
      label="Course"
      placeholder="Select course"
      data={courses ?? []}
      withAsterisk
      key={form.key("course_id")}
      {...form.getInputProps("course_id")}
      error={
        isError
          ? "Failed to load courses"
          : form.getInputProps("course_id").error
      }
    />
  );
};
