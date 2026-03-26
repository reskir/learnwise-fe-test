import { openDB, type IDBPDatabase } from "idb";
import type { QAResponse } from "@/lib/api/types";

const DB_NAME = "quiz-results-db";
const STORE_NAME = "results";
const KEY = "current";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export async function loadResults(): Promise<QAResponse[]> {
  const db = await getDb();
  const data = await db.get(STORE_NAME, KEY);
  return Array.isArray(data) ? data : [];
}

export async function saveResults(results: QAResponse[]): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, results, KEY);
}

export async function clearResults(): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, KEY);
}
