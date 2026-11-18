import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Halaman tidak ditemukan" };

/** Shown for any address that matches no page (404). */
export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-offwhite px-4">
      <div className="max-w-md w-full bg-white border border-stone-line rounded-2xl p-8 text-center">
        <p className="font-display text-5xl text-gold mb-2">404</p>
        <h1 className="font-display text-2xl text-ink mb-2">Halaman tidak ditemukan</h1>
        <p className="text-sm text-ink-soft mb-6">Alamat yang kamu buka tidak ada atau sudah dipindahkan.</p>
        <Link href="/dashboard" className="inline-block px-4 py-2 rounded-lg bg-charcoal text-white text-sm font-bold hover:bg-charcoal-soft">
          Kembali ke dashboard
        </Link>
      </div>
    </main>
  );
}
