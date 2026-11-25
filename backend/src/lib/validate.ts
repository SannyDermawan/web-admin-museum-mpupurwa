// Reusable checks for request bodies. The frontend validates too (Zod), but the backend must check again:
// a request can be sent without going through the web form.

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The JSON body as a plain object, or {} when it is missing or not an object. */
export function bodyAsRecord(body: unknown): Record<string, unknown> {
  return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && EMAIL_PATTERN.test(value.trim());
}

/** A trimmed string, or "" when the value is not a string. */
export function readText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

/** Nama orang: huruf (termasuk beraksen), spasi, titik, koma, apostrof, dan tanda hubung. TANPA angka. */
export const PERSON_NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .,'’-]*$/u;
export const PERSON_NAME_RULE = "hanya boleh berisi huruf, spasi, titik, koma, apostrof, dan tanda hubung (tanpa angka).";

export function isPersonName(value: string): boolean {
  return PERSON_NAME_PATTERN.test(value);
}

/** Link video YouTube yang benar: youtube.com/watch?v=ID, /shorts/ID, /embed/ID, /live/ID, atau youtu.be/ID. */
export function isYouTubeUrl(value: string): boolean {
  if (/\s/.test(value)) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;

  const host = url.hostname.toLowerCase().replace(/^(www|m)\./, "");
  const videoId = /^[A-Za-z0-9_-]{11}$/;
  if (host === "youtu.be") return videoId.test(url.pathname.slice(1));
  if (host !== "youtube.com") return false;
  if (url.pathname === "/watch") return videoId.test(url.searchParams.get("v") ?? "");
  const match = /^\/(shorts|embed|live)\/([^/]+)\/?$/.exec(url.pathname);
  return match !== null && videoId.test(match[2]);
}

/** Link berkas Google Drive: drive.google.com/file/d/ID, /open?id=, /uc?id=, atau docs.google.com/document/d/ID. */
export function isGoogleDriveFileUrl(value: string): boolean {
  if (/\s/.test(value)) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;

  const id = /^[A-Za-z0-9_-]+$/;
  if (url.hostname === "drive.google.com") {
    if (url.pathname === "/open" || url.pathname === "/uc") return id.test(url.searchParams.get("id") ?? "");
    return /^\/file\/d\/[A-Za-z0-9_-]+(\/(view|preview|edit))?\/?$/.test(url.pathname);
  }
  if (url.hostname === "docs.google.com") return /^\/document\/d\/[A-Za-z0-9_-]+(\/[a-z]*)?\/?$/.test(url.pathname);
  return false;
}
