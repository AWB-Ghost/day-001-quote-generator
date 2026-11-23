"use client";

import { QUOTES_BY_ID } from "@/data/quotes";
import { createPersistedStore } from "@/lib/persisted-store";

const EMPTY: string[] = [];

/** Saved quote ids, newest first, kept in this browser's localStorage. */
const store = createPersistedStore<string[]>("pixel-quotes:library", EMPTY, (raw) =>
  Array.isArray(raw)
    ? raw.filter((id): id is string => typeof id === "string" && QUOTES_BY_ID.has(id))
    : EMPTY
);

export const useLibrary = store.useValue;

/** Returns false if the browser refused to store it. */
export function addToLibrary(id: string): boolean {
  if (store.get().includes(id)) return true;
  return store.set((ids) => [id, ...ids]);
}

export function removeFromLibrary(id: string) {
  store.set((ids) => ids.filter((x) => x !== id));
}
