"use client";

import { useRef } from "react";
import { Button, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createFormContext } from "@mantine/form";
import { apiJson, apiClient, ApiError } from "@/lib/api/client";
import { parseJsonBuffer } from "@/lib/stream/parseStreamChunks";
import type { QAResponse } from "@/lib/api/types";
import { AssistantSelect } from "./fields/AssistantSelect";
import { CourseSelect } from "./fields/CourseSelect";
import { PromptInput } from "./fields/PromptInput";
import { NumQuestionsInput } from "./fields/NumQuestionsInput";
import { StreamToggle } from "./fields/StreamToggle";

export type GeneratorFormValues = {
  assistant_id: string;
  course_id: string;
  prompt: string;
  numQuestions: number;
  isStreamed: boolean;
}

type GeneratorFormProps = {
  onResult: (result: QAResponse) => void;
  onStreamChunk: (content: string) => void;
  onStreamStart: () => void;
  onStreamEnd: () => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
}

export const [FormProvider, useGeneratorFormContext, useGeneratorForm] =
  createFormContext<GeneratorFormValues>();

export const GeneratorForm = ({
  onResult,
  onStreamChunk,
  onStreamStart,
  onStreamEnd,
  isGenerating,
  setIsGenerating,
}: GeneratorFormProps) => {
  const abortRef = useRef<AbortController | null>(null);

  const form = useGeneratorForm({
    initialValues: {
      assistant_id: "",
      course_id: "",
      prompt: "",
      numQuestions: 1,
      isStreamed: false,
    },
    validate: {
      assistant_id: (v) => (v ? null : "Assistant is required"),
      course_id: (v) => (v ? null : "Course is required"),
      prompt: (v) => (v.trim() ? null : "Prompt is required"),
      numQuestions: (v) =>
        v >= 1 && v <= 3 ? null : "Must be between 1 and 3",
    },
  });

  const handleSubmit = async (values: GeneratorFormValues) => {
    setIsGenerating(true);

    try {
      const queryParams = `?assistant_id=${encodeURIComponent(values.assistant_id)}&course_id=${encodeURIComponent(values.course_id)}`;

      if (values.isStreamed) {
        for (let i = 0; i < values.numQuestions; i++) {
          onStreamStart();
          const controller = new AbortController();
          abortRef.current = controller;

          const response = await apiClient(`/chat/temporary/qa-stream${queryParams}`, {
            method: "POST",
            body: JSON.stringify({ message: values.prompt }),
            signal: controller.signal,
          });

          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
          let accumulated = "";
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const { tokens, remaining } = parseJsonBuffer(buffer);
            for (const t of tokens) {
              accumulated += t;
            }
            buffer = remaining;

            onStreamChunk(accumulated);
          }

          onStreamEnd();
        }
      } else {
        for (let i = 0; i < values.numQuestions; i++) {
          const result = await apiJson<QAResponse>(
            `/chat/temporary/qa${queryParams}`,
            {
              method: "POST",
              body: JSON.stringify({ message: values.prompt }),
            }
          );
          onResult(result);
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;

      const message =
        err instanceof ApiError
          ? err.message
          : "An unexpected error occurred. Please try again.";

      notifications.show({
        title: "Generation failed",
        message,
        color: "red",
        autoClose: 5000,
      });
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setIsGenerating(false);
  };

  return (
    <FormProvider form={form}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Text component="h1" size="xl" fw={700}>
            Quiz Question Generator
          </Text>

          <AssistantSelect />
          <CourseSelect />
          <PromptInput />
          <NumQuestionsInput />
          <StreamToggle />

          <div className="flex gap-2">
            <Button type="submit" loading={isGenerating} disabled={isGenerating}>
              Generate
            </Button>
            {isGenerating && (
              <Button variant="outline" color="red" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </Stack>
      </form>
    </FormProvider>
  );
};
