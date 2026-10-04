import type { Request, Response } from "express";
import {
  adminEmailExists,
  createAdminAccount,
  deleteAdminAccount,
  deleteVisitorAccount,
  findAdminAccount,
  listAdminAccounts,
  listVisitorAccounts,
  updateAdminAccount,
  updateVisitorAccount,
} from "../data/accounts";
import type { AdminStatus, EducationLevel, User, UserRole } from "../types";
import { bodyAsRecord, fail, ok } from "../utils/response";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EDUCATION_LEVELS: EducationLevel[] = ["Mahasiswa", "Pelajar", "Umum"];
const ROLES: UserRole[] = ["admin", "super_admin"];
const STATUSES: AdminStatus[] = ["active", "inactive"];
const MAX_NAME_LENGTH = 100;
const MIN_PASSWORD_LENGTH = 8;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function queryParam(req: Request): string | undefined {
  return typeof req.query.q === "string" ? req.query.q : undefined;
}

/** The id from the URL. Express 5 types it as a string. */
function idParam(req: Request): string {
  return String(req.params.id);
}

// ---------- Visitor accounts ----------

// GET /api/accounts/visitors?q=amanda   (q is optional)
export function getVisitorAccounts(req: Request, res: Response) {
  return ok(res, { visitors: listVisitorAccounts(queryParam(req)) });
}

// PATCH /api/accounts/visitors/:id   body: { name, domicile, institution, educationLevel }
export function patchVisitorAccount(req: Request, res: Response) {
  const body = bodyAsRecord(req.body);
  const name = text(body.name);
  const domicile = text(body.domicile);
  const institutionText = text(body.institution);
  const institution = institutionText && institutionText !== "—" ? institutionText : null;
  const educationLevel = EDUCATION_LEVELS.find((level) => level === body.educationLevel);

  if (!name) return fail(res, 400, "Nama lengkap wajib diisi.");
  if (name.length > MAX_NAME_LENGTH) return fail(res, 400, `Nama lengkap maksimal ${MAX_NAME_LENGTH} karakter.`);
  if (!domicile) return fail(res, 400, "Domisili wajib diisi.");
  if (!educationLevel) return fail(res, 400, "Tingkat pendidikan tidak valid.");
  if (educationLevel !== "Umum" && !institution) {
    return fail(res, 400, "Asal sekolah / institusi wajib diisi untuk pelajar dan mahasiswa.");
  }

  const updated = updateVisitorAccount(idParam(req), { name, domicile, institution, educationLevel });
  if (!updated) return fail(res, 404, "Akun pengunjung tidak ditemukan.");
  return ok(res, updated, { message: "Perubahan akun berhasil disimpan." });
}

// DELETE /api/accounts/visitors/:id
export function removeVisitorAccount(req: Request, res: Response) {
  if (!deleteVisitorAccount(idParam(req))) return fail(res, 404, "Akun pengunjung tidak ditemukan.");
  return ok(res, null, { message: "Akun pengunjung berhasil dihapus." });
}

// ---------- Admin accounts ----------

// GET /api/accounts/admins?q=dewi   (q is optional)
export function getAdminAccounts(req: Request, res: Response) {
  return ok(res, { admins: listAdminAccounts(queryParam(req)) });
}

// POST /api/accounts/admins   body: { name, email, role, temporaryPassword }
export function postAdminAccount(req: Request, res: Response) {
  const body = bodyAsRecord(req.body);
  const name = text(body.name);
  const email = text(body.email);
  const role = ROLES.find((item) => item === body.role);
  const temporaryPassword = typeof body.temporaryPassword === "string" ? body.temporaryPassword : "";

  if (!name) return fail(res, 400, "Nama lengkap wajib diisi.");
  if (name.length > MAX_NAME_LENGTH) return fail(res, 400, `Nama lengkap maksimal ${MAX_NAME_LENGTH} karakter.`);
  if (!email) return fail(res, 400, "Email wajib diisi.");
  if (!EMAIL_PATTERN.test(email)) return fail(res, 400, "Format email tidak valid.");
  if (!role) return fail(res, 400, "Peran tidak valid.");
  if (temporaryPassword.length < MIN_PASSWORD_LENGTH) {
    return fail(res, 400, `Kata sandi sementara minimal ${MIN_PASSWORD_LENGTH} karakter.`);
  }
  if (adminEmailExists(email)) return fail(res, 409, "Email sudah dipakai akun admin lain.");

  const created = createAdminAccount({ name, email, role });
  return ok(res, created, { status: 201, message: "Akun admin berhasil dibuat." });
}

// PATCH /api/accounts/admins/:id   body: { name, role, status }
export function patchAdminAccount(req: Request, res: Response) {
  const current = findAdminAccount(idParam(req));
  if (!current) return fail(res, 404, "Akun admin tidak ditemukan.");

  const body = bodyAsRecord(req.body);
  const name = text(body.name);
  const role = ROLES.find((item) => item === body.role);
  const status = STATUSES.find((item) => item === body.status);

  if (!name) return fail(res, 400, "Nama lengkap wajib diisi.");
  if (name.length > MAX_NAME_LENGTH) return fail(res, 400, `Nama lengkap maksimal ${MAX_NAME_LENGTH} karakter.`);
  if (!role) return fail(res, 400, "Peran tidak valid.");
  if (!status) return fail(res, 400, "Status tidak valid.");

  const self = (res.locals.user as User).id === current.id;
  if (self && (role !== current.role || status !== current.status)) {
    return fail(res, 400, "Peran dan status akun sendiri tidak dapat diubah.");
  }

  const updated = updateAdminAccount(current.id, { name, role, status });
  return ok(res, updated, { message: "Perubahan akun berhasil disimpan." });
}

// DELETE /api/accounts/admins/:id
export function removeAdminAccount(req: Request, res: Response) {
  const id = idParam(req);
  if ((res.locals.user as User).id === id) return fail(res, 400, "Akun yang sedang kamu pakai tidak dapat dihapus.");
  if (!deleteAdminAccount(id)) return fail(res, 404, "Akun admin tidak ditemukan.");
  return ok(res, null, { message: "Akun admin berhasil dihapus." });
}
