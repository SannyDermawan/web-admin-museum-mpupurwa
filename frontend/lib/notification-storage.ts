"use client";

// Remembers which notifications the admin has already read, so the red badge stays gone after
// a refresh. It is only UI state in this browser (there is no notification backend).

import { useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "mpu_read_notifications";
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

function parseIds(raw: string | null): Set<string> {
  if (!raw) return new Set();
  try {
    const value: unknown = JSON.parse(raw);
    return new Set(Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set();
  }
}

/** Marks several notifications as read at once ("Tandai semua dibaca"). */
export function markNotificationsRead(newIds: string[]) {
  const ids = parseIds(readRaw());
  const before = ids.size;
  newIds.forEach((id) => ids.add(id));
  if (ids.size === before) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Storage blocked: the notifications simply show as unread again after a reload.
  }
  notify();
}

export function markNotificationRead(id: string) {
  markNotificationsRead([id]);
}

/** Ids of the notifications that were already read. */
export function useReadNotificationIds(): Set<string> {
  const raw = useSyncExternalStore<string | null>(subscribe, readRaw, () => null);
  return useMemo(() => parseIds(raw), [raw]);
}
