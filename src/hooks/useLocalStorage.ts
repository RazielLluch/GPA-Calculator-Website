"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ZodType } from "zod";

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

interface Options<T> {
    schema?: ZodType<T>;
}

export function useLocalStorage<T>(
    key: string,
    initialValue: T,
    options: Options<T> = {},
): { value: T; setValue: SetValue<T>; isHydrated: boolean; clear: () => void } {
    const { schema } = options;

    const [value, setValueState] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Keep schema in a ref so it doesn't need to be a hook dependency.
  const schemaRef = useRef(schema);
  schemaRef.current = schema;

  const read = useCallback((): T => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      console.log("[useLocalStorage] RAW:", raw);
      if (raw === null) return initialValue;
      const parsed = JSON.parse(raw) as unknown;
      if (schemaRef.current) {
        const result = schemaRef.current.safeParse(parsed);
        if (!result.success) {
          console.log("[useLocalStorage] schema validation failed:", result.error.issues);
          return initialValue; // this is what wipes your data
        }
        console.log("[useLocalStorage] schema validation passed:", result.data);
        return result.data;
      }
      return parsed as T;
    } catch (e) {
      console.error("[useLocalStorage] READ THREW:", e);
      return initialValue;
    }
    // initialValue intentionally excluded — we don't want a new object
    // identity to retrigger reads. `key` is the only real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Load persisted value once, after mount.
  useEffect(() => {
    setValueState(read());
    setIsHydrated(true);
  }, [read]);

  const setValue: SetValue<T> = useCallback(
    (next) => {
      setValueState((prev) => {
        const resolved = next instanceof Function ? next(prev) : next;
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(resolved));
          }
        } catch {
          // Quota exceeded or storage disabled — keep in-memory state.
        }
        return resolved;
      });
    },
    [key],
  );

  const clear = useCallback(() => {
    try {
      if (typeof window !== "undefined") window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    setValueState(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Sync changes made in other tabs/windows.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      setValueState(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, read]);

  return { value, setValue, isHydrated, clear };
}