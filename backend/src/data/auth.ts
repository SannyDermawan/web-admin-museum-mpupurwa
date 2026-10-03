// Dummy admin accounts (UTS). For UAS replace the bodies with real database queries
// and keep the function signatures, so controllers do not change.

import type { User } from "../types";

type DummyAdmin = User & { password: string };

const dummyAdmins: DummyAdmin[] = [
  {
    id: "ADM-001",
    name: "Rizal Pradana",
    email: "admin@mpupurwa.test",
    password: "admin123",
    role: "super_admin",
  },
];

function toUser({ id, name, email, role }: DummyAdmin): User {
  return { id, name, email, role };
}

/** Returns the user when the credentials match, otherwise null. */
export function findAdminByCredentials(email: string, password: string): User | null {
  const match = dummyAdmins.find(
    (admin) => admin.email.toLowerCase() === email.trim().toLowerCase() && admin.password === password,
  );
  return match ? toUser(match) : null;
}

export function findAdminById(id: string): User | null {
  const match = dummyAdmins.find((admin) => admin.id === id);
  return match ? toUser(match) : null;
}
