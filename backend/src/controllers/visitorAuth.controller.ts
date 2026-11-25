// Endpoint auth pengunjung untuk aplikasi mobile. Controller hanya membaca dan memeriksa input lalu memanggil service.
//
//   POST /api/public/auth/register     { name, email, phone, domicile, institution?, educationLevel }  -> kirim OTP
//   POST /api/public/auth/login        { email }                                                       -> kirim OTP
//   POST /api/public/auth/verify-otp   { email, code }                                                 -> { token, expiresAt, account }
//   GET  /api/public/auth/me           (Authorization: Bearer <token>)                                 -> { account }

import type { NextFunction, Request, Response } from "express";
import { PERSON_NAME_RULE, bodyAsRecord, isOneOf, isPersonName, isValidEmail, readText } from "../lib/validate";
import {
  OTP_RESEND_SECONDS,
  OTP_TTL_SECONDS,
  VisitorAuthError,
  loginVisitor,
  registerVisitor,
  verifyVisitorOtp,
  type OtpIssued,
} from "../services/visitorAuth.service";
import { MailError } from "../services/mailer";
import { fail, ok } from "../utils/response";

const EDUCATION_LEVELS = ["Mahasiswa", "Pelajar", "Umum"] as const;

/** Error yang memang untuk pengunjung dibalas apa adanya; error lain diteruskan ke errorHandler (500, detail hanya di log). */
function handleError(res: Response, next: NextFunction, error: unknown) {
  if (error instanceof VisitorAuthError || error instanceof MailError) return fail(res, error.status, error.message);
  return next(error);
}

function readEmail(value: unknown): string | null {
  const email = readText(value).toLowerCase();
  return email.length <= 150 && isValidEmail(email) ? email : null;
}

function otpResponse(email: string, issued: OtpIssued) {
  return {
    email,
    otpSent: true,
    expiresInSeconds: OTP_TTL_SECONDS,
    resendAfterSeconds: OTP_RESEND_SECONDS,
    // Hanya ada di development (OTP_DEV_ECHO); di production tidak pernah dikirim.
    ...(issued.devCode ? { devCode: issued.devCode } : {}),
  };
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const body = bodyAsRecord(req.body);

    const name = readText(body.name);
    if (!name) return fail(res, 400, "Nama wajib diisi.");
    if (!isPersonName(name)) return fail(res, 400, `Nama ${PERSON_NAME_RULE}`);
    if (name.length > 100) return fail(res, 400, "Nama maksimal 100 karakter.");

    const email = readEmail(body.email);
    if (!email) return fail(res, 400, "Format email tidak valid.");

    const phone = readText(body.phone);
    if (!/^[0-9+\-\s]{8,20}$/.test(phone)) return fail(res, 400, "Nomor HP tidak valid.");

    const domicile = readText(body.domicile);
    if (!domicile) return fail(res, 400, "Domisili wajib diisi.");
    if (domicile.length > 80) return fail(res, 400, "Domisili maksimal 80 karakter.");

    const institution = readText(body.institution);
    if (institution.length > 150) return fail(res, 400, "Institusi maksimal 150 karakter.");

    const educationLevel = body.educationLevel ?? "Umum";
    if (!isOneOf(educationLevel, EDUCATION_LEVELS)) return fail(res, 400, "Jenjang harus Mahasiswa, Pelajar, atau Umum.");

    const issued = await registerVisitor({ name, email, phone, domicile, institution: institution || null, educationLevel });
    return ok(res, otpResponse(email, issued), { status: 201, message: "Kode verifikasi dikirim ke email kamu." });
  } catch (error) {
    return handleError(res, next, error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const email = readEmail(bodyAsRecord(req.body).email);
    if (!email) return fail(res, 400, "Format email tidak valid.");

    const issued = await loginVisitor(email);
    // Jawabannya sama untuk email yang terdaftar maupun tidak, supaya orang tidak bisa menebak siapa saja yang terdaftar.
    return ok(res, otpResponse(email, issued), { message: "Jika email terdaftar, kode masuk sudah dikirim." });
  } catch (error) {
    return handleError(res, next, error);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const body = bodyAsRecord(req.body);
    const email = readEmail(body.email);
    if (!email) return fail(res, 400, "Format email tidak valid.");

    const code = readText(body.code);
    if (!/^\d{6}$/.test(code)) return fail(res, 400, "Kode harus 6 digit angka.");

    const result = await verifyVisitorOtp(email, code);
    req.log.info({ event: "visitor_login", visitorId: result.account.id }, "Visitor logged in");
    return ok(res, result, { message: "Berhasil masuk." });
  } catch (error) {
    if (error instanceof VisitorAuthError) {
      req.log.warn({ event: "visitor_otp_failed", status: error.status }, "Visitor OTP failed");
    }
    return handleError(res, next, error);
  }
}

export function me(req: Request, res: Response) {
  return ok(res, { account: req.visitor });
}
