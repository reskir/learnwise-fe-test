import { useSyncExternalStore, useCallback, useRef } from "react";
import type { QAResponse } from "@/lib/api/types";

type QuizResultsState = {
  results: QAResponse[];
  streamingContent: string | null;
  isStreaming: boolean;
  isGenerating: boolean;
};

const initialState: QuizResultsState = {
  results: [],
  streamingContent: null,
  isStreaming: false,
  isGenerating: false,
};

let state: QuizResultsState = { ...initialState };
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function getSnapshot(): QuizResultsState {
  return state;
}

function getServerSnapshot(): QuizResultsState {
  return initialState;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const quizResultsStore = {
  addResult(result: QAResponse) {
    state = { ...state, results: [...state.results, result] };
    emit();
  },
  setStreamingContent(content: string | null) {
    state = { ...state, streamingContent: content };
    emit();
  },
  setIsStreaming(isStreaming: boolean) {
    state = { ...state, isStreaming };
    emit();
  },
  setIsGenerating(isGenerating: boolean) {
    state = { ...state, isGenerating };
    emit();
  },
  streamStart() {
    state = { ...state, streamingContent: "", isStreaming: true };
    emit();
  },
  streamEnd(content: string) {
    const newResults = content
      ? [...state.results, { content }]
      : state.results;
    state = {
      ...state,
      results: newResults,
      streamingContent: null,
      isStreaming: false,
    };
    emit();
  },
};

export function useQuizResults() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return snapshot;
}
