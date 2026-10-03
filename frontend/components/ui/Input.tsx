import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputStyles =
  "w-full rounded-lg border border-stone-line bg-white px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-gold";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  /** Rendered inside the field, on the right (e.g. the "Tampilkan" toggle) */
  endAdornment?: ReactNode;
};

export function Input({ label, error, endAdornment, id, className, ...props }: InputProps) {
  return (
    <div className="mb-3.5">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          className={cn(inputStyles, Boolean(endAdornment) && "pr-16", error && "border-danger", className)}
          {...props}
        />
        {endAdornment && <div className="absolute top-1/2 right-3 -translate-y-1/2">{endAdornment}</div>}
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
