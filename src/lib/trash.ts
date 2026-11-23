"use client";

import { CATEGORIES, QUOTES_BY_ID, type Category } from "@/data/quotes";
import { createPersistedStore } from "@/lib/persisted-store";

/** How many shredded quotes the bin holds before it must be emptied. */
export const BIN_CAPACITY = 10;

export type TrashItem = {
  /** The shredded quote's id. */
  id: string;
  category: Category;
  /** Seed for the fragment pattern this quote leaves in the bin. */
  seed: number;
};

const EMPTY: TrashItem[] = [];

function isItem(v: unknown): v is TrashItem {
  if (!v || typeof v !== "object") return false;
  const t = v as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    QUOTES_BY_ID.has(t.id) &&
    typeof t.seed === "number" &&
    (CATEGORIES as readonly unknown[]).includes(t.category)
  );
}

/** Shredded quotes sitting in the bin, oldest first, kept in this browser's localStorage. */
const store = createPersistedStore<TrashItem[]>("pixel-quotes:trash", EMPTY, (raw) =>
  Array.isArray(raw) ? raw.filter(isItem).slice(0, BIN_CAPACITY) : EMPTY
);

export const useTrash = store.useValue;

export function isBinFull() {
  return store.get().length >= BIN_CAPACITY;
}

/** Adds a shredded quote to the bin. Returns false if it's full or storage is blocked. */
export function addToTrash(id: string, category: Category): boolean {
  if (isBinFull()) return false;
  return store.set((items) => [...items, { id, category, seed: Math.floor(Math.random() * 10_000) }]);
}

export function emptyTrash() {
  store.set(EMPTY);
}
