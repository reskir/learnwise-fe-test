"use client";

import { useCallback, useRef } from "react";
import { Box } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { GeneratorForm } from "@/app/components/generator/GeneratorForm";
import { ResultsPanel } from "@/app/components/generator/ResultsPanel";
import {
  useQuizResults,
  quizResultsStore,
} from "@/lib/store/quizResultsStore";
import type { QAResponse } from "@/lib/api/types";

export default function GeneratorPage() {
  const { results, streamingContent, isStreaming, isGenerating } =
    useQuizResults();
  const isMobile = useMediaQuery("(max-width: 62em)");

  const handleResult = useCallback((result: QAResponse) => {
    quizResultsStore.addResult(result);
  }, []);

  const handleStreamStart = useCallback(() => {
    quizResultsStore.streamStart();
  }, []);

  const streamContentRef = useRef<string>("");

  const handleStreamChunk = useCallback((content: string) => {
    streamContentRef.current = content;
    quizResultsStore.setStreamingContent(content);
  }, []);

  const handleStreamEnd = useCallback(() => {
    const content = streamContentRef.current;
    streamContentRef.current = "";
    quizResultsStore.streamEnd(content);
  }, []);

  const setIsGenerating = useCallback((v: boolean) => {
    quizResultsStore.setIsGenerating(v);
  }, []);

  const hasResults = results.length > 0 || streamingContent != null;

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 0 : "1.5rem",
        minHeight: "calc(100vh - 60px - 2rem)",
      }}
    >
      {/* Form column */}
      <Box
        style={{
          flex: isMobile ? "none" : 1,
          minWidth: 0,
          maxWidth: isMobile ? "100%" : 600,
        }}
      >
        <GeneratorForm
          onResult={handleResult}
          onStreamChunk={handleStreamChunk}
          onStreamStart={handleStreamStart}
          onStreamEnd={handleStreamEnd}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />
      </Box>

      {/* Results - inline on mobile, side panel on desktop */}
      {(hasResults || !isMobile) && (
        <Box
          style={{
            flex: isMobile ? "none" : 1,
            minWidth: 0,
            ...(isMobile
              ? { marginTop: 16 }
              : {
                  borderLeft: "1px solid var(--border)",
                  paddingLeft: "1.5rem",
                }),
          }}
        >
          <ResultsPanel
            results={results}
            streamingContent={streamingContent}
            isStreaming={isStreaming}
            inline={!!isMobile}
          />
        </Box>
      )}
    </Box>
  );
}
