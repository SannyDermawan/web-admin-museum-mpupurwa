import type { ReactNode } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Every page inside the (admin) folder gets the sidebar + top bar (and the login check) automatically.
export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
