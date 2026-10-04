import type { DashboardRange } from "@/types";

/** The time ranges offered by the dashboard charts (same values the API accepts in `?range=`). */
export const RANGE_OPTIONS: Array<{ value: DashboardRange; label: string; period: string }> = [
  { value: "24h", label: "24 Jam Terakhir", period: "24 jam terakhir" },
  { value: "7d", label: "7 Hari Terakhir", period: "7 hari terakhir" },
  { value: "30d", label: "30 Hari Terakhir", period: "30 hari terakhir" },
];

/** Dropdown in the header of a dashboard chart card. */
export function RangeSelect({ value, onChange }: { value: DashboardRange; onChange: (range: DashboardRange) => void }) {
  return (
    <select
      aria-label="Rentang waktu"
      value={value}
      onChange={(event) => onChange(event.target.value as DashboardRange)}
      className="rounded-lg border border-stone-line bg-white px-3 py-2 text-[13px] font-semibold text-ink outline-none focus:border-gold"
    >
      {RANGE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
