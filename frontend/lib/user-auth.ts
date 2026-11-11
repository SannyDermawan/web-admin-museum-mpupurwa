"use client";

// Remembers WHO is logged in so the sidebar can show the name and the admin pages
// know whether to send the visitor to /login. This is only UI state: the real
// proof of login is the httpOnly cookie that the backend sets, and the backend
// checks it on every protected request (a 401 clears this and returns to /login).

import { useMemo, useSyncExternalStore } from "react";
import type { User } from "@/types";

const STORAGE_KEY = "mpu_user";
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener); // other tabs
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parseUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<User>;
    const valid = ["id", "name", "email", "role"].every((key) => typeof value[key as keyof User] === "string");
    return valid ? (value as User) : null;
  } catch {
    return null;
  }
}

export function setAuthUser(user: User) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Storage blocked: the user simply has to log in again after a reload.
  }
  notify();
}

export function clearAuthUser() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  notify();
}

/** The logged-in user, `null` when nobody is logged in, `undefined` while the browser has not been checked yet. */
export function useAuthUser(): User | null | undefined {
  const raw = useSyncExternalStore<string | null | undefined>(subscribe, readRaw, () => undefined);
  return useMemo(() => (raw === undefined ? undefined : parseUser(raw)), [raw]);
}
