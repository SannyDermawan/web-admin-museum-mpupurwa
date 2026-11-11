// Business logic of login. Controllers only read the request and send the response; the rules live here.

import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import type { User } from "../types";

type AdminRow = { id: string; name: string; email: string; role: User["role"] };

// Compared against when the email is unknown, so the answer takes as long as for a real account.
const DUMMY_HASH = "$2b$10$TP4gzYxJeAyDaqwgJ724cORAIx2wxakPAVPf5W4eXm7biBTexPqay";

function toUser({ id, name, email, role }: AdminRow): User {
  return { id, name, email, role };
}

export type LoginResult = { ok: true; user: User } | { ok: false; reason: "invalid" | "inactive" };

export async function authenticate(email: string, password: string): Promise<LoginResult> {
  const admin = await prisma.admin.findUnique({ where: { email: email.trim().toLowerCase() } });

  const passwordMatches = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !passwordMatches) return { ok: false, reason: "invalid" };
  // Only revealed once the password was right, so the answer does not leak which emails are admins.
  if (admin.status !== "active") return { ok: false, reason: "inactive" };

  await prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  return { ok: true, user: toUser(admin) };
}

/** The admin behind a login cookie. Inactive admins return null, so a deactivated account is logged out. */
export async function findAdminById(id: string): Promise<User | null> {
  const admin = await prisma.admin.findUnique({ where: { id } });
  return admin && admin.status === "active" ? toUser(admin) : null;
}
