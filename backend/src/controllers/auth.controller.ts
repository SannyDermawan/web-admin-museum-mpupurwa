import type { Request, Response } from "express";
import { findAdminByCredentials } from "../data/auth";
import { bodyAsRecord, fail, ok } from "../utils/response";
import { clearSessionCookie, createSessionToken, setSessionCookie } from "../utils/session";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/login   body: { email, password, remember? }
export function login(req: Request, res: Response) {
  const body = bodyAsRecord(req.body);
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  const remember = body.remember === true;

  if (!email.trim() || !password) return fail(res, 400, "Email dan kata sandi wajib diisi.");

  const user = findAdminByCredentials(email, password);
  if (!user) return fail(res, 401, "Email atau kata sandi salah.");

  setSessionCookie(req, res, createSessionToken(user.id, remember), remember);
  return ok(res, { user }, { message: "Berhasil masuk." });
}

// POST /api/auth/logout
export function logout(req: Request, res: Response) {
  clearSessionCookie(req, res);
  return ok(res, null, { message: "Berhasil keluar." });
}

// POST /api/auth/forgot-password   body: { email }
// UTS: no email is sent. The answer is the same for every well-formed address,
// so the endpoint does not reveal which emails belong to admins.
export function forgotPassword(req: Request, res: Response) {
  const body = bodyAsRecord(req.body);
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!email) return fail(res, 400, "Email wajib diisi.");
  if (!EMAIL_PATTERN.test(email)) return fail(res, 400, "Format email tidak valid.");

  return ok(res, null, {
    message: "Tautan atur ulang sudah dikirim. Cek kotak masuk email kamu, tautannya berlaku 30 menit.",
  });
}
