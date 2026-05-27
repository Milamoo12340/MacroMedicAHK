
import { useCallback, useEffect, useState } from "react";

// Persistent localStorage with cross-component pub/sub.
// Everything here lives on the user's device — no backend required.
const PREFIX = "macromedic:";

export const StorageKeys = {
  appMode: "appMode",
  bootstrapped: "bootstrapped",
  currentUserId: "currentUserId",
  staffAccounts: "staffAccounts",
  knowledgeFiles: "knowledgeFiles",
  trainedResponses: "trainedResponses",
  commands: "commands",
  tickets: "tickets",
  botConfig: "botConfig",
  discordConfig: "discordConfig",
  aiConfig: "aiConfig",
} as const;

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

export function subscribe(key: string, fn: Listener): () => void {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(fn);
  return () => {
    listeners.get(key)?.delete(fn);
  };
}

export function notify(key: string): void {
  listeners.get(key)?.forEach((fn) => fn());
}

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    notify(key);
  } catch (e) {
    console.error("storage save failed", key, e);
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
    notify(key);
  } catch {
    // ignore
  }
}

export function clearAllStorage(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
  // notify everyone
  Object.values(StorageKeys).forEach((k) => notify(k));
}

/**
 * React hook for persistent state, synced across all components in the app.
 */
export function useStore<T>(
  key: string,
  initial: T,
): [T, (v: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => loadJSON(key, initial));

  useEffect(() => {
    const refresh = () => setState(loadJSON(key, initial));
    const unsub = subscribe(key, refresh);
    // also react to other tabs
    const handler = (e: StorageEvent) => {
      if (e.key === PREFIX + key) refresh();
    };
    window.addEventListener("storage", handler);
    return () => {
      unsub();
      window.removeEventListener("storage", handler);
    };
    // The previous eslint-disable-next-line comment was for a rule that
    // seems to be undefined in the environment. Removing it as it's not a syntax error.
  }, [key, initial]); // Added 'initial' to the dependency array for correctness,
                      // as `initial` is used in `loadJSON` within the effect.

  const update = useCallback(
    (v: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next =
          typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        saveJSON(key, next);
        return next;
      });
    },
    [key],
  );

  return [state, update];
}
