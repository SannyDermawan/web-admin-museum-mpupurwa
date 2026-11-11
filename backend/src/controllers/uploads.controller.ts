import type { Request, Response } from "express";
import { isBlobConfigured } from "../config";
import { checkFile, isUploadKind, uploadToBlob } from "../services/blob.service";
import { fail, ok } from "../utils/response";

// POST /api/uploads   multipart/form-data: file (the file) and kind ("foto" | "dokumen")
export async function uploadFile(req: Request, res: Response) {
  if (!isBlobConfigured) return fail(res, 503, "Penyimpanan file (Vercel Blob) belum dikonfigurasi di server.");

  const kind: unknown = req.body?.kind;
  if (!isUploadKind(kind)) return fail(res, 400, "Jenis unggahan tidak valid. Gunakan foto atau dokumen.");
  if (!req.file) return fail(res, 400, "File wajib dipilih.");

  const problem = checkFile(kind, req.file);
  if (problem) return fail(res, 400, problem);

  try {
    return ok(res, await uploadToBlob(kind, req.file), { status: 201, message: "File berhasil diunggah." });
  } catch (error) {
    // Vercel Blob refused or could not be reached. Log the details here, tell the client only what it needs.
    console.error("Vercel Blob upload failed:", error);
    return fail(res, 502, "Gagal menyimpan file ke penyimpanan cloud. Coba lagi beberapa saat lagi.");
  }
}
