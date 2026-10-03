// Every endpoint answers with the same JSON envelope:
//   success: { success: true, data, message? }
//   error:   { success: false, message }

import type { Response } from "express";
import type { ApiError, ApiSuccess } from "../types";

export function ok<T>(res: Response, data: T, options: { status?: number; message?: string } = {}) {
  const body: ApiSuccess<T> = { success: true, data };
  if (options.message) body.message = options.message;
  return res.status(options.status ?? 200).json(body);
}

export function fail(res: Response, status: number, message: string) {
  const body: ApiError = { success: false, message };
  return res.status(status).json(body);
}

/** The JSON body as a plain object, or {} when it is missing or not an object. */
export function bodyAsRecord(body: unknown): Record<string, unknown> {
  return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
}
