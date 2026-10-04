import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/** Search box that sits inside a page's own toolbar (same look as the one on Akun Pengunjung). */
export function SearchField({
  value,
  onChange,
  label,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Accessible name, e.g. "Cari pengunjung" */
  label: string;
  placeholder: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-[280px] max-w-full items-center gap-2 rounded-[9px] border border-stone-line bg-offwhite px-3.5 py-[9px]",
        className,
      )}
    >
      <SearchIcon className="size-[15px] flex-none text-ink-soft" />
      <input
        type="text"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-[13px] text-ink outline-none"
      />
    </div>
  );
}
