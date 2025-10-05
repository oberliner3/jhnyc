"use client";

import { useState, useEffect } from "react";
import { logger } from "@/lib/utils/logger";

/**
 * Custom hook for managing localStorage with React state
 * Provides type-safe localStorage access with automatic serialization
 *
 * @param key - The localStorage key
 * @param initialValue - The initial value if key doesn't exist
 * @returns Tuple of [value, setValue] similar to useState
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      logger.error(`Error loading localStorage key "${key}"`, error);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      logger.error(`Error setting localStorage key "${key}"`, error);
    }
  };

  return [storedValue, setValue] as const;
}
