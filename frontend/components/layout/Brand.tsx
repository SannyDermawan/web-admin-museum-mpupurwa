import { MuseumIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/** Logo mark + "Mpu Purwa / Admin Panel". `divider` adds the line under it (sidebar). */
export function Brand({ divider = false }: { divider?: boolean }) {
  return (
    <div className={cn("flex items-center gap-[11px]", divider && "mb-[22px] border-b border-white/10 px-2 pb-[26px]")}>
      <div className="flex size-[34px] flex-none items-center justify-center rounded-[9px] bg-gold">
        <MuseumIcon className="size-[18px] text-charcoal" />
      </div>
      <div>
        <div className="font-display text-base leading-[1.2] font-semibold text-white">Mpu Purwa</div>
        <div className="mt-px text-[11px] text-white/50">Admin Panel</div>
      </div>
    </div>
  );
}
