import type { ErrorRequestHandler, RequestHandler } from "express";
import { fail } from "../utils/response";

export const notFoundHandler: RequestHandler = (_req, res) => {
  fail(res, 404, "Endpoint tidak ditemukan.");
};

// Express recognises an error handler by its 4 parameters, so `_next` must stay.
// Internal details (stack traces, SQL) are logged on the server and never sent to the client.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // multer (file uploads) refuses files that are too big or sent in the wrong shape.
  if (err?.name === "MulterError") {
    return fail(res, 400, err.code === "LIMIT_FILE_SIZE" ? "Ukuran file terlalu besar (maksimal 10 MB)." : "Unggahan file tidak valid.");
  }

  // express.json() sets status 400 for malformed JSON bodies.
  const status = typeof err?.status === "number" && err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(err);
  fail(res, status, status === 500 ? "Terjadi kesalahan pada server." : "Permintaan tidak valid.");
};
