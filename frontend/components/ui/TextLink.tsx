import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type TextLinkProps = ComponentProps<typeof Link> & {
  /** The design uses charcoal on card headers ("Lihat semua") and ink in forms ("Lupa kata sandi?") */
  tone?: "ink" | "charcoal";
};

/** Bold link with the gold underline. */
export function TextLink({ tone = "ink", className, ...props }: TextLinkProps) {
  return (
    <Link
      className={cn(
        "border-b-[1.5px] border-gold pb-px text-[12.5px] font-bold",
        tone === "ink" ? "text-ink" : "text-charcoal",
        className,
      )}
      {...props}
    />
  );
}
