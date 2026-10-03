// Single source of truth for the sidebar AND the page title shown in the top bar.
// Teammates: your module already has an entry here. Edit only the title/subtitle
// text if needed; do not reorder or rename routes without telling the lead.

import type { ComponentType, SVGProps } from "react";
import {
  AccountsIcon,
  CalendarIcon,
  CollectionIcon,
  DashboardIcon,
  UserIcon,
} from "@/components/ui/icons";
import type { DashboardStats } from "@/types";

export type NavItem = {
  label: string;
  /** Where the sidebar link goes */
  href: string;
  /** The item is active for this path and everything below it */
  matchPrefix: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Shows this number from `stats` of GET /api/dashboard as a badge */
  badgeKey?: keyof Pick<DashboardStats, "todayVisitors" | "pendingBookings">;
  /** Top bar heading and subheading */
  title: string;
  subtitle: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    matchPrefix: "/dashboard",
    icon: DashboardIcon,
    title: "Dashboard",
    subtitle: "Ringkasan aktivitas Museum Mpu Purwa hari ini",
  },
  {
    label: "Pengunjung Hari Ini",
    href: "/visitors/today",
    matchPrefix: "/visitors",
    icon: UserIcon,
    badgeKey: "todayVisitors",
    title: "Pengunjung Hari Ini",
    subtitle: "Daftar pengunjung yang sudah check-in via aplikasi",
  },
  {
    label: "Booking Rombongan",
    href: "/bookings",
    matchPrefix: "/bookings",
    icon: CalendarIcon,
    badgeKey: "pendingBookings",
    title: "Booking Rombongan",
    subtitle: "Kelola pengajuan kunjungan kelompok dan sekolah",
  },
  {
    label: "Manajemen Akun",
    href: "/accounts/visitors",
    // Covers /accounts/visitors and /accounts/admins (the "Pengunjung" and "Admin" tabs).
    matchPrefix: "/accounts",
    icon: AccountsIcon,
    title: "Manajemen Akun",
    subtitle: "Kelola akun pengunjung terdaftar di aplikasi",
  },
  {
    label: "Manajemen Koleksi",
    href: "/collections",
    matchPrefix: "/collections",
    icon: CollectionIcon,
    title: "Manajemen Koleksi",
    subtitle: "Kelola data koleksi arca dan prasasti museum",
  },
];

export function findNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((item) => pathname === item.matchPrefix || pathname.startsWith(`${item.matchPrefix}/`));
}
