// Controllers of the account management module: read the request, validate it, call the service, send the response.
// No database queries and no business rules here: those live in services/accounts.service.ts.

import type { Request, Response } from "express";
import { isOneOf, isValidEmail, readText, bodyAsRecord, PERSON_NAME_RULE, isPersonName } from "../lib/validate";
import { validatePassword } from "../lib/validatePassword";
import {
  AccountError,
  createAdminAccount,
  deleteAdminAccount,
  deleteVisitorAccount,
  listAdminAccounts,
  listVisitorAccounts,
  updateAdminAccount,
  updateVisitorAccount,
} from "../services/accounts.service";
import type { AdminStatus, EducationLevel, UserRole } from "../types";
import { fail, ok } from "../utils/response";

const EDUCATION_LEVELS: readonly EducationLevel[] = ["Mahasiswa", "Pelajar", "Umum"];
const ROLES: readonly UserRole[] = ["admin", "super_admin"];
const STATUSES: readonly AdminStatus[] = ["active", "inactive"];

// Limits follow the column sizes in prisma/schema.prisma, so too-long text is a 400 and not a database error.
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 150;
const MAX_DOMICILE_LENGTH = 80;
const MAX_INSTITUTION_LENGTH = 150;
// bcrypt only uses the first 72 bytes of a password.
const MAX_PASSWORD_BYTES = 72;

function queryParam(req: Request): string | undefined {
  return typeof req.query.q === "string" ? req.query.q : undefined;
}

/** The id from the URL. Express 5 types it as a string. */
function idParam(req: Request): string {
  return String(req.params.id);
}

/** The logged-in admin. requireAuth runs before every account route, so this is only a safety net for the types. */
function actorId(req: Request): string {
  if (!req.user) throw new AccountError(400, "Silakan masuk terlebih dahulu.");
  return req.user.id;
}

/** A rule of the module was broken -> answer with its status. Anything else is a real error and goes to the error handler (500). */
function handleError(res: Response, error: unknown) {
  if (error instanceof AccountError) return fail(res, error.status, error.message);
  throw error;
}

/** Message for an invalid name, or null. */
function checkName(name: string): string | null {
  if (!name) return "Nama lengkap wajib diisi.";
  if (!isPersonName(name)) return `Nama lengkap ${PERSON_NAME_RULE}`;
  if (name.length > MAX_NAME_LENGTH) return `Nama lengkap maksimal ${MAX_NAME_LENGTH} karakter.`;
  return null;
}

// ---------- Visitor accounts ----------

// GET /api/accounts/visitors?q=amanda   (q is optional)
export async function getVisitorAccounts(req: Request, res: Response) {
  return ok(res, { visitors: await listVisitorAccounts(queryParam(req)) });
}

// PATCH /api/accounts/visitors/:id   body: { name, domicile, institution, educationLevel }
export async function patchVisitorAccount(req: Request, res: Response) {
  const body = bodyAsRecord(req.body);
  const name = readText(body.name);
  const domicile = readText(body.domicile);
  const institutionText = readText(body.institution);
  const institution = institutionText && institutionText !== "—" ? institutionText : null;
  const educationLevel = body.educationLevel;

  const nameError = checkName(name);
  if (nameError) return fail(res, 400, nameError);
  if (!domicile) return fail(res, 400, "Domisili wajib diisi.");
  if (domicile.length > MAX_DOMICILE_LENGTH) return fail(res, 400, `Domisili maksimal ${MAX_DOMICILE_LENGTH} karakter.`);
  if (!isOneOf(educationLevel, EDUCATION_LEVELS)) return fail(res, 400, "Tingkat pendidikan tidak valid.");
  if (educationLevel !== "Umum" && !institution) {
    return fail(res, 400, "Asal sekolah / institusi wajib diisi untuk pelajar dan mahasiswa.");
  }
  if (institution && institution.length > MAX_INSTITUTION_LENGTH) {
    return fail(res, 400, `Asal sekolah / institusi maksimal ${MAX_INSTITUTION_LENGTH} karakter.`);
  }

  try {
    const updated = await updateVisitorAccount(idParam(req), { name, domicile, institution, educationLevel });
    return ok(res, updated, { message: "Perubahan akun berhasil disimpan." });
  } catch (error) {
    return handleError(res, error);
  }
}

// DELETE /api/accounts/visitors/:id
export async function removeVisitorAccount(req: Request, res: Response) {
  try {
    await deleteVisitorAccount(idParam(req));
    return ok(res, null, { message: "Akun pengunjung berhasil dihapus." });
  } catch (error) {
    return handleError(res, error);
  }
}

// ---------- Admin accounts ----------

// GET /api/accounts/admins?q=dewi   (q is optional)
export async function getAdminAccounts(req: Request, res: Response) {
  return ok(res, { admins: await listAdminAccounts(queryParam(req)) });
}

// POST /api/accounts/admins   body: { name, email, role, temporaryPassword }
export async function postAdminAccount(req: Request, res: Response) {
  const body = bodyAsRecord(req.body);
  const name = readText(body.name);
  const email = readText(body.email);
  const role = body.role;
  const temporaryPassword = body.temporaryPassword;

  const nameError = checkName(name);
  if (nameError) return fail(res, 400, nameError);
  if (!email) return fail(res, 400, "Email wajib diisi.");
  if (!isValidEmail(email)) return fail(res, 400, "Format email tidak valid.");
  if (email.length > MAX_EMAIL_LENGTH) return fail(res, 400, `Email maksimal ${MAX_EMAIL_LENGTH} karakter.`);
  if (!isOneOf(role, ROLES)) return fail(res, 400, "Peran tidak valid.");
  const passwordError = validatePassword(temporaryPassword);
  if (passwordError) return fail(res, 400, passwordError);
  if (Buffer.byteLength(temporaryPassword as string) > MAX_PASSWORD_BYTES) {
    return fail(res, 400, `Kata sandi maksimal ${MAX_PASSWORD_BYTES} karakter.`);
  }

  try {
    const created = await createAdminAccount({ name, email, role, temporaryPassword: temporaryPassword as string });
    return ok(res, created, { status: 201, message: "Akun admin berhasil dibuat." });
  } catch (error) {
    return handleError(res, error);
  }
}

// PATCH /api/accounts/admins/:id   body: { name, role, status }
export async function patchAdminAccount(req: Request, res: Response) {
  const body = bodyAsRecord(req.body);
  const name = readText(body.name);
  const role = body.role;
  const status = body.status;

  const nameError = checkName(name);
  if (nameError) return fail(res, 400, nameError);
  if (!isOneOf(role, ROLES)) return fail(res, 400, "Peran tidak valid.");
  if (!isOneOf(status, STATUSES)) return fail(res, 400, "Status tidak valid.");

  try {
    const updated = await updateAdminAccount(actorId(req), idParam(req), { name, role, status });
    return ok(res, updated, { message: "Perubahan akun berhasil disimpan." });
  } catch (error) {
    return handleError(res, error);
  }
}

// DELETE /api/accounts/admins/:id
export async function removeAdminAccount(req: Request, res: Response) {
  try {
    await deleteAdminAccount(actorId(req), idParam(req));
    return ok(res, null, { message: "Akun admin berhasil dihapus." });
  } catch (error) {
    return handleError(res, error);
  }
}
