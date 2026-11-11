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
