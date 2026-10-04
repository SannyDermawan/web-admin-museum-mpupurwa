"use client";

import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { MenuIcon } from "@/components/ui/icons";
import { findNavItem } from "@/lib/navigation";

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const current = findNavItem(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-[72px] flex-none items-center justify-between gap-4 border-b border-stone-line bg-white px-4 sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Buka menu"
          onClick={onMenuClick}
          className="flex size-[38px] flex-none items-center justify-center rounded-[9px] border border-stone-line lg:hidden"
        >
          <MenuIcon className="size-[17px] text-ink" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-xl sm:text-[21px]">{current?.title ?? "Admin Panel"}</h1>
          {current && <div className="mt-0.5 hidden truncate text-[12.5px] text-ink-soft sm:block">{current.subtitle}</div>}
        </div>
      </div>

      <NotificationBell />
    </header>
  );
}
