// Model tabel `admins`: satu-satunya tempat query akun admin. Logika dan aturannya ada di services/.

import type { Prisma } from "@prisma/client";
import { prisma } from "../config/db";

/** Kolom yang boleh keluar ke panel admin. passwordHash sengaja tidak termasuk. */
export const adminSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  lastLoginAt: true,
} satisfies Prisma.AdminSelect;

export type AdminRecord = Prisma.AdminGetPayload<{ select: typeof adminSelect }>;

/** Lengkap dengan passwordHash: hanya untuk login. */
export const findAdminByEmailForLogin = (email: string) => prisma.admin.findUnique({ where: { email } });

export const findAdminRecord = (id: string) => prisma.admin.findUnique({ where: { id }, select: adminSelect });

export const touchAdminLastLogin = (id: string) => prisma.admin.update({ where: { id }, data: { lastLoginAt: new Date() } });

/** `search` adalah syarat OR; kosong = semua admin. */
export const listAdmins = (search: Prisma.AdminWhereInput[]) =>
  prisma.admin.findMany({ where: search.length > 0 ? { OR: search } : undefined, select: adminSelect, orderBy: { id: "asc" } });

export const listAdminIds = () => prisma.admin.findMany({ select: { id: true } });

export const insertAdmin = (data: Prisma.AdminCreateInput) => prisma.admin.create({ data, select: adminSelect });

export const countOtherActiveSuperAdmins = (id: string) =>
  prisma.admin.count({ where: { role: "super_admin", status: "active", id: { not: id } } });

export const updateAdmin = (id: string, data: Prisma.AdminUpdateInput) =>
  prisma.admin.update({ where: { id }, data, select: adminSelect });

export const removeAdmin = (id: string) => prisma.admin.delete({ where: { id } });
