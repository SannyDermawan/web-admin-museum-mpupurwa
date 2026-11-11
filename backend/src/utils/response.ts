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

// Kept here so existing imports keep working; the implementation lives in lib/validate.ts.
export { bodyAsRecord } from "../lib/validate";
