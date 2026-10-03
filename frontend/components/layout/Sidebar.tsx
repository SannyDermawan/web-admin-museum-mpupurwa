"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/layout/Brand";
import { Avatar } from "@/components/ui/Avatar";
import { LogoutIcon } from "@/components/ui/icons";
import { useApiData } from "@/hooks/use-api-data";
import { apiPost } from "@/lib/api";
import { clearAuthUser } from "@/lib/auth-storage";
import { NAV_ITEMS, findNavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { DashboardData, User } from "@/types";

const ROLE_LABEL: Record<User["role"], string> = {
  super_admin: "Super Admin",
  admin: "Admin",
};

type SidebarProps = {
  user: User;
  /** Mobile drawer state. On large screens the sidebar is always visible. */
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ user, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activeItem = findNavItem(pathname);
  // The sidebar badges are numbers from the dashboard stats.
  const { data: dashboard } = useApiData<DashboardData>("/api/dashboard");
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await apiPost("/api/auth/logout");
    } catch {
      // Even if the call fails, forget the user locally and leave.
    } finally {
      clearAuthUser();
      router.replace("/login");
    }
  }

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn("fixed inset-0 z-40 bg-[rgba(31,26,15,.4)] lg:hidden", open ? "block" : "hidden")}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[248px] flex-none flex-col bg-charcoal px-4 py-6 text-white transition-transform",
          "lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Brand divider />

        <nav className="flex flex-1 flex-col gap-0.5" aria-label="Menu utama">
          {NAV_ITEMS.map((item) => {
            const active = item === activeItem;
            const count = item.badgeKey && dashboard ? dashboard.stats[item.badgeKey] : undefined;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-[9px] px-3 py-[11px] text-[13.5px] font-semibold transition-colors",
                  active ? "bg-gold text-charcoal" : "text-white/65 hover:bg-white/[.06] hover:text-white/90",
                )}
              >
                <item.icon className="size-[18px] flex-none" />
                {item.label}
                {count !== undefined && (
                  <span
                    className={cn(
                      "ml-auto rounded-full px-[7px] py-px text-[10.5px] font-bold",
                      active ? "bg-charcoal/[.18] text-charcoal" : "bg-white/15 text-white",
                    )}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-3.5 flex items-center gap-2.5 border-t border-white/10 p-3">
          <Avatar name={user.name} variant="gold" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-bold text-white">{user.name}</div>
            <div className="text-[11px] text-white/50">{ROLE_LABEL[user.role]}</div>
          </div>
          <button
            type="button"
            title="Keluar"
            aria-label="Keluar"
            disabled={loggingOut}
            onClick={handleLogout}
            className="flex size-[30px] items-center justify-center rounded-lg text-white/55 hover:bg-white/[.08] hover:text-white"
          >
            <LogoutIcon className="size-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
