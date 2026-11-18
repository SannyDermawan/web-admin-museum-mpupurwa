"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";

/**
 * Shown when a page throws while rendering. The user sees a friendly message and a retry button; the real error
 * goes to the console (in production the `digest` matches the line in the server log). This version of Next.js
 * passes `retry` (older versions called it `reset`).
 */
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error("Halaman gagal ditampilkan:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-offwhite px-4">
      <div className="max-w-md w-full bg-white border border-stone-line rounded-2xl p-8 text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-danger-bg border border-danger-line flex items-center justify-center text-danger text-xl font-bold">
          !
        </div>
        <h1 className="font-display text-2xl text-ink mb-2">Terjadi kesalahan</h1>
        <p className="text-sm text-ink-soft mb-6">
          Halaman ini tidak bisa ditampilkan. Coba muat ulang. Kalau masalahnya berlanjut, hubungi Super Admin.
        </p>
        {error.digest && <p className="text-xs text-ink-soft mb-6">Kode: {error.digest}</p>}
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => retry()}
            className="px-4 py-2 rounded-lg bg-charcoal text-white text-sm font-bold hover:bg-charcoal-soft"
          >
            Coba lagi
          </button>
          <Link href="/dashboard" className="px-4 py-2 rounded-lg border border-stone-line text-sm font-bold text-ink hover:bg-row-hover">
            Ke dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
