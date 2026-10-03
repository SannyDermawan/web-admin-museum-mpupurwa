import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "gold" | "outline" | "success" | "danger" | "ghost";

const base = "font-bold whitespace-nowrap transition-colors disabled:opacity-60";
const sizes = {
  default: "rounded-lg px-3.5 py-2 text-[12.5px]",
  block: "w-full rounded-[9px] p-[13px] text-[14px]",
  ghost: "rounded-lg p-2 text-[12.5px]",
};

const variants: Record<ButtonVariant, string> = {
  gold: "bg-gold text-charcoal hover:brightness-95",
  outline: "border border-stone-line bg-white text-ink hover:bg-offwhite",
  success: "border border-success-line bg-success-bg text-success hover:brightness-95",
  danger: "border border-danger-line bg-danger-bg text-danger hover:brightness-95",
  ghost: "text-ink-soft hover:text-ink",
};

/** Class names for a button look. Use it on a <Link> when a button must navigate. */
export function buttonStyles({ variant = "gold", block = false }: { variant?: ButtonVariant; block?: boolean } = {}) {
  const size = block ? sizes.block : variant === "ghost" ? sizes.ghost : sizes.default;
  return cn(base, size, variants[variant]);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** Full width, larger (used by the login form) */
  block?: boolean;
};

export function Button({ variant = "gold", block = false, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonStyles({ variant, block }), className)} {...props} />;
}
