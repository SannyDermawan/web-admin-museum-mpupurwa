"use client";

import { useState } from "react";
import { RANGE_OPTIONS, RangeSelect } from "@/components/dashboard/RangeSelect";
import { Card, CardHeader } from "@/components/ui/Card";
import { ErrorState, LoadingState } from "@/components/ui/PageState";
import { useApiData } from "@/hooks/use-api-data";
import { cn, formatNumber } from "@/lib/utils";
import type { BookingStatusCounts, BookingStatusData, DashboardRange } from "@/types";

// Colors come from the existing palette: green = confirmed, gold = waiting, warm grey = done, red = rejected.
const SEGMENTS: Array<{ key: keyof BookingStatusCounts; label: string; color: string }> = [
  { key: "confirmed", label: "Dikonfirmasi", color: "var(--color-success)" },
  { key: "pending", label: "Menunggu", color: "var(--color-gold)" },
  { key: "completed", label: "Selesai", color: "var(--color-ink-soft)" },
  { key: "rejected", label: "Ditolak", color: "var(--color-danger)" },
];

const RADIUS = 48;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 1.5; // small space between segments

/** Donut chart + legend of how many bookings are in each status, for the selected time range. */
export function BookingStatistics() {
  const [range, setRange] = useState<DashboardRange>("7d");
  const { data, error, loading, reload } = useApiData<BookingStatusData>(
    `/api/dashboard/booking-status?range=${range}`,
  );
  const period = RANGE_OPTIONS.find((option) => option.value === range)?.period;

  return (
    <Card className="min-w-0">
      <CardHeader
        title="Status Booking"
        subtitle={`Pengajuan ${period}`}
        action={<RangeSelect value={range} onChange={setRange} />}
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        <LoadingState label="Memuat status booking…" />
      ) : (
        <div className={cn("transition-opacity", loading && "opacity-50")}>
          <Donut counts={data.counts} />
        </div>
      )}
    </Card>
  );
}

function Donut({ counts }: { counts: BookingStatusCounts }) {
  const total = SEGMENTS.reduce((sum, segment) => sum + counts[segment.key], 0);
  const arcLength = (key: keyof BookingStatusCounts) => (total === 0 ? 0 : (counts[key] / total) * CIRCUMFERENCE);

  // Each segment starts where the previous one ended.
  const arcs = SEGMENTS.map((segment, index) => ({
    ...segment,
    value: counts[segment.key],
    length: arcLength(segment.key),
    offset: SEGMENTS.slice(0, index).reduce((sum, previous) => sum + arcLength(previous.key), 0),
  }));

  return (
    <div className="px-[22px] py-5">
      <div
        role="img"
        aria-label={`Status booking: ${SEGMENTS.map((s) => `${s.label} ${counts[s.key]}`).join(", ")}`}
        className="relative mx-auto size-[168px]"
      >
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth={14} style={{ stroke: "var(--color-offwhite)" }} />
          {arcs
            .filter((arc) => arc.value > 0)
            .map((arc) => (
              <circle
                key={arc.key}
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                strokeWidth={14}
                strokeDasharray={`${Math.max(arc.length - GAP, 0.5)} ${CIRCUMFERENCE}`}
                strokeDashoffset={-arc.offset}
                style={{ stroke: arc.color }}
              />
            ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-display text-[28px] leading-none font-semibold">{formatNumber(total)}</div>
          <div className="mt-1 text-[11.5px] text-ink-soft">Total booking</div>
        </div>
      </div>

      <ul className="mt-5">
        {arcs.map((arc) => (
          <li
            key={arc.key}
            className="flex items-center gap-2.5 border-b border-stone-line py-2 text-[13px] last:border-b-0"
          >
            <span className="size-2.5 flex-none rounded-full" style={{ backgroundColor: arc.color }} />
            <span>{arc.label}</span>
            <span className="ml-auto font-bold">{formatNumber(arc.value)}</span>
            <span className="w-10 text-right text-xs text-ink-soft">
              {total === 0 ? "0%" : `${Math.round((arc.value / total) * 100)}%`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
