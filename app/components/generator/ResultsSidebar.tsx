"use client";

import { useEffect, useRef, useCallback } from "react";
import { Card, ScrollArea, Stack, Text, Loader, Center } from "@mantine/core";
import { Streamdown } from "streamdown";
import type { QAResponse } from "@/lib/api/types";

type ResultsSidebarProps = {
  results: QAResponse[];
  streamingContent: string | null;
  isStreaming: boolean;
}

export function ResultsSidebar({
  results,
  streamingContent,
  isStreaming,
}: ResultsSidebarProps) {
  const hasContent = results.length > 0 || streamingContent != null;
  const viewportRef = useRef<HTMLDivElement>(null);
  const shouldFollowRef = useRef(true);
  const prevResultsLenRef = useRef(results.length);
  const prevStreamingRef = useRef(streamingContent);

  const scrollToBottom = useCallback(() => {
    const el = viewportRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, []);

  // Re-enable follow when a new result appears or streaming starts
  useEffect(() => {
    const newResultAdded = results.length > prevResultsLenRef.current;
    const streamingJustStarted =
      streamingContent != null && prevStreamingRef.current == null;

    if (newResultAdded || streamingJustStarted) {
      shouldFollowRef.current = true;
    }

    prevResultsLenRef.current = results.length;
    prevStreamingRef.current = streamingContent;
  }, [results.length, streamingContent]);

  // Auto-scroll when content changes and follow is enabled
  useEffect(() => {
    if (shouldFollowRef.current) {
      scrollToBottom();
    }
  }, [results.length, streamingContent, scrollToBottom]);

  // Detect manual scroll to disable follow
  const handleScroll = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // If user scrolled away from bottom, stop following
    if (distanceFromBottom > 50) {
      shouldFollowRef.current = false;
    } else {
      shouldFollowRef.current = true;
    }
  }, []);

  return (
    <aside aria-label="Generated results">
      <Stack gap="md" p="md">
        <Text component="h2" size="lg" fw={600}>
          Results
        </Text>

        <ScrollArea
          h="calc(100vh - 160px)"
          offsetScrollbars
          viewportRef={viewportRef}
          onScrollPositionChange={handleScroll}
        >
          <div aria-live="polite" aria-busy={isStreaming}>
            <Stack gap="md">
              {results.map((result, index) => (
                <Card key={index} shadow="sm" padding="md" radius="md" withBorder>
                  <Streamdown mode="static">
                    {result.content}
                  </Streamdown>
                </Card>
              ))}

              {streamingContent != null && (
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Streamdown
                    mode="streaming"
                    isAnimating={isStreaming}
                  >
                    {streamingContent}
                  </Streamdown>
                  {isStreaming && (
                    <Center mt="xs">
                      <Loader size="xs" aria-label="Streaming in progress" />
                    </Center>
                  )}
                </Card>
              )}

              {!hasContent && (
                <Text c="dimmed" ta="center" py="xl">
                  Generated questions will appear here.
                </Text>
              )}
            </Stack>
          </div>
        </ScrollArea>
      </Stack>
    </aside>
  );
}
