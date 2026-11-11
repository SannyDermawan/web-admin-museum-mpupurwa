// Date helpers for the museum's timezone (Asia/Jakarta). DATE columns are handled as UTC midnight,
// which is how Prisma returns them, so the same calendar day never shifts.

export const MUSEUM_TIMEZONE = "Asia/Jakarta";

/** "Today" in the museum's timezone, as YYYY-MM-DD. */
export function todayInMuseumTimezone(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: MUSEUM_TIMEZONE }).format(now);
}

/** YYYY-MM-DD -> a Date at UTC midnight (what a DATE column holds). */
export function dateOnly(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00Z`);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** A TIME column (returned as a Date on 1970-01-01) -> "HH:mm". */
export function toHourMinute(time: Date): string {
  return `${String(time.getUTCHours()).padStart(2, "0")}:${String(time.getUTCMinutes()).padStart(2, "0")}`;
}
