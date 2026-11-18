"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

/**
 * Last resort: replaces the root layout when the layout itself fails. It must have its own <html> and <body>,
 * and it cannot rely on globals.css, so the few styles it needs are inline.
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error("Aplikasi gagal dimuat:", error);
  }, [error]);

  return (
    <html lang="id">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#f7f5f0", fontFamily: "sans-serif", color: "#241a0f" }}>
        <div style={{ maxWidth: 420, padding: 32, textAlign: "center", background: "#fff", border: "1px solid #e6e2d8", borderRadius: 16 }}>
          <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Aplikasi gagal dimuat</h1>
          <p style={{ fontSize: 14, color: "#7a7368", margin: "0 0 20px" }}>Muat ulang halaman. Kalau masalahnya berlanjut, hubungi Super Admin.</p>
          {error.digest && <p style={{ fontSize: 12, color: "#7a7368" }}>Kode: {error.digest}</p>}
          <button
            type="button"
            onClick={() => retry()}
            style={{ padding: "8px 16px", borderRadius: 8, border: 0, background: "#1f1f1f", color: "#fff", fontWeight: 700, cursor: "pointer" }}
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
