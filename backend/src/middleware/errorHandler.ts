import type { ErrorRequestHandler, RequestHandler } from "express";
import { fail } from "../utils/response";

export const notFoundHandler: RequestHandler = (_req, res) => {
  fail(res, 404, "Endpoint tidak ditemukan.");
};

// Express recognises an error handler by its 4 parameters, so `_next` must stay.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // express.json() sets status 400 for malformed JSON bodies.
  const status = typeof err?.status === "number" && err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(err);
  fail(res, status, status === 500 ? "Terjadi kesalahan pada server." : "Permintaan tidak valid.");
};
