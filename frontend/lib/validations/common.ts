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

/** Nama orang: huruf (termasuk beraksen), spasi, titik, koma, apostrof, dan tanda hubung. Sama dengan backend. */
export const PERSON_NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .,'’-]*$/u;
export const PERSON_NAME_MESSAGE = "Nama hanya boleh berisi huruf, spasi, titik, koma, apostrof, dan tanda hubung (tanpa angka).";

/** Membuang angka dari teks, dipakai saat mengetik di kolom nama. */
export const stripDigits = (value: string) => value.replace(/\p{N}/gu, "");

/** Link video YouTube. Sama dengan backend/src/lib/validate.ts (isYouTubeUrl). */
export function isYouTubeUrl(value: string): boolean {
  if (/\s/.test(value)) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;

  const host = url.hostname.toLowerCase().replace(/^(www|m)\./, "");
  const videoId = /^[A-Za-z0-9_-]{11}$/;
  if (host === "youtu.be") return videoId.test(url.pathname.slice(1));
  if (host !== "youtube.com") return false;
  if (url.pathname === "/watch") return videoId.test(url.searchParams.get("v") ?? "");
  const match = /^\/(shorts|embed|live)\/([^/]+)\/?$/.exec(url.pathname);
  return match !== null && videoId.test(match[2]);
}

/** Link berkas Google Drive. Sama dengan backend/src/lib/validate.ts (isGoogleDriveFileUrl). */
export function isGoogleDriveFileUrl(value: string): boolean {
  if (/\s/.test(value)) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;

  const id = /^[A-Za-z0-9_-]+$/;
  if (url.hostname === "drive.google.com") {
    if (url.pathname === "/open" || url.pathname === "/uc") return id.test(url.searchParams.get("id") ?? "");
    return /^\/file\/d\/[A-Za-z0-9_-]+(\/(view|preview|edit))?\/?$/.test(url.pathname);
  }
  if (url.hostname === "docs.google.com") return /^\/document\/d\/[A-Za-z0-9_-]+(\/[a-z]*)?\/?$/.test(url.pathname);
  return false;
}
