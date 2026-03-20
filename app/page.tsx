"use client";

import { useState, useCallback, useRef } from "react";
import { AppShell, Burger, Button, Group, Badge } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Navigation } from "@/app/components/Navigation";
import { GeneratorForm } from "@/app/components/generator/GeneratorForm";
import { ResultsSidebar } from "@/app/components/generator/ResultsSidebar";
import type { QAResponse } from "@/lib/api/types";

export default function GeneratorPage() {
  const [results, setResults] = useState<QAResponse[]>([]);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [asideOpened, { toggle: toggleAside }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 62em)");

  const handleResult = useCallback((result: QAResponse) => {
    setResults((prev) => [...prev, result]);
  }, []);

  const handleStreamStart = useCallback(() => {
    setStreamingContent("");
    setIsStreaming(true);
  }, []);

  const streamContentRef = useRef<string>("");

  const handleStreamChunk = useCallback((content: string) => {
    streamContentRef.current = content;
    setStreamingContent(content);
  }, []);

  const handleStreamEnd = useCallback(() => {
    const content = streamContentRef.current;
    streamContentRef.current = "";
    setStreamingContent(null);
    setIsStreaming(false);
    if (content) {
      setResults((prev) => [...prev, { content }]);
    }
  }, []);

  const resultCount = results.length + (streamingContent != null ? 1 : 0);

  return (
    <AppShell
      header={{ height: 60 }}
      aside={{
        width: { md: 400, lg: 550, xl: 650 },
        breakpoint: "md",
        collapsed: { mobile: !asideOpened, desktop: false },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Navigation />
      </AppShell.Header>

      <AppShell.Main>
        {isMobile && (
          <Group gap="xs">
            <Button
              variant="light"
              size="xs"
              onClick={toggleAside}
              aria-label="Toggle results panel"
            >
              Results
              {resultCount > 0 && (
                <Badge size="xs" circle ml={4}>
                  {resultCount}
                </Badge>
              )}
            </Button>
          </Group>
        )}
        <GeneratorForm
          onResult={handleResult}
          onStreamChunk={handleStreamChunk}
          onStreamStart={handleStreamStart}
          onStreamEnd={handleStreamEnd}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />
      </AppShell.Main>

      <AppShell.Aside>
        {isMobile && (
          <Group justify="flex-end" p="xs">
            <Burger
              opened={asideOpened}
              onClick={toggleAside}
              size="sm"
              aria-label="Close results panel"
            />
          </Group>
        )}
        <ResultsSidebar
          results={results}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
        />
      </AppShell.Aside>
    </AppShell>
  );
}
