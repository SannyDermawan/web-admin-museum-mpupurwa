// One shared Prisma client for the whole backend (a new client per request would exhaust database connections).
// In dev, tsx restarts the server on every change; keeping the client on globalThis avoids opening a new pool each time.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
