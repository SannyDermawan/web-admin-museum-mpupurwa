// Skema form halaman login dan lupa kata sandi.

import { z } from "zod";
import { emailSchema } from "@/lib/validations/common";

export const loginSchema = z.object({
  email: emailSchema,
  // Kata sandi tidak di-trim dan tidak dicek panjangnya: aturan sandi hanya dipakai saat membuat akun.
  password: z.string().min(1, "Kata sandi wajib diisi."),
  remember: z.boolean(),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
