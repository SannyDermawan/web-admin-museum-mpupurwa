// Login pengunjung aplikasi mobile: token di header `Authorization: Bearer <token>` (bukan cookie seperti admin).

import type { NextFunction, Request, Response } from "express";
import { readBearerToken, verifyVisitorToken } from "../lib/visitorToken";
import { findVisitorById } from "../services/visitorAuth.service";
import { fail } from "../utils/response";

async function loadVisitor(req: Request) {
  const token = readBearerToken(req.headers.authorization);
  const id = verifyVisitorToken(token);
  return { token, visitor: id ? await findVisitorById(id) : null };
}

/** Wajib login pengunjung. Membalas 401 jika tokennya tidak ada, salah, kedaluwarsa, atau akunnya sudah dihapus. */
export async function requireVisitor(req: Request, res: Response, next: NextFunction) {
  const { visitor } = await loadVisitor(req);
  if (!visitor) return fail(res, 401, "Silakan masuk terlebih dahulu.");
  req.visitor = visitor;
  next();
}

/** Login boleh tidak ada. Tetapi kalau tokennya DIKIRIM dan tidak berlaku, dibalas 401 supaya aplikasi tahu harus masuk lagi. */
export async function optionalVisitor(req: Request, res: Response, next: NextFunction) {
  const { token, visitor } = await loadVisitor(req);
  if (token && !visitor) return fail(res, 401, "Sesi sudah berakhir. Silakan masuk lagi.");
  if (visitor) req.visitor = visitor;
  next();
}
