// Stores collection photos and PDFs in Vercel Blob (cloud storage) and returns their public links.
// The token (BLOB_READ_WRITE_TOKEN) only ever lives on the server.

import { put } from "@vercel/blob";
import { config } from "../config";
import type { UploadKind, UploadResult } from "../types";

type KindRules = {
  folder: string;
  mimeTypes: string[];
  maxBytes: number;
  /** Human text for error messages. */
  label: string;
  /** First bytes of a real file of this type, so a renamed file (e.g. a .exe called .jpg) is refused. */
  signatures: number[][];
};

const RULES: Record<UploadKind, KindRules> = {
  foto: {
    folder: "koleksi/foto",
    mimeTypes: ["image/jpeg", "image/png"],
    maxBytes: 5 * 1024 * 1024,
    label: "Foto harus berformat JPG atau PNG dan maksimal 5 MB.",
    signatures: [
      [0xff, 0xd8, 0xff], // JPEG
      [0x89, 0x50, 0x4e, 0x47], // PNG
    ],
  },
  dokumen: {
    folder: "koleksi/dokumen",
    mimeTypes: ["application/pdf"],
    maxBytes: 10 * 1024 * 1024,
    label: "Dokumen harus berformat PDF dan maksimal 10 MB.",
    signatures: [[0x25, 0x50, 0x44, 0x46]], // %PDF
  },
};

export const MAX_UPLOAD_BYTES = Math.max(...Object.values(RULES).map((rule) => rule.maxBytes));

export function isUploadKind(value: unknown): value is UploadKind {
  return value === "foto" || value === "dokumen";
}

type IncomingFile = { originalname: string; mimetype: string; size: number; buffer: Buffer };

/** Returns an error message when the file is not allowed for this kind, otherwise null. */
export function checkFile(kind: UploadKind, file: IncomingFile): string | null {
  const rules = RULES[kind];
  const startsWithSignature = rules.signatures.some((bytes) => bytes.every((byte, index) => file.buffer[index] === byte));
  if (!rules.mimeTypes.includes(file.mimetype) || file.size > rules.maxBytes || !startsWithSignature) return rules.label;
  return null;
}

/** "Arca Ganesya (1).JPG" -> "arca-ganesya-1.jpg": safe to use in a link. */
function safeFileName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const extension = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  return `${base || "file"}${extension ? `.${extension}` : ""}`;
}

export async function uploadToBlob(kind: UploadKind, file: IncomingFile): Promise<UploadResult> {
  const blob = await put(`${RULES[kind].folder}/${safeFileName(file.originalname)}`, file.buffer, {
    access: "public",
    contentType: file.mimetype,
    addRandomSuffix: true, // two files with the same name never overwrite each other
    token: config.blobToken,
  });

  return { url: blob.url, pathname: blob.pathname, size: file.size, contentType: file.mimetype };
}
