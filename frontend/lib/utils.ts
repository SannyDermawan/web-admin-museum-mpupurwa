/** Joins class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** "Citra Ayu Lestari" -> "CA" */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

/** 1204 -> "1.204" */
export function formatNumber(value: number): string {
  return value.toLocaleString("id-ID");
}

// Dates arrive from the API as YYYY-MM-DD. They are formatted in UTC so the
// calendar day never shifts with the viewer's timezone.
function parseIsoDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00Z`);
}

/** "2026-09-29" -> "29 Sep 2026" */
export function formatDateShort(isoDate: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(
    parseIsoDate(isoDate),
  );
}

/** "2026-09-30" -> "Selasa, 30 September 2026" */
export function formatDateLong(isoDate: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseIsoDate(isoDate));
}

/** Escapes one CSV cell. */
export function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Triggers a browser download of `content` as a CSV file. */
export function downloadCsv(filename: string, rows: Array<Array<string | number>>): void {
  const content = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  // BOM so Excel opens UTF-8 correctly.
  const blob = new Blob(["﻿", content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
