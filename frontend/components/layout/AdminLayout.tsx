"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthUser } from "@/lib/auth-storage";

/**
 * Sidebar + top bar + content area, and the login check for every admin page.
 * Used by app/(admin)/layout.tsx. Without a logged-in user it sends the visitor to /login.
 */
export function AdminLayout({ children }: { children: ReactNode }) {
  const user = useAuthUser();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user === null) router.replace("/login");
  }, [user, router]);

  // `undefined` = still checking the browser, `null` = redirecting to /login.
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 px-4 pt-6 pb-12 sm:px-8 sm:pt-7">{children}</main>
      </div>
    </div>
  );
}
