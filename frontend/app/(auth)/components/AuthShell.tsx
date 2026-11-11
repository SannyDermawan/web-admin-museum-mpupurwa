import type { ReactNode } from "react";
import { Brand } from "@/components/layout/Brand";

/** Two-column layout shared by /login and /forgot-password. The dark panel hides below 860px. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <div
        className={
          "relative flex flex-[1.05] flex-col justify-between overflow-hidden bg-charcoal px-14 py-12 text-white max-[860px]:hidden " +
          "before:absolute before:-right-[190px] before:-bottom-[170px] before:size-[520px] before:rounded-full before:border before:border-gold/[.22] before:content-[''] " +
          "after:absolute after:-right-[100px] after:-bottom-[80px] after:size-[340px] after:rounded-full after:border after:border-gold/[.22] after:content-['']"
        }
      >
        <Brand />
        <div>
          <h2 className="relative z-[1] max-w-[430px] text-[38px] leading-[1.15] text-white">
            Kelola kunjungan, booking, dan koleksi dari satu tempat.
          </h2>
          <p className="relative z-[1] mt-4 max-w-[380px] text-[14.5px] leading-[1.6] text-white/[.62]">
            Panel ini dipakai pengelola museum untuk menyetujui booking rombongan, memantau pengunjung harian, dan merawat
            akun di aplikasi.
          </p>
        </div>
        <div className="relative z-[1] text-xs text-white/40">Museum Mpu Purwa, Malang</div>
      </div>

      <div className="flex flex-1 items-center justify-center px-8 py-12">
        <div className="w-full max-w-[372px]">{children}</div>
      </div>
    </div>
  );
}

export function AuthHeading({ title, description }: { title: string; description: string }) {
  return (
    <>
      <h1 className="mb-2 text-[26px]">{title}</h1>
      <p className="mb-7 text-[13.5px] leading-[1.55] text-ink-soft">{description}</p>
    </>
  );
}
