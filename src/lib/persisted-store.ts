"use client";

import { useSyncExternalStore } from "react";

/**
 * A tiny localStorage-backed store usable with useSyncExternalStore.
 * Reads return the same reference until the stored value changes,
 * and the server snapshot is always the fallback (so hydration matches).
 */
export function createPersistedStore<T>(
  key: string,
  fallback: T,
  parse: (raw: unknown) => T
) {
  const changeEvent = `persisted-store:${key}`;
  let cachedRaw: string | null | undefined;
  let cachedValue: T = fallback;

  function readRaw(): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function get(): T {
    const raw = readRaw();
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    try {
      cachedValue = raw === null ? fallback : parse(JSON.parse(raw));
    } catch {
      cachedValue = fallback;
    }
    return cachedValue;
  }

  function subscribe(onChange: () => void) {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) onChange();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(changeEvent, onChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(changeEvent, onChange);
    };
  }

  /** Returns false if the browser refused to store the value. */
  function set(next: T | ((prev: T) => T)): boolean {
    const value =
      typeof next === "function" ? (next as (prev: T) => T)(get()) : next;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      return false;
    }
    window.dispatchEvent(new Event(changeEvent));
    return true;
  }

  function useValue(): T {
    return useSyncExternalStore(subscribe, get, () => fallback);
  }

  return { get, set, useValue };
}
