// Labels and formatters shared by the account management (Manajemen Akun) screens.

import { formatDateShort } from "@/lib/utils";
import type { AdminStatus, EducationLevel, UserRole } from "@/types";

export const EDUCATION_LEVELS: EducationLevel[] = ["Mahasiswa", "Pelajar", "Umum"];

export const ROLE_LABEL: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
};

export const STATUS_LABEL: Record<AdminStatus, string> = {
  active: "Aktif",
  inactive: "Nonaktif",
};

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MUSEUM_TIMEZONE = "Asia/Jakarta";

function dayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: MUSEUM_TIMEZONE }).format(date);
}

/** "2026-10-03T08:02:00+07:00" -> "Hari ini, 08:02" · yesterday -> "Kemarin, 15:40" · older -> "12 Sep 2026" */
export function formatLastLogin(isoDateTime: string | null, now: Date = new Date()): string {
  if (!isoDateTime) return "Belum pernah masuk";

  const loginDate = new Date(isoDateTime);
  const loginDay = dayKey(loginDate);
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: MUSEUM_TIMEZONE,
  }).format(loginDate);

  if (loginDay === dayKey(now)) return `Hari ini, ${time}`;
  if (loginDay === dayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000))) return `Kemarin, ${time}`;
  return formatDateShort(loginDay);
}
