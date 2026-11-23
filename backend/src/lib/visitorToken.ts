// Token login pengunjung untuk aplikasi mobile (dikirim sebagai header `Authorization: Bearer <token>`).
// Bentuknya sama seperti cookie admin (payload + tanda tangan HMAC), tetapi dengan KUNCI DAN AWALAN yang berbeda,
// jadi token pengunjung tidak pernah bisa dipakai sebagai sesi admin, dan sebaliknya.

import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../config";

const PREFIX = "vs1";
const THIRTY_DAYS = 30 * 24 * 60 * 60;

type VisitorTokenPayload = { sub: string; exp: number };

function key(): string {
  return createHmac("sha256", config.sessionSecret).update("visitor-session-v1").digest("hex");
}

function sign(body: string): string {
  return createHmac("sha256", key()).update(body).digest("base64url");
}

/** Token untuk satu akun pengunjung. Mengembalikan token dan kapan ia berakhir (ISO). */
export function createVisitorToken(accountId: string): { token: string; expiresAt: string } {
  const exp = Math.floor(Date.now() / 1000) + THIRTY_DAYS;
  const payload: VisitorTokenPayload = { sub: accountId, exp };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { token: `${PREFIX}.${body}.${sign(body)}`, expiresAt: new Date(exp * 1000).toISOString() };
}

/** Id akun dari token yang tanda tangannya benar dan belum kedaluwarsa, selain itu null. */
export function verifyVisitorToken(token: string | undefined): string | null {
  if (!token) return null;
  const [prefix, body, signature] = token.split(".");
  if (prefix !== PREFIX || !body || !signature) return null;

  const expected = Buffer.from(sign(body));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as VisitorTokenPayload;
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
    return payload.exp > Date.now() / 1000 ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Membaca token dari header `Authorization: Bearer ...`. */
export function readBearerToken(header: string | undefined): string | undefined {
  const match = /^Bearer\s+(\S+)$/i.exec(header ?? "");
  return match?.[1];
}
