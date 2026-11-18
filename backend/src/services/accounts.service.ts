// Business logic and database queries of the account management module (Manajemen Akun).
// Controllers only read the request and send the response; the rules live here.
// passwordHash is never selected for the lists and never returned: see toAdminAccount().

import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import type {
  AdminAccount,
  AdminStatus,
  CreateAdminRequest,
  EducationLevel,
  UpdateAdminRequest,
  UpdateVisitorAccountRequest,
  UserRole,
  VisitorAccount,
} from "../types";
import { toIsoDate } from "./dates";

const EDUCATION_LEVELS: EducationLevel[] = ["Mahasiswa", "Pelajar", "Umum"];
const ROLES: UserRole[] = ["super_admin", "admin"];
const BCRYPT_COST = 10;
const ADMIN_ID_PREFIX = "ADM-";
const MAX_ID_ATTEMPTS = 3;

/** A rule of the module was broken. The controller turns it into a response with `status`. */
export class AccountError extends Error {
  constructor(
    readonly status: 400 | 404 | 409,
    message: string,
  ) {
    super(message);
    this.name = "AccountError";
  }
}

function isPrismaError(error: unknown, code: string): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

/** The id does not exist (Prisma P2025 on update / delete) -> 404, anything else is rethrown. */
function notFoundOr(error: unknown, message: string): never {
  if (isPrismaError(error, "P2025")) throw new AccountError(404, message);
  throw error;
}

// ---------- Visitor accounts ----------

const VISITOR_NOT_FOUND = "Akun pengunjung tidak ditemukan.";

// Only the columns the API sends: no created_at / updated_at.
const visitorSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  domicile: true,
  institution: true,
  educationLevel: true,
  registeredAt: true,
} satisfies Prisma.VisitorAccountSelect;

type VisitorRow = Prisma.VisitorAccountGetPayload<{ select: typeof visitorSelect }>;

function toVisitorAccount(row: VisitorRow): VisitorAccount {
  return { ...row, registeredAt: toIsoDate(row.registeredAt) };
}

/** Optional `query` matches name, phone, email, domicile, institution or education level. */
export async function listVisitorAccounts(query?: string): Promise<VisitorAccount[]> {
  const needle = query?.trim();
  const search: Prisma.VisitorAccountWhereInput[] = needle
    ? [
        { name: { contains: needle } },
        { phone: { contains: needle } },
        { email: { contains: needle } },
        { domicile: { contains: needle } },
        { institution: { contains: needle } },
        // educationLevel is an enum, so `contains` is not possible: pick the levels whose label matches.
        { educationLevel: { in: EDUCATION_LEVELS.filter((level) => level.toLowerCase().includes(needle.toLowerCase())) } },
      ]
    : [];

  const rows = await prisma.visitorAccount.findMany({
    where: search.length > 0 ? { OR: search } : undefined,
    select: visitorSelect,
    orderBy: { id: "asc" },
  });
  return rows.map(toVisitorAccount);
}

export async function updateVisitorAccount(id: string, input: UpdateVisitorAccountRequest): Promise<VisitorAccount> {
  try {
    const row = await prisma.visitorAccount.update({ where: { id }, data: input, select: visitorSelect });
    return toVisitorAccount(row);
  } catch (error) {
    return notFoundOr(error, VISITOR_NOT_FOUND);
  }
}

/** Check-ins of this visitor stay: visits.visitor_account_id is ON DELETE SET NULL, and visits hold their own copy of the name. */
export async function deleteVisitorAccount(id: string): Promise<void> {
  try {
    await prisma.visitorAccount.delete({ where: { id } });
  } catch (error) {
    notFoundOr(error, VISITOR_NOT_FOUND);
  }
}

// ---------- Admin accounts ----------

const ADMIN_NOT_FOUND = "Akun admin tidak ditemukan.";

// passwordHash is deliberately not in this list.
const adminSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  lastLoginAt: true,
} satisfies Prisma.AdminSelect;

type AdminRow = Prisma.AdminGetPayload<{ select: typeof adminSelect }>;

function toAdminAccount(row: AdminRow): AdminAccount {
  return { ...row, lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null };
}

/** Optional `query` matches name, email or role. */
export async function listAdminAccounts(query?: string): Promise<AdminAccount[]> {
  const needle = query?.trim();
  const search: Prisma.AdminWhereInput[] = needle
    ? [
        { name: { contains: needle } },
        { email: { contains: needle } },
        // role is an enum: "super admin" and "super_admin" both find super admins.
        { role: { in: ROLES.filter((role) => role.includes(needle.toLowerCase().replace(/\s+/g, "_"))) } },
      ]
    : [];

  const rows = await prisma.admin.findMany({
    where: search.length > 0 ? { OR: search } : undefined,
    select: adminSelect,
    orderBy: { id: "asc" },
  });
  return rows.map(toAdminAccount);
}

/** "ADM-004" for the next admin: the highest number in use plus one (numbers of deleted admins are not reused while a higher one exists). */
async function nextAdminId(): Promise<string> {
  const rows = await prisma.admin.findMany({ select: { id: true } });
  const highest = rows.reduce((max, { id }) => {
    const number = id.startsWith(ADMIN_ID_PREFIX) ? Number.parseInt(id.slice(ADMIN_ID_PREFIX.length), 10) : 0;
    return Number.isFinite(number) ? Math.max(max, number) : max;
  }, 0);
  return `${ADMIN_ID_PREFIX}${String(highest + 1).padStart(3, "0")}`;
}

/** Prisma P2002 on the email column (the other unique column is the id). */
function isEmailConflict(error: unknown): boolean {
  if (!isPrismaError(error, "P2002")) return false;
  const target = error.meta?.target;
  const text = Array.isArray(target) ? target.join(",") : String(target ?? "");
  return text.includes("email");
}

/** The password is hashed with bcrypt before it is stored. The caller has already validated its strength. */
export async function createAdminAccount(input: CreateAdminRequest): Promise<AdminAccount> {
  // Login looks the email up in lowercase, so it is stored in lowercase.
  const email = input.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(input.temporaryPassword, BCRYPT_COST);

  // Two admins created at the same moment can pick the same id: the second one fails with P2002 on the id and tries again.
  for (let attempt = 1; ; attempt++) {
    try {
      const row = await prisma.admin.create({
        data: { id: await nextAdminId(), name: input.name, email, passwordHash, role: input.role, status: "active" },
        select: adminSelect,
      });
      return toAdminAccount(row);
    } catch (error) {
      if (isEmailConflict(error)) throw new AccountError(409, "Email sudah terdaftar.");
      if (isPrismaError(error, "P2002") && attempt < MAX_ID_ATTEMPTS) continue;
      throw error;
    }
  }
}

/** True when `id` is an active super admin and no other active super admin exists. */
async function isLastActiveSuperAdmin(target: { id: string; role: UserRole; status: AdminStatus }): Promise<boolean> {
  if (target.role !== "super_admin" || target.status !== "active") return false;
  const others = await prisma.admin.count({ where: { role: "super_admin", status: "active", id: { not: target.id } } });
  return others === 0;
}

/** `actorId` is the logged-in admin: nobody may change their own role or status. */
export async function updateAdminAccount(actorId: string, id: string, input: UpdateAdminRequest): Promise<AdminAccount> {
  const current = await prisma.admin.findUnique({ where: { id }, select: adminSelect });
  if (!current) throw new AccountError(404, ADMIN_NOT_FOUND);

  if (actorId === current.id && (input.role !== current.role || input.status !== current.status)) {
    throw new AccountError(400, "Peran dan status akun sendiri tidak dapat diubah.");
  }
  const losesSuperAdmin = input.role !== "super_admin" || input.status !== "active";
  if (losesSuperAdmin && (await isLastActiveSuperAdmin(current))) {
    throw new AccountError(400, "Super Admin terakhir tidak dapat dinonaktifkan atau diubah perannya.");
  }

  try {
    const row = await prisma.admin.update({ where: { id }, data: input, select: adminSelect });
    return toAdminAccount(row);
  } catch (error) {
    return notFoundOr(error, ADMIN_NOT_FOUND);
  }
}

export async function deleteAdminAccount(actorId: string, id: string): Promise<void> {
  if (actorId === id) throw new AccountError(400, "Akun yang sedang kamu pakai tidak dapat dihapus.");

  const current = await prisma.admin.findUnique({ where: { id }, select: adminSelect });
  if (!current) throw new AccountError(404, ADMIN_NOT_FOUND);
  if (await isLastActiveSuperAdmin(current)) {
    throw new AccountError(400, "Super Admin terakhir tidak dapat dihapus.");
  }

  try {
    await prisma.admin.delete({ where: { id } });
  } catch (error) {
    notFoundOr(error, ADMIN_NOT_FOUND);
  }
}
