import {
  findCollectionDetail,
  findCollectionFiles,
  insertCollection,
  listCollectionRows,
  removeCollection,
  updateCollectionRow,
} from "../models/collectionModel";
import type {
  CollectionDetail,
  CollectionListItem,
  CollectionMediaStatus,
  CollectionWriteInput,
} from "../types/collections";
import { deleteFromBlob } from "./blob.service";

function computeStatusMedia(videoUrl: string | null, pdfUrl: string | null): CollectionMediaStatus {
  const hasVideo = Boolean(videoUrl && videoUrl.trim().length > 0);
  const hasPdf = Boolean(pdfUrl && pdfUrl.trim().length > 0);
  if (hasVideo && hasPdf) return "Lengkap";
  if (!hasVideo && hasPdf) return "Belum ada video";
  if (hasVideo && !hasPdf) return "Belum ada PDF";
  return "Belum ada video dan PDF";
}

export async function listCollections(query?: string): Promise<CollectionListItem[]> {
  const q = query?.trim();
  const rows = await listCollectionRows(q);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    era: row.era,
    material: row.material,
    statusMedia: computeStatusMedia(row.videoUrl, row.pdfUrl),
  }));
}

export async function getCollectionById(id: number): Promise<CollectionDetail | null> {
  const row = await findCollectionDetail(id);
  if (!row) return null;

  return {
    ...row,
    statusMedia: computeStatusMedia(row.videoUrl, row.pdfUrl),
  };
}

export async function createCollection(input: CollectionWriteInput): Promise<CollectionDetail> {
  const created = await insertCollection(input);

  return {
    ...created,
    statusMedia: computeStatusMedia(created.videoUrl, created.pdfUrl),
  };
}

export async function updateCollection(id: number, input: CollectionWriteInput): Promise<CollectionDetail | null> {
  const existing = await findCollectionFiles(id);
  if (!existing) return null;

  const updated = await updateCollectionRow(id, input);

  // Hapus file lama dari Vercel Blob jika diganti atau dikosongkan
  if (existing.photoUrl && existing.photoUrl !== updated.photoUrl) {
    await deleteFromBlob(existing.photoUrl);
  }
  if (existing.pdfUrl && existing.pdfUrl !== updated.pdfUrl) {
    await deleteFromBlob(existing.pdfUrl);
  }

  return {
    ...updated,
    statusMedia: computeStatusMedia(updated.videoUrl, updated.pdfUrl),
  };
}

export async function deleteCollection(id: number): Promise<boolean> {
  const existing = await findCollectionFiles(id);
  if (!existing) return false;

  await removeCollection(id);

  await Promise.all([
    deleteFromBlob(existing.photoUrl),
    deleteFromBlob(existing.pdfUrl),
  ]);

  return true;
}