import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "pending" | "confirmed" | "rejected" | "role" | "superRole";

const variants: Record<BadgeVariant, string> = {
  pending: "border-pending-line bg-pending-bg text-pending-ink",
  confirmed: "border-success-line bg-success-bg text-success",
  rejected: "border-danger-line bg-danger-bg text-danger",
  role: "border-stone-line bg-offwhite text-ink",
  superRole: "border-pending-line bg-gold-soft text-pending-ink",
};

/** Status / role pill (the design's `.badge`). */
export function Badge({
  variant,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] rounded-full border px-2.5 py-1 text-[11.5px] font-bold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
