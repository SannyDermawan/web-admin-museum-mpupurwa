import { cn, getInitials } from "@/lib/utils";

/** Round initials badge. `light` is used in tables, `gold` for the signed-in admin. */
export function Avatar({ name, variant = "light" }: { name: string; variant?: "light" | "gold" }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex flex-none items-center justify-center rounded-full font-bold",
        variant === "light"
          ? "size-[30px] border border-stone-line bg-offwhite text-[11.5px] text-ink-soft"
          : "size-[34px] bg-gold text-[13px] text-charcoal",
      )}
    >
      {getInitials(name)}
    </div>
  );
}
