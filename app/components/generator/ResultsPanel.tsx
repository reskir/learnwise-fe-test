"use client";

import { useEffect, useRef, useCallback } from "react";
import { Card, Stack, Text, Center, Box } from "@mantine/core";
import { Streamdown } from "streamdown";
import type { QAResponse } from "@/lib/api/types";

type ResultsPanelProps = {
  results: QAResponse[];
  streamingContent: string | null;
  isStreaming: boolean;
  inline?: boolean;
};

function StreamingDots() {
  return (
    <span className="streaming-dots" style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      <span />
      <span />
      <span />
    </span>
  );
}

export function ResultsPanel({
  results,
  streamingContent,
  isStreaming,
  inline = false,
}: ResultsPanelProps) {
  const hasContent = results.length > 0 || streamingContent != null;
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldFollowRef = useRef(true);
  const prevResultsLenRef = useRef(results.length);
  const prevStreamingRef = useRef(streamingContent);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, []);

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

  useEffect(() => {
    if (shouldFollowRef.current) {
      scrollToBottom();
    }
  }, [results.length, streamingContent, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldFollowRef.current = distanceFromBottom <= 50;
  }, []);

  return (
    <Box component="section" aria-label="Generated results">
      {/* Section header */}
      {inline ? (
        <div className="section-divider">
          <span>
            {isStreaming
              ? "Generating"
              : results.length > 0
                ? `${results.length} result${results.length !== 1 ? "s" : ""}`
                : "Results"}
          </span>
          {isStreaming && <StreamingDots />}
        </div>
      ) : (
        <Box mb="md">
          <Text
            fw={700}
            size="sm"
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--muted-foreground)",
            }}
          >
            Results
            {isStreaming && (
              <Box component="span" ml={8}>
                <StreamingDots />
              </Box>
            )}
          </Text>
        </Box>
      )}

      {/* Scrollable results area */}
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          ...(inline
            ? { maxHeight: "60vh", overflowY: "auto" }
            : { height: "calc(100vh - 160px)", overflowY: "auto" }),
          scrollbarWidth: "thin",
          scrollbarColor: "var(--border) transparent",
        }}
      >
        <div aria-live="polite" aria-busy={isStreaming}>
          <Stack gap="sm">
            {results.map((result, index) => (
              <Card
                key={index}
                padding="md"
                radius="md"
                className="result-card-enter"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                <Streamdown mode="static">{result.content}</Streamdown>
              </Card>
            ))}

            {streamingContent != null && (
              <Card
                padding="md"
                radius="md"
                className={isStreaming ? "stream-card-active" : "result-card-enter"}
                style={{
                  background: "var(--card)",
                  border: `1px solid ${isStreaming ? "var(--stream-border)" : "var(--border)"}`,
                }}
              >
                <Streamdown mode="streaming" isAnimating={isStreaming}>
                  {streamingContent}
                </Streamdown>
                {isStreaming && streamingContent === "" && (
                  <Center>
                    <Text size="xs" c="dimmed">
                      Generating response...
                    </Text>
                  </Center>
                )}
              </Card>
            )}

            {!hasContent && !inline && (
              <Box
                py="xl"
                style={{
                  textAlign: "center",
                  border: "2px dashed var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "2rem",
                }}
              >
                <Text size="sm" c="dimmed" mb={4}>
                  No results yet
                </Text>
                <Text size="xs" c="dimmed">
                  Generated questions will appear here
                </Text>
              </Box>
            )}
          </Stack>
        </div>
      </Box>
    </Box>
  );
}
