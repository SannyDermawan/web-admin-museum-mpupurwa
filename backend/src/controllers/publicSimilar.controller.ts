import type { NextFunction, Request, Response } from "express";
import { readText } from "../lib/validate";
import { findSimilarCollections } from "../services/similar.service";
import { fail, ok } from "../utils/response";

export async function getSimilarPublicCollections(req: Request, res: Response, next: NextFunction) {
  try {
    const raw = readText(req.params.id);
    if (!/^\d+$/.test(raw)) return fail(res, 400, "Id koleksi tidak valid.");

    const id = Number(raw);
    if (!Number.isSafeInteger(id) || id <= 0) return fail(res, 400, "Id koleksi tidak valid.");

    const similar = await findSimilarCollections(id, 4);
    if (!similar) return fail(res, 404, "Koleksi tidak ditemukan.");

    return ok(res, similar);
  } catch (error) {
    return next(error);
  }
}
