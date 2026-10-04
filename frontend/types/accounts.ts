// Types for the account management module (Manajemen Akun).
// These mirror backend/src/types/accounts.ts: change both together.

import type { EducationLevel, UserRole } from "./index";

// ---------- Visitor accounts (registered in the mobile app) ----------

export type VisitorAccount = {
  id: string;
  name: string;
  /** Shown masked, e.g. "0812-xxxx-3421" */
  phone: string;
  email: string;
  domicile: string;
  /** null when the visitor has no school / institution ("Umum") */
  institution: string | null;
  educationLevel: EducationLevel;
  /** ISO date (YYYY-MM-DD) the account was registered */
  registeredAt: string;
};

export type VisitorAccountsData = {
  visitors: VisitorAccount[];
};

/** Body of PATCH /api/accounts/visitors/:id */
export type UpdateVisitorAccountRequest = {
  name: string;
  domicile: string;
  institution: string | null;
  educationLevel: EducationLevel;
};

// ---------- Admin accounts ----------

export type AdminStatus = "active" | "inactive";

export type AdminAccount = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AdminStatus;
  /** ISO date-time with offset; null when the admin never logged in */
  lastLoginAt: string | null;
};

export type AdminAccountsData = {
  admins: AdminAccount[];
};

/** Body of POST /api/accounts/admins */
export type CreateAdminRequest = {
  name: string;
  email: string;
  role: UserRole;
  /** Temporary password; the new admin is asked to change it on first login */
  temporaryPassword: string;
};

/** Body of PATCH /api/accounts/admins/:id */
export type UpdateAdminRequest = {
  name: string;
  role: UserRole;
  status: AdminStatus;
};
