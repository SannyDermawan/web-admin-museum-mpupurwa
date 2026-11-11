import type { Request, Response } from "express";
import { authenticate } from "../services/auth.service";
import { bodyAsRecord, isNonEmptyString, isValidEmail, readText } from "../lib/validate";
import { fail, ok } from "../utils/response";
import { clearSessionCookie, createSessionToken, setSessionCookie } from "../utils/session";

// POST /api/auth/login   body: { email, password, remember? }
export async function login(req: Request, res: Response) {
  const body = bodyAsRecord(req.body);
  const email = readText(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const remember = body.remember === true;

  if (!email || !password) return fail(res, 400, "Email dan kata sandi wajib diisi.");
  if (!isValidEmail(email)) return fail(res, 400, "Format email tidak valid.");

  const result = await authenticate(email, password);
  if (!result.ok) {
    return result.reason === "inactive"
      ? fail(res, 403, "Akun kamu dinonaktifkan. Hubungi Super Admin.")
      : fail(res, 401, "Email atau kata sandi salah.");
  }

  setSessionCookie(req, res, createSessionToken(result.user.id, remember), remember);
  return ok(res, { user: result.user }, { message: "Berhasil masuk." });
}

// POST /api/auth/logout
export function logout(req: Request, res: Response) {
  clearSessionCookie(req, res);
  return ok(res, null, { message: "Berhasil keluar." });
}

// GET /api/auth/me   (needs login) the admin behind the cookie, so the frontend can restore the session.
export function me(req: Request, res: Response) {
  return ok(res, { user: req.user });
}

// POST /api/auth/forgot-password   body: { email }
// UTS: no email is sent. The answer is the same for every well-formed address,
// so the endpoint does not reveal which emails belong to admins.
export function forgotPassword(req: Request, res: Response) {
  const body = bodyAsRecord(req.body);
  const email = readText(body.email);

  if (!isNonEmptyString(email)) return fail(res, 400, "Email wajib diisi.");
  if (!isValidEmail(email)) return fail(res, 400, "Format email tidak valid.");

  return ok(res, null, {
    message: "Tautan atur ulang sudah dikirim. Cek kotak masuk email kamu, tautannya berlaku 30 menit.",
  });
}
