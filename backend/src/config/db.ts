// Koneksi database: satu Prisma client untuk seluruh backend (client baru per request akan menghabiskan koneksi).
// Alamat database dibaca Prisma dari DATABASE_URL (lihat .env.example). Skema ada di prisma/schema.prisma.
// Saat development tsx memuat ulang server di tiap perubahan, jadi client disimpan di globalThis.
// Hanya folder models/ yang memakai client ini.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
