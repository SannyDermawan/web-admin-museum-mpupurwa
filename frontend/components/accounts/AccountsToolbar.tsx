import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "visitors", label: "Pengunjung", href: "/accounts/visitors" },
  { key: "admins", label: "Admin", href: "/accounts/admins" },
] as const;

type AccountsToolbarProps = {
  active: (typeof TABS)[number]["key"];
  /** Right side of the row, e.g. the "+ Tambah Admin" button */
  action?: ReactNode;
};

/** Top row of the account card: the "Pengunjung" / "Admin" tabs. Each tab is its own page. */
export function AccountsToolbar({ active, action }: AccountsToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3.5 border-b border-stone-line px-[22px] py-4">
      <nav aria-label="Jenis akun" className="flex gap-1.5">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={tab.key === active ? "page" : undefined}
            className={cn(
              "rounded-lg px-3.5 py-2 text-[12.5px] font-bold",
              tab.key === active ? "bg-charcoal text-white" : "text-ink-soft hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {action}
    </div>
  );
}
