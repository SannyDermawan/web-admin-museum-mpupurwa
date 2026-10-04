// Client-side API helpers. Components talk to the Express backend ONLY through these.
// Pass paths like "/api/dashboard"; the backend address comes from lib/config.ts.
// They unwrap the { success, data } envelope and throw ApiRequestError (with a
// user-readable message) when the call fails.

import { clearAuthUser } from "@/lib/auth-storage";
import { API_URL } from "@/lib/config";
import type { ApiResponse } from "@/types";

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export type ApiResult<T> = { data: T; message?: string };

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  let response: Response;
  try {
    // `credentials: "include"` sends/receives the login cookie across :3000 -> :5000.
    response = await fetch(`${API_URL}${path}`, { ...init, credentials: "include" });
  } catch {
    throw new ApiRequestError("Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.", 0);
  }

  let body: ApiResponse<T> | null = null;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    // Non-JSON response; handled below.
  }

  if (!body) throw new ApiRequestError("Respons server tidak valid.", response.status);
  if (!body.success) {
    // Expired or missing login on a protected call: forget the user, the admin layout sends them to /login.
    if (response.status === 401 && !path.startsWith("/api/auth/")) clearAuthUser();
    throw new ApiRequestError(body.message, response.status);
  }
  return { data: body.data, message: body.message };
}

export function apiGet<T>(path: string, init?: RequestInit) {
  return request<T>(path, { ...init, method: "GET" });
}

export function apiPost<T>(path: string, payload?: unknown, init?: RequestInit) {
  return request<T>(path, {
    ...init,
    method: "POST",
    headers: { "Content-Type": "application/json", ...init?.headers },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
}

export function apiPatch<T>(path: string, payload?: unknown, init?: RequestInit) {
  return request<T>(path, {
    ...init,
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...init?.headers },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
}

export function apiDelete<T = null>(path: string, init?: RequestInit) {
  return request<T>(path, { ...init, method: "DELETE" });
}
