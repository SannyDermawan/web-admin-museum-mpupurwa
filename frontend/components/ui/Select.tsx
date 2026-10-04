import type { SelectHTMLAttributes } from "react";
import { inputStyles } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

/** Dropdown with the same look as <Input> (the design's `.form-select`). Pass <option>s as children. */
export function Select({ label, error, id, className, children, ...props }: SelectProps) {
  return (
    <div className="mb-3.5">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-ink">
          {label}
        </label>
      )}
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(inputStyles, error && "border-danger", className)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
