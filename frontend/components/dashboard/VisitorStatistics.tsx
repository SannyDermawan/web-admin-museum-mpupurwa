import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/PageState";
import { formatNumber } from "@/lib/utils";
import type { VisitorTrendPoint } from "@/types";

const GRID_LINES = 4; // the y axis is split into 4 steps (5 labels, 0 at the bottom)

/** Rounds the top of the y axis up to a tidy number, e.g. 82 -> 100. */
function getAxisMax(highest: number): number {
  const step = Math.max(5, Math.ceil(highest / GRID_LINES / 5) * 5);
  return step * GRID_LINES;
}

/**
 * Area chart of visitors per day. Drawn with plain SVG + HTML (no chart library).
 * The SVG only holds the line and area (stretched to any width); dots, labels and
 * the axes are HTML, so text and circles never get distorted on small screens.
 */
export function VisitorStatistics({ trend }: { trend: VisitorTrendPoint[] }) {
  if (trend.length === 0) {
    return (
      <Card className="min-w-0">
        <CardHeader title="Statistik Pengunjung" subtitle="Jumlah pengunjung 7 hari terakhir" />
        <EmptyState message="Belum ada data pengunjung." />
      </Card>
    );
  }

  const total = trend.reduce((sum, point) => sum + point.visitors, 0);
  const average = Math.round(total / trend.length);
  const peak = trend.reduce((best, point) => (point.visitors > best.visitors ? point : best));
  const axisMax = getAxisMax(peak.visitors);

  // Positions in percent of the plot area. Each day sits in the middle of its own column.
  const points = trend.map((point, index) => ({
    ...point,
    x: ((index + 0.5) / trend.length) * 100,
    y: 100 - (point.visitors / axisMax) * 100,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},100 L${points[0].x},100 Z`;
  const summary = trend.map((p) => `${p.day} ${p.visitors}`).join(", ");

  return (
    <Card className="flex min-w-0 flex-col">
      <CardHeader
        title="Statistik Pengunjung"
        subtitle="Jumlah pengunjung 7 hari terakhir"
        action={
          // Only one range for the UTS, so this does not filter anything yet.
          <select
            aria-label="Rentang waktu"
            className="rounded-lg border border-stone-line bg-white px-3 py-2 text-[13px] font-semibold text-ink outline-none focus:border-gold"
          >
            <option>7 Hari Terakhir</option>
          </select>
        }
      />

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
          <div
            role="img"
            aria-label={`Grafik pengunjung 7 hari terakhir: ${summary}`}
            className="relative h-[200px] min-w-0 flex-1"
          >
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

            {points.map((point) => (
              <div
                key={point.day}
                className="absolute"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                title={`${point.day}: ${point.visitors} pengunjung`}
              >
                <span
                  className={`absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold ${
                    point.day === peak.day ? "bg-gold" : "bg-white"
                  }`}
                />
                <span className="absolute -translate-x-1/2 -translate-y-[calc(100%+7px)] text-[11px] font-bold text-ink">
                  {point.visitors}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* x axis labels: same columns as the dots (offset = y label width + gap) */}
        <div
          className="mt-2.5 ml-10 grid text-center text-[11.5px] text-ink-soft"
          style={{ gridTemplateColumns: `repeat(${trend.length}, minmax(0, 1fr))` }}
        >
          {trend.map((point) => (
            <span key={point.day}>
              <span className="sm:hidden">{point.day.slice(0, 3)}</span>
              <span className="hidden sm:inline">{point.day}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-4 border-t border-stone-line px-[22px] py-4">
        <SummaryItem label="Total minggu ini" value={formatNumber(total)} />
        <SummaryItem label="Rata-rata per hari" value={formatNumber(average)} />
        <SummaryItem label="Hari tersibuk" value={`${peak.day} · ${formatNumber(peak.visitors)}`} />
      </div>
    </Card>
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
