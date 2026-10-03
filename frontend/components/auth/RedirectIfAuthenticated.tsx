"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuthUser } from "@/lib/auth-storage";

/** Wraps the login pages: someone who is already logged in goes straight to the dashboard. */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const user = useAuthUser();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  return <>{children}</>;
}
