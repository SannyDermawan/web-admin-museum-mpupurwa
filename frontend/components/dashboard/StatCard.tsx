import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  value: string;
  label: string;
  /** Small green/red figure in the corner, e.g. "+12%" */
  trend?: string;
  /** `gold` tints the icon gold (first card); `neutral` is the grey variant */
  tone?: "gold" | "neutral";
};

export function StatCard({ icon: Icon, value, label, trend, tone = "neutral" }: StatCardProps) {
  const negative = trend?.startsWith("-");

  return (
    <div className="rounded-xl border border-stone-line bg-white p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-[9px]",
            tone === "gold" ? "bg-gold-soft" : "bg-offwhite",
          )}
        >
          <Icon className={cn("size-[18px]", tone === "gold" ? "text-gold" : "text-charcoal")} />
        </div>
        {trend && <span className={cn("text-[11.5px] font-bold", negative ? "text-danger" : "text-success")}>{trend}</span>}
      </div>
      <div className="mb-1 font-display text-[30px] font-semibold">{value}</div>
      <div className="text-[12.5px] text-ink-soft">{label}</div>
    </div>
  );
}
