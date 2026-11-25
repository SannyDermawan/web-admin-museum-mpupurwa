import type { NextFunction, Request, Response } from "express";
import { bodyAsRecord, isOneOf, readText } from "../lib/validate";
import { isVercelBlobUrl } from "../services/blob.service";
import {
  createCollection,
  deleteCollection,
  getCollectionById,
  listCollections,
  updateCollection,
} from "../services/collections.service";
import { COLLECTION_ERAS, type CollectionWriteInput } from "../types/collections";
import { fail, ok } from "../utils/response";

const GOOGLE_DRIVE_HOSTS = new Set(["drive.google.com", "docs.google.com"]);

function parsePositiveId(raw: unknown): number | null {
  const text = readText(raw);
  if (!/^\d+$/.test(text)) return null;
  const num = Number(text);
  return Number.isSafeInteger(num) && num > 0 ? num : null;
}

function isValidHttpUrl(value: string): boolean {
  if (/\s/.test(value)) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidPdfUrl(value: string): boolean {
  if (/\s/.test(value)) return false;
  if (isVercelBlobUrl(value)) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && GOOGLE_DRIVE_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

function validateCollectionBody(rawBody: unknown): { ok: true; data: CollectionWriteInput } | { ok: false; message: string } {
  const body = bodyAsRecord(rawBody);

  const name = readText(body.name);
  if (!name) return { ok: false, message: "Nama koleksi wajib diisi." };
  if (name.length > 150) return { ok: false, message: "Nama koleksi maksimal 150 karakter." };

  const era = body.era;
  if (!isOneOf(era, COLLECTION_ERAS)) {
    return { ok: false, message: `Era harus salah satu dari: ${COLLECTION_ERAS.join(", ")}.` };
  }

  const period = readText(body.period);
  if (period.length > 80) return { ok: false, message: "Periode maksimal 80 karakter." };

  const origin = readText(body.origin);
  if (origin.length > 120) return { ok: false, message: "Asal temuan maksimal 120 karakter." };

  const material = readText(body.material);
  if (material.length > 100) return { ok: false, message: "Bahan maksimal 100 karakter." };

  const dimensions = readText(body.dimensions);
  if (dimensions.length > 120) return { ok: false, message: "Ukuran maksimal 120 karakter." };

  const meaning = readText(body.meaning);

  const videoUrl = readText(body.videoUrl);
  if (videoUrl) {
    if (videoUrl.length > 255) return { ok: false, message: "Link video maksimal 255 karakter." };
    if (!isValidHttpUrl(videoUrl)) return { ok: false, message: "Link video harus diawali http:// atau https://." };
  }

  const photoUrl = readText(body.photoUrl);
  if (photoUrl) {
    if (photoUrl.length > 500) return { ok: false, message: "URL foto maksimal 500 karakter." };
    if (/\s/.test(photoUrl) || !isVercelBlobUrl(photoUrl)) {
      return { ok: false, message: "URL foto harus berasal dari Vercel Blob (https)." };
    }
  }

  const pdfUrl = readText(body.pdfUrl);
  if (pdfUrl) {
    if (pdfUrl.length > 500) return { ok: false, message: "URL PDF maksimal 500 karakter." };
    if (!isValidPdfUrl(pdfUrl)) {
      return { ok: false, message: "URL PDF harus berasal dari Vercel Blob atau Google Drive (https)." };
    }
  }

  return {
    ok: true,
    data: {
      name,
      era,
      period: period || null,
      origin: origin || null,
      material: material || null,
      dimensions: dimensions || null,
      meaning: meaning || null,
      photoUrl: photoUrl || null,
      videoUrl: videoUrl || null,
      pdfUrl: pdfUrl || null,
    },
  };
}

export async function getCollections(req: Request, res: Response, next: NextFunction) {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const data = await listCollections(q);
    return ok(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function getCollectionDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) return fail(res, 404, "Koleksi tidak ditemukan.");

    const item = await getCollectionById(id);
    if (!item) return fail(res, 404, "Koleksi tidak ditemukan.");

    return ok(res, item);
  } catch (error) {
    return next(error);
  }
}

export async function postCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = validateCollectionBody(req.body);
    if (!parsed.ok) return fail(res, 400, parsed.message);

    const created = await createCollection(parsed.data);
    return ok(res, created, { status: 201, message: "Koleksi berhasil ditambahkan." });
  } catch (error) {
    return next(error);
  }
}

export async function patchCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) return fail(res, 404, "Koleksi tidak ditemukan.");

    const parsed = validateCollectionBody(req.body);
    if (!parsed.ok) return fail(res, 400, parsed.message);

    const updated = await updateCollection(id, parsed.data);
    if (!updated) return fail(res, 404, "Koleksi tidak ditemukan.");

    return ok(res, updated, { message: "Koleksi berhasil diperbarui." });
  } catch (error) {
    return next(error);
  }
}

export async function removeCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) return fail(res, 404, "Koleksi tidak ditemukan.");

    const deleted = await deleteCollection(id);
    if (!deleted) return fail(res, 404, "Koleksi tidak ditemukan.");

    return ok(res, { id }, { message: "Koleksi berhasil dihapus." });
  } catch (error) {
    return next(error);
  }
}