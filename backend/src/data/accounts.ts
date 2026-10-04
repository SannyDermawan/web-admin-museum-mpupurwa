// Dummy account lists for the Manajemen Akun module (UTS). Kept in memory, so edits and
// deletes last until the backend restarts. For UAS replace the bodies with real database
// queries and keep the function signatures, so controllers do not change.

import type {
  AdminAccount,
  CreateAdminRequest,
  UpdateAdminRequest,
  UpdateVisitorAccountRequest,
  VisitorAccount,
} from "../types";

// ---------- Visitor accounts ----------

const visitorAccounts: VisitorAccount[] = [
  { id: "ACC-001", name: "Amanda Putri", phone: "0812-xxxx-3421", email: "amanda@gmail.com", domicile: "Surabaya", institution: "Univ. Airlangga", educationLevel: "Mahasiswa", registeredAt: "2026-08-12" },
  { id: "ACC-002", name: "Bagas Pratama", phone: "0813-xxxx-1092", email: "bagas@gmail.com", domicile: "Malang", institution: "SMAN 3 Malang", educationLevel: "Pelajar", registeredAt: "2026-08-20" },
  { id: "ACC-003", name: "Citra Ayu Lestari", phone: "0857-xxxx-4433", email: "citra@gmail.com", domicile: "Malang", institution: "Univ. Brawijaya", educationLevel: "Mahasiswa", registeredAt: "2026-09-01" },
  { id: "ACC-004", name: "Dimas Setiawan", phone: "0895-xxxx-7765", email: "dimas@gmail.com", domicile: "Blitar", institution: null, educationLevel: "Umum", registeredAt: "2026-09-15" },
  { id: "ACC-005", name: "Eka Nur Fadila", phone: "0821-xxxx-9012", email: "eka@gmail.com", domicile: "Malang", institution: "SDN Merjosari 1", educationLevel: "Pelajar", registeredAt: "2026-09-18" },
  { id: "ACC-006", name: "Fajar Ramadhan", phone: "0812-xxxx-5541", email: "fajar@gmail.com", domicile: "Kediri", institution: "Univ. Brawijaya", educationLevel: "Mahasiswa", registeredAt: "2026-09-22" },
];

function matches(query: string | undefined, fields: Array<string | null>): boolean {
  const needle = query?.trim().toLowerCase();
  return !needle || fields.join(" ").toLowerCase().includes(needle);
}

/** Optional `query` filters by name, phone, email, domicile, institution or education level. */
export function listVisitorAccounts(query?: string): VisitorAccount[] {
  return visitorAccounts.filter((account) =>
    matches(query, [account.name, account.phone, account.email, account.domicile, account.institution, account.educationLevel]),
  );
}

/** Returns the updated account, or null when the id does not exist. */
export function updateVisitorAccount(id: string, input: UpdateVisitorAccountRequest): VisitorAccount | null {
  const account = visitorAccounts.find((item) => item.id === id);
  if (!account) return null;
  Object.assign(account, input);
  return account;
}

/** Returns false when the id does not exist. */
export function deleteVisitorAccount(id: string): boolean {
  const index = visitorAccounts.findIndex((item) => item.id === id);
  if (index === -1) return false;
  visitorAccounts.splice(index, 1);
  return true;
}

// ---------- Admin accounts ----------

/** Date-time `daysAgo` days before today (museum timezone), e.g. "2026-10-03T08:02:00+07:00". */
function loginTime(daysAgo: number, time: string): string {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
  const day = new Date(`${today}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() - daysAgo);
  return `${day.toISOString().slice(0, 10)}T${time}:00+07:00`;
}

// ADM-001 is the account that logs in (see data/auth.ts), so the list can mark it as "Akun kamu".
const adminAccounts: AdminAccount[] = [
  { id: "ADM-001", name: "Rizal Pradana", email: "rizal@mpupurwa.id", role: "super_admin", status: "active", lastLoginAt: loginTime(0, "08:02") },
  { id: "ADM-002", name: "Dewi Anggraini", email: "dewi@mpupurwa.id", role: "admin", status: "active", lastLoginAt: loginTime(1, "15:40") },
  { id: "ADM-003", name: "Hadi Kurniawan", email: "hadi@mpupurwa.id", role: "admin", status: "inactive", lastLoginAt: "2026-09-12T10:15:00+07:00" },
];

let lastAdminNumber = 3;

export function findAdminAccount(id: string): AdminAccount | null {
  return adminAccounts.find((item) => item.id === id) ?? null;
}

export function adminEmailExists(email: string, exceptId?: string): boolean {
  const needle = email.trim().toLowerCase();
  return adminAccounts.some((item) => item.id !== exceptId && item.email.toLowerCase() === needle);
}

/** Optional `query` filters by name, email or role. */
export function listAdminAccounts(query?: string): AdminAccount[] {
  return adminAccounts.filter((account) =>
    matches(query, [account.name, account.email, account.role === "super_admin" ? "Super Admin" : "Admin"]),
  );
}

/**
 * Adds an admin. The temporary password is not stored: the dummy data has no login for new
 * admins yet (the real database will hash it).
 */
export function createAdminAccount(input: Omit<CreateAdminRequest, "temporaryPassword">): AdminAccount {
  lastAdminNumber += 1;
  const account: AdminAccount = {
    id: `ADM-${String(lastAdminNumber).padStart(3, "0")}`,
    name: input.name,
    email: input.email,
    role: input.role,
    status: "active",
    lastLoginAt: null,
  };
  adminAccounts.push(account);
  return account;
}

/** Returns the updated account, or null when the id does not exist. */
export function updateAdminAccount(id: string, input: UpdateAdminRequest): AdminAccount | null {
  const account = findAdminAccount(id);
  if (!account) return null;
  Object.assign(account, input);
  return account;
}

/** Returns false when the id does not exist. */
export function deleteAdminAccount(id: string): boolean {
  const index = adminAccounts.findIndex((item) => item.id === id);
  if (index === -1) return false;
  adminAccounts.splice(index, 1);
  return true;
}
