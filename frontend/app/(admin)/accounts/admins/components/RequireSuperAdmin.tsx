"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuthUser } from "@/lib/user-auth";

/**
 * Manajemen akun ADMIN hanya untuk Super Admin. Admin biasa yang membuka alamatnya langsung dialihkan ke akun
 * pengunjung, tanpa sempat melihat tabel atau tombol tambah. Ini untuk tampilan; pengamanan sesungguhnya ada di
 * backend (requireRole("super_admin") membalas 403).
 */
export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const user = useAuthUser();
  const router = useRouter();
  const forbidden = !!user && user.role !== "super_admin";

  useEffect(() => {
    if (forbidden) router.replace("/accounts/visitors");
  }, [forbidden, router]);

  if (!user || forbidden) return null;
  return <>{children}</>;
}
