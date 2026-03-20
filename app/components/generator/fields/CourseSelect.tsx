"use client";

import { useMemo } from "react";
import { Select } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/AuthProvider";
import { apiJson } from "@/lib/api/client";
import { useGeneratorFormContext } from "../GeneratorForm";
import type { Course } from "@/lib/api/types";

export const CourseSelect = () =>{
  const { token } = useAuth();
  const form = useGeneratorFormContext();
  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: () =>
      apiJson<{ courses: Course[] }>(
        `/chat/temporary/courses`,
        token!
      ),
    enabled: !!token,
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
      {...form.getInputProps("course_id")}
    />
  );
};
