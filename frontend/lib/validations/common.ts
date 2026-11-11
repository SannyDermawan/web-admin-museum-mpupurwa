import { z } from "zod";

/** Teks wajib: di-trim dulu, lalu tidak boleh kosong. */
export const requiredText = (message: string) => z.string().trim().min(1, message);

/** Sama dengan pola email di backend (accounts.controller.ts). */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailSchema = requiredText("Email wajib diisi.").regex(EMAIL_PATTERN, "Format email tidak valid.");
