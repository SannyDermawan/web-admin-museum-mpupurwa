import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** White bordered panel (the design's `.panel`). */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-hidden rounded-xl border border-stone-line bg-white", className)} {...props} />;
}

/** Panel title row with an optional subtitle and an optional action on the right (e.g. a "Lihat semua" link). */
export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-stone-line px-[22px] py-[18px]">
      <div className="min-w-0">
        <h2 className="text-base">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
