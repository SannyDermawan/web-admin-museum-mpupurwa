// Model tabel `visitor_accounts` (akun pengunjung aplikasi mobile).

import type { Prisma } from "@prisma/client";
import { prisma } from "../config/db";

/** Kolom untuk halaman Manajemen Akun (tanpa created_at / updated_at). */
export const visitorListSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  domicile: true,
  institution: true,
  educationLevel: true,
  registeredAt: true,
  emailVerifiedAt: true,
} satisfies Prisma.VisitorAccountSelect;

export type VisitorListRecord = Prisma.VisitorAccountGetPayload<{ select: typeof visitorListSelect }>;

/** Kolom profil untuk pengunjung itu sendiri (aplikasi mobile). */
export const visitorProfileSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  domicile: true,
  institution: true,
  educationLevel: true,
  emailVerifiedAt: true,
} satisfies Prisma.VisitorAccountSelect;

export type VisitorProfileRecord = Prisma.VisitorAccountGetPayload<{ select: typeof visitorProfileSelect }>;

const contactSelect = { id: true, name: true, email: true } satisfies Prisma.VisitorAccountSelect;

export const listVisitors = (search: Prisma.VisitorAccountWhereInput[]) =>
  prisma.visitorAccount.findMany({
    where: search.length > 0 ? { OR: search } : undefined,
    select: visitorListSelect,
    orderBy: { id: "asc" },
  });

export const updateVisitor = (id: string, data: Prisma.VisitorAccountUpdateInput) =>
  prisma.visitorAccount.update({ where: { id }, data, select: visitorListSelect });

export const removeVisitor = (id: string) => prisma.visitorAccount.delete({ where: { id } });

export const findVisitorProfile = (id: string) =>
  prisma.visitorAccount.findUnique({ where: { id }, select: visitorProfileSelect });

export const findVisitorProfileByEmail = (email: string) =>
  prisma.visitorAccount.findUnique({ where: { email }, select: visitorProfileSelect });

export const findVisitorContactByEmail = (email: string) =>
  prisma.visitorAccount.findUnique({ where: { email }, select: contactSelect });

export const updateVisitorContact = (id: string, data: Prisma.VisitorAccountUpdateInput) =>
  prisma.visitorAccount.update({ where: { id }, data, select: contactSelect });

export const insertVisitor = (data: Prisma.VisitorAccountCreateInput) =>
  prisma.visitorAccount.create({ data, select: contactSelect });

export const listVisitorIds = () => prisma.visitorAccount.findMany({ select: { id: true } });

export const countVisitors = () => prisma.visitorAccount.count();

export const countVisitorsRegisteredSince = (since: Date) =>
  prisma.visitorAccount.count({ where: { registeredAt: { gte: since } } });
