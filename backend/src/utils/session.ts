// Minimal cookie session for the UTS (no auth framework).
// The cookie value is `base64url(payload).base64url(HMAC-SHA256 signature)`, so it
// cannot be edited or forged without SESSION_SECRET.

import { createHmac, timingSafeEqual } from "node:crypto";
import type { CookieOptions, Request, Response } from "express";
import { config } from "../config";

export const SESSION_COOKIE = "mpu_session";

const HOUR = 60 * 60;
/** Lifetime of the signed token without "remember me" (the cookie itself ends with the browser session) */
const SESSION_TTL = 8 * HOUR;
const REMEMBER_TTL = 30 * 24 * HOUR;

type SessionPayload = { sub: string; exp: number };

function sign(body: string): string {
  return createHmac("sha256", config.sessionSecret).update(body).digest("base64url");
}

export function createSessionToken(userId: string, remember: boolean): string {
  const ttl = remember ? REMEMBER_TTL : SESSION_TTL;
  const payload: SessionPayload = { sub: userId, exp: Math.floor(Date.now() / 1000) + ttl };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Returns the payload when the signature is valid and the token is not expired, otherwise null. */
export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = Buffer.from(sign(body));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
    return payload.exp > Date.now() / 1000 ? payload : null;
  } catch {
    return null;
  }
}

/** Reads one cookie from the request (no cookie-parser needed). */
export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator !== -1 && part.slice(0, separator).trim() === name) {
      return decodeURIComponent(part.slice(separator + 1).trim());
    }
  }
  return undefined;
}

// Frontend (:3000) and backend (:5000) share the host "localhost", so they are
// the same *site* and a Lax cookie is sent with the frontend's fetch calls.
// If they are ever deployed on different domains, this needs sameSite: "none" + secure.
function cookieOptions(req: Request): CookieOptions {
  return { httpOnly: true, sameSite: "lax", path: "/", secure: req.secure };
}

export function setSessionCookie(req: Request, res: Response, token: string, remember: boolean) {
  // Without "remember" no maxAge is set, so the browser drops the cookie when it closes.
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions(req), ...(remember ? { maxAge: REMEMBER_TTL * 1000 } : {}) });
}

export function clearSessionCookie(req: Request, res: Response) {
  res.clearCookie(SESSION_COOKIE, cookieOptions(req));
}
