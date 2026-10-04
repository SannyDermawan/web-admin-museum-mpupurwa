import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Required: the button has no visible text */
  label: string;
  /** Turns red on hover (delete) */
  danger?: boolean;
};

/** 32px square outlined button for row actions (the design's `.btn-icon`). Put an icon inside. */
export function IconButton({ label, danger = false, className, type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-8 items-center justify-center rounded-lg border border-stone-line text-ink-soft transition-colors hover:text-ink [&_svg]:size-[15px]",
        danger && "hover:border-danger-line hover:bg-danger-bg hover:text-danger",
        className,
      )}
      {...props}
    />
  );
}
