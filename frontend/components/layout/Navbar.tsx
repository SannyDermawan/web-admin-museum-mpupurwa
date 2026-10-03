"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { BellIcon, MenuIcon, SearchIcon } from "@/components/ui/icons";
import { findNavItem } from "@/lib/navigation";

/**
 * The search box writes to the `?q=` URL parameter. A page that wants search
 * simply reads `q` (see app/(admin)/visitors/today). Pages that ignore it are unaffected.
 */
function SearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(useSearchParams().get("q") ?? "");
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (value.trim()) params.set("q", value.trim());
      else params.delete("q");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, 250);
    return () => clearTimeout(timer);
  }, [value, pathname, router]);

  return (
    <div className="hidden w-60 items-center gap-2 rounded-[9px] border border-stone-line bg-offwhite px-3.5 py-[9px] sm:flex">
      <SearchIcon className="size-[15px] flex-none text-ink-soft" />
      <input
        type="text"
        aria-label="Cari data"
        placeholder="Cari data..."
        value={value}
        onChange={(event) => {
          touched.current = true;
          setValue(event.target.value);
        }}
        className="w-full bg-transparent text-[13px] text-ink outline-none"
      />
    </div>
  );
}

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

      <div className="flex flex-none items-center gap-3.5">
        {/* Keyed by path so the box clears when navigating to another page. */}
        <Suspense fallback={null}>
          <SearchBox key={pathname} />
        </Suspense>
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative flex size-[38px] items-center justify-center rounded-[9px] border border-stone-line"
        >
          <BellIcon className="size-[17px] text-ink" />
          <span className="absolute top-2 right-2 size-[7px] rounded-full border-[1.5px] border-white bg-danger" />
        </button>
      </div>
    </header>
  );
}
