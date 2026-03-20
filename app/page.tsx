"use client";

import { useState, useCallback, useRef } from "react";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Navigation } from "@/app/components/Navigation";
import { GeneratorForm } from "@/app/components/generator/GeneratorForm";
import { ResultsSidebar } from "@/app/components/generator/ResultsSidebar";
import type { QAResponse } from "@/lib/api/types";

export default function GeneratorPage() {
  const [results, setResults] = useState<QAResponse[]>([]);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [asideOpened] = useDisclosure(true);

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

  return (
    <AppShell
      header={{ height: 60 }}
      aside={{
        width: 600,
        breakpoint: "md",
        collapsed: { mobile: !asideOpened, desktop: false },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Navigation />
      </AppShell.Header>

      <AppShell.Main>
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
        <ResultsSidebar
          results={results}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
        />
      </AppShell.Aside>
    </AppShell>
  );
}
