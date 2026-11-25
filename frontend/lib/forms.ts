import type { UseFormRegisterReturn } from "react-hook-form";
import { stripDigits } from "@/lib/validations/common";

/** Untuk kolom nama orang: angka langsung dibuang saat diketik atau ditempel. Dipakai: {...noDigits(register("name"))}. */
export function noDigits<Name extends string>(field: UseFormRegisterReturn<Name>): UseFormRegisterReturn<Name> {
  return {
    ...field,
    onChange: (event) => {
      const input = event.target as HTMLInputElement;
      const cleaned = stripDigits(input.value);
      // Only rewrite when something was removed, so the cursor does not jump while typing letters.
      if (cleaned !== input.value) input.value = cleaned;
      return field.onChange(event);
    },
  };
}
