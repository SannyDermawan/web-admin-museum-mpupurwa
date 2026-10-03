import type { ReactNode } from "react";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return <RedirectIfAuthenticated>{children}</RedirectIfAuthenticated>;
}
