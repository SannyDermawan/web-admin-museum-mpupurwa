"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

type Result<T> = { key: string; data: T | null; error: string | null };

/**
 * Loads `url` through the API on mount and whenever `url` changes.
 *   const { data, error, loading, reload } = useApiData<DashboardData>("/api/dashboard");
 * While a new request is in flight, `data` keeps the previous result, so lists do not flash empty.
 */
export function useApiData<T>(url: string) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result<T>>({ key: "", data: null, error: null });
  const key = `${attempt}:${url}`;

  useEffect(() => {
    const controller = new AbortController();

    apiGet<T>(url, { signal: controller.signal })
      .then(({ data }) => setResult({ key, data, error: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Gagal memuat data.";
        setResult((previous) => ({ key, data: previous.data, error: message }));
      });

    return () => controller.abort();
  }, [url, key]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  // A result that belongs to an older request means the new one is still loading.
  const loading = result.key !== key;
  return { data: result.data, error: loading ? null : result.error, loading, reload };
}
