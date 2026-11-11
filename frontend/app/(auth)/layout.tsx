import type { ReactNode } from "react";
import { RedirectIfAuthenticated } from "./components/RedirectIfAuthenticated";

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return <RedirectIfAuthenticated>{children}</RedirectIfAuthenticated>;
}
