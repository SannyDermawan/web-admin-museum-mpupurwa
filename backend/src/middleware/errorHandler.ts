import type { ErrorRequestHandler, RequestHandler } from "express";
import { logger } from "../lib/logger";
import { fail } from "../utils/response";

export const notFoundHandler: RequestHandler = (_req, res) => {
  fail(res, 404, "Endpoint tidak ditemukan.");
};

// Express recognises an error handler by its 4 parameters, so `_next` must stay.
// Internal details (stack traces, SQL) are logged on the server and never sent to the client.
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // If the response has already started, only Express can close it.
  if (res.headersSent) return _next(err);

  // multer (file uploads) refuses files that are too big or sent in the wrong shape.
  if (err?.name === "MulterError") {
    return fail(res, 400, err.code === "LIMIT_FILE_SIZE" ? "Ukuran file terlalu besar (maksimal 4 MB)." : "Unggahan file tidak valid.");
  }

  // express.json() sets status 400 (bad JSON) or 413 (body over the limit) on its errors.
  if (err?.status === 413 || err?.type === "entity.too.large") return fail(res, 413, "Data yang dikirim terlalu besar.");

  const status = typeof err?.status === "number" && err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status < 500) return fail(res, status, "Permintaan tidak valid.");

  // Unexpected error: the full error goes to the log; the client only gets a generic message and the request id.
  const requestId = String(req.id ?? res.getHeader("X-Request-Id") ?? "");
  logger.error({ err, requestId, method: req.method, url: req.originalUrl.split("?")[0] }, "Unhandled error");
  return fail(res, 500, requestId ? `Terjadi kesalahan pada server. Kode: ${requestId}` : "Terjadi kesalahan pada server.");
};
