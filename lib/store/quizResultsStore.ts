import { useSyncExternalStore } from "react";
import type { QAResponse } from "@/lib/api/types";
import {
  loadResults,
  saveResults,
  clearResults as clearDb,
} from "./quizResultsDb";

type QuizResultsState = {
  results: QAResponse[];
  streamingContent: string | null;
  isStreaming: boolean;
  isGenerating: boolean;
  isHydrated: boolean;
};

const initialState: QuizResultsState = {
  results: [],
  streamingContent: null,
  isStreaming: false,
  isGenerating: false,
  isHydrated: false,
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

function persist() {
  saveResults(state.results).catch(() => {});
}

async function hydrate() {
  try {
    const persisted = await loadResults();
    // Merge: keep any results generated before hydration finished
    const merged =
      state.results.length > 0
        ? [...persisted, ...state.results]
        : persisted;
    state = { ...state, results: merged, isHydrated: true };
  } catch {
    state = { ...state, isHydrated: true };
  }
  emit();
}

if (typeof window !== "undefined") {
  hydrate();
}

export const quizResultsStore = {
  addResult(result: QAResponse) {
    state = { ...state, results: [...state.results, result] };
    emit();
    persist();
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
    if (content) {
      persist();
    }
  },
  removeResult(index: number) {
    state = {
      ...state,
      results: state.results.filter((_, i) => i !== index),
    };
    emit();
    persist();
  },
  clearResults() {
    state = { ...state, results: [] };
    emit();
    clearDb().catch(() => {});
  },
};

export function useQuizResults() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
