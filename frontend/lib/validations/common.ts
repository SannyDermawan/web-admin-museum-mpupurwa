import { z } from "zod";

/** Teks wajib: di-trim dulu, lalu tidak boleh kosong. */
export const requiredText = (message: string) => z.string().trim().min(1, message);

/** Sama dengan pola email di backend (accounts.controller.ts). */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailSchema = requiredText("Email wajib diisi.").regex(EMAIL_PATTERN, "Format email tidak valid.");

/**
 * Kata sandi baru (mis. sandi sementara admin). Aturannya HARUS sama dengan backend/src/lib/validatePassword.ts:
 * minimal 8 karakter, memuat huruf kecil, huruf besar, dan angka.
 */
export const passwordSchema = z
  .string()
  .min(1, "Kata sandi wajib diisi.")
  .min(8, "Kata sandi minimal 8 karakter.")
  .regex(/[a-z]/, "Kata sandi harus memuat huruf kecil.")
  .regex(/[A-Z]/, "Kata sandi harus memuat huruf besar.")
  .regex(/[0-9]/, "Kata sandi harus memuat angka.");
