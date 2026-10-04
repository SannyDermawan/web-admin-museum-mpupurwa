"use client";

import { useEffect, useState } from "react";

/** The value, but only after it stopped changing for `delay` ms. Used so a search does not call the API on every key. */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
