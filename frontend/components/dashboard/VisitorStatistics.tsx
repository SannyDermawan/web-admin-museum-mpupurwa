"use client";

import { useState } from "react";
import { RangeSelect } from "@/components/dashboard/RangeSelect";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/PageState";
import { useApiData } from "@/hooks/use-api-data";
import { cn, formatNumber } from "@/lib/utils";
import type { VisitorTrendData, VisitorTrendPoint, VisitorTrendRange } from "@/types";

const GRID_LINES = 4; // the y axis is split into 4 steps (5 labels, 0 at the bottom)
const DENSE_FROM = 10; // from this many points (30d) only the peak is labelled and the rest shows on hover
const MAX_X_LABELS = 9;

// Texts that change with the selected range.
const RANGES: Array<{
  value: VisitorTrendRange;
  subtitle: string;
  total: string;
  average: string;
  peak: string;
}> = [
  {
    value: "24h",
    subtitle: "Jumlah pengunjung 24 jam terakhir",
    total: "Total 24 jam",
    average: "Rata-rata per jam",
    peak: "Jam tersibuk",
  },
  {
    value: "7d",
    subtitle: "Jumlah pengunjung 7 hari terakhir",
    total: "Total minggu ini",
    average: "Rata-rata per hari",
    peak: "Hari tersibuk",
  },
  {
    value: "30d",
    subtitle: "Jumlah pengunjung 30 hari terakhir",
    total: "Total 30 hari",
    average: "Rata-rata per hari",
    peak: "Hari tersibuk",
  },
];

/** Rounds the top of the y axis up to a tidy number, e.g. 82 -> 100. */
function getAxisMax(highest: number): number {
  const step = Math.max(5, Math.ceil(highest / GRID_LINES / 5) * 5);
  return step * GRID_LINES;
}

/** Area chart of visitors, with a dropdown to pick the time range. */
export function VisitorStatistics() {
  const [range, setRange] = useState<VisitorTrendRange>("7d");
  const { data, error, loading, reload } = useApiData<VisitorTrendData>(
    `/api/dashboard/visitor-trend?range=${range}`,
  );

  // Texts follow the data on screen (which may still be the previous range while a new one loads).
  const shown = RANGES.find((item) => item.value === (data?.range ?? range)) ?? RANGES[1];
  const selected = RANGES.find((item) => item.value === range) ?? RANGES[1];

  return (
    <Card className="flex min-w-0 flex-col">
      <CardHeader
        title="Statistik Pengunjung"
        subtitle={selected.subtitle}
        action={<RangeSelect value={range} onChange={setRange} />}
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        <LoadingState label="Memuat statistik…" />
      ) : data.points.length === 0 ? (
        <EmptyState message="Belum ada data pengunjung." />
      ) : (
        <div className={cn("flex flex-1 flex-col transition-opacity", loading && "opacity-50")}>
          <Chart points={data.points} />
          <Summary points={data.points} texts={shown} />
        </div>
      )}
    </Card>
  );
}

/**
 * The chart itself, drawn with plain SVG + HTML (no chart library).
 * The SVG only holds the line and area (stretched to any width); dots, labels and
 * the axes are HTML, so text and circles never get distorted on small screens.
 */
function Chart({ points: data }: { points: VisitorTrendPoint[] }) {
  const count = data.length;
  const dense = count >= DENSE_FROM;
  const peak = data.reduce((best, point) => (point.visitors > best.visitors ? point : best));
  const axisMax = getAxisMax(peak.visitors);

  // Positions in percent of the plot area. Each point sits in the middle of its own column.
  const points = data.map((point, index) => ({
    ...point,
    index,
    x: ((index + 0.5) / count) * 100,
    y: 100 - (point.visitors / axisMax) * 100,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[count - 1].x},100 L${points[0].x},100 Z`;
  const summary = data.map((p) => `${p.label} ${p.visitors}`).join(", ");

  // Only every n-th label is written when there are many points.
  const labelEvery = Math.ceil(count / MAX_X_LABELS);

  return (
    <div className="px-[22px] pt-7 pb-5">
      <div className="flex gap-3">
        {/* y axis labels */}
        <div className="relative h-[200px] w-7 flex-none" aria-hidden="true">
          {Array.from({ length: GRID_LINES + 1 }, (_, i) => (
            <span
              key={i}
              className="absolute right-0 -translate-y-1/2 text-[11px] text-ink-soft"
              style={{ top: `${(i / GRID_LINES) * 100}%` }}
            >
              {(axisMax * (GRID_LINES - i)) / GRID_LINES}
            </span>
          ))}
        </div>

        {/* plot */}
        <div role="img" aria-label={`Grafik pengunjung: ${summary}`} className="relative h-[200px] min-w-0 flex-1">
          {Array.from({ length: GRID_LINES + 1 }, (_, i) => (
            <div
              key={i}
              className="absolute inset-x-0 h-px bg-stone-line"
              style={{ top: `${(i / GRID_LINES) * 100}%` }}
            />
          ))}

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible"
            aria-hidden="true"
          >
            <path d={areaPath} style={{ fill: "var(--color-gold)", fillOpacity: 0.14 }} />
            <path
              d={linePath}
              fill="none"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ stroke: "var(--color-gold)" }}
            />
          </svg>

          {/* One hover column per point: shows its dot and value. */}
          {points.map((point) => {
            const isPeak = peak.visitors > 0 && point.index === data.indexOf(peak);
            const alwaysVisible = !dense || isPeak;
            return (
              <div
                key={point.index}
                className="group absolute inset-y-0"
                style={{ left: `${(point.index / count) * 100}%`, width: `${100 / count}%` }}
                title={`${point.label}: ${formatNumber(point.visitors)} pengunjung`}
              >
                <div className="absolute left-1/2" style={{ top: `${point.y}%` }}>
                  <span
                    className={cn(
                      "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-gold bg-white",
                      dense ? "size-2 border-[1.5px]" : "size-2.5 border-2",
                      isPeak && "bg-gold",
                      !alwaysVisible && "opacity-0 group-hover:opacity-100",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute -translate-x-1/2 -translate-y-[calc(100%+7px)] text-[11px] font-bold whitespace-nowrap text-ink",
                      !alwaysVisible &&
                        "z-10 rounded-md border border-stone-line bg-white px-1.5 py-0.5 opacity-0 shadow-sm group-hover:opacity-100",
                    )}
                  >
                    {alwaysVisible ? point.visitors : `${point.label} · ${point.visitors}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* x axis labels: same columns as the points (offset = y label width + gap) */}
      <div
        className="mt-2.5 ml-10 grid text-center text-[11.5px] text-ink-soft"
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
      >
        {data.map((point, index) => {
          if (index % labelEvery !== 0) return <span key={index} />;
          // On phones every second written label is skipped so they do not touch.
          const skipOnPhone = count > 7 && (index / labelEvery) % 2 === 1;
          return (
            <span key={index} className={cn("whitespace-nowrap", skipOnPhone && "max-sm:invisible")}>
              <AxisLabel label={point.label} />
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** Weekday names are shortened to 3 letters on phones ("Senin" -> "Sen"). Hours and dates stay as they are. */
function AxisLabel({ label }: { label: string }) {
  if (!/^[A-Za-z]+$/.test(label)) return <>{label}</>;
  return (
    <>
      <span className="sm:hidden">{label.slice(0, 3)}</span>
      <span className="hidden sm:inline">{label}</span>
    </>
  );
}

function Summary({
  points,
  texts,
}: {
  points: VisitorTrendPoint[];
  texts: { total: string; average: string; peak: string };
}) {
  const total = points.reduce((sum, point) => sum + point.visitors, 0);
  const average = Math.round(total / points.length);
  const peak = points.reduce((best, point) => (point.visitors > best.visitors ? point : best));

  return (
    <div className="mt-auto grid grid-cols-3 gap-4 border-t border-stone-line px-[22px] py-4">
      <SummaryItem label={texts.total} value={formatNumber(total)} />
      <SummaryItem label={texts.average} value={formatNumber(average)} />
      <SummaryItem label={texts.peak} value={peak.visitors > 0 ? `${peak.label} · ${formatNumber(peak.visitors)}` : "—"} />
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-ink-soft">{label}</div>
      <div className="mt-0.5 truncate font-display text-[17px] font-semibold">{value}</div>
    </div>
  );
}
