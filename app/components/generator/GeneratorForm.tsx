"use client";

import { useRef } from "react";
import { Box, Button, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { createFormContext } from "@mantine/form";
import { apiJson, apiClient, ApiError } from "@/lib/api/client";
import {
  parseJsonBuffer,
  appendStreamToken,
} from "@/lib/stream/parseStreamChunks";
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
};

type GeneratorFormProps = {
  onResult: (result: QAResponse) => void;
  onStreamChunk: (content: string) => void;
  onStreamStart: () => void;
  onStreamEnd: () => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
};

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
  const streamActiveRef = useRef(false);
  const isMobile = useMediaQuery("(max-width: 62em)");

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
          streamActiveRef.current = true;
          const controller = new AbortController();
          abortRef.current = controller;

          const response = await apiClient(
            `/chat/temporary/qa-stream${queryParams}`,
            {
              method: "POST",
              body: JSON.stringify({ message: values.prompt }),
              signal: controller.signal,
            },
          );

          const reader = response.body!.getReader();

          const decoder = new TextDecoder();
          let accumulated = "";
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            const { tokens, remaining } = parseJsonBuffer(buffer);
            for (const t of tokens) {
              accumulated = appendStreamToken(accumulated, t);
            }
            buffer = remaining;

            onStreamChunk(accumulated);
          }

          onStreamEnd();
          streamActiveRef.current = false;
        }
      } else {
        for (let i = 0; i < values.numQuestions; i++) {
          const result = await apiJson<QAResponse>(
            `/chat/temporary/qa${queryParams}`,
            {
              method: "POST",
              body: JSON.stringify({ message: values.prompt }),
            },
          );
          onResult(result);
        }
      }
    } catch (err) {
      if (streamActiveRef.current) {
        onStreamEnd();
        streamActiveRef.current = false;
      }

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
        <Box
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: isMobile ? "1rem" : "1.5rem",
          }}
        >
          <Stack gap="md">
            <Text fw={700} size="lg" style={{ letterSpacing: "-0.02em" }}>
              Generate Quiz Questions
            </Text>

            <SimpleGrid cols={isMobile ? 1 : 2} spacing="sm">
              <AssistantSelect />
              <CourseSelect />
            </SimpleGrid>

            <PromptInput />

            <Group gap="md" align="end" wrap="wrap">
              <NumQuestionsInput />
              <StreamToggle />
            </Group>

            <Group gap="sm" mt={4}>
              <Button
                type="submit"
                loading={isGenerating}
                disabled={isGenerating}
                size={isMobile ? "sm" : "md"}
                style={{
                  background: "var(--primary)",
                  borderRadius: "var(--radius)",
                  fontWeight: 600,
                }}
              >
                Generate
              </Button>
              {isGenerating && (
                <Button
                  variant="light"
                  color="red"
                  size={isMobile ? "sm" : "md"}
                  onClick={handleCancel}
                  style={{ borderRadius: "var(--radius)" }}
                >
                  Cancel
                </Button>
              )}
            </Group>
          </Stack>
        </Box>
      </form>
    </FormProvider>
  );
};
