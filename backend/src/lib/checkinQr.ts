// QR check-in di pintu masuk: isinya bertanda tangan dan berlaku HANYA pada tanggal di dalamnya.
//
//   MPUPURWA:2026-11-23:Xk3...   (awalan : tanggal Asia/Jakarta : tanda tangan HMAC)
//
// Admin menampilkan QR hari ini (halaman Pengunjung Hari Ini). Aplikasi mobile memindainya lalu mengirim
// isinya sebagai `qrToken` ke POST /api/public/visits. Server memeriksa tanda tangan dan tanggalnya, jadi
// orang yang tidak ada di museum tidak bisa mengarang check-in, dan QR kemarin tidak bisa dipakai lagi.

import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../config";
import { todayInMuseumTimezone } from "../services/dates";

export const CHECKIN_QR_PREFIX = "MPUPURWA";

/** Kunci khusus QR, diturunkan dari SESSION_SECRET (kecuali CHECKIN_QR_SECRET diisi), supaya tidak memakai kunci yang sama dengan cookie login. */
function signingKey(): string {
  return config.checkinQrSecret || createHmac("sha256", config.sessionSecret).update("checkin-qr-v1").digest("hex");
}

function sign(date: string): string {
  return createHmac("sha256", signingKey()).update(`checkin:${date}`).digest("base64url").slice(0, 22);
}

/** Isi QR untuk satu tanggal (YYYY-MM-DD). */
export function checkinQrPayload(date: string = todayInMuseumTimezone()): string {
  return `${CHECKIN_QR_PREFIX}:${date}:${sign(date)}`;
}

export type CheckinQrResult = { ok: true } | { ok: false; reason: "format" | "expired" | "signature" };

/** Memeriksa isi QR yang dikirim aplikasi. `today` bisa diisi untuk pengujian. */
export function verifyCheckinQr(token: unknown, today: string = todayInMuseumTimezone()): CheckinQrResult {
  if (typeof token !== "string") return { ok: false, reason: "format" };
  const match = /^MPUPURWA:(\d{4}-\d{2}-\d{2}):([A-Za-z0-9_-]{22})$/.exec(token.trim());
  if (!match) return { ok: false, reason: "format" };

  const [, date, signature] = match;
  // Tanda tangan diperiksa lebih dulu, dengan perbandingan waktu-konstan, baru tanggalnya.
  const expected = Buffer.from(sign(date));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false, reason: "signature" };
  if (date !== today) return { ok: false, reason: "expired" };
  return { ok: true };
}
