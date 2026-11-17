import { prisma } from "../lib/prisma";
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

const COLLECTION_DETAIL_SELECT = {
  id: true,
  name: true,
  era: true,
  period: true,
  origin: true,
  material: true,
  dimensions: true,
  meaning: true,
  photoUrl: true,
  videoUrl: true,
  pdfUrl: true,
} as const;

export async function listCollections(query?: string): Promise<CollectionListItem[]> {
  const q = query?.trim();
  const rows = await prisma.collection.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { era: { contains: q } },
            { material: { contains: q } },
          ],
        }
      : undefined,
    select: {
      id: true,
      name: true,
      era: true,
      material: true,
      videoUrl: true,
      pdfUrl: true,
    },
    orderBy: { id: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    era: row.era,
    material: row.material,
    statusMedia: computeStatusMedia(row.videoUrl, row.pdfUrl),
  }));
}

export async function getCollectionById(id: number): Promise<CollectionDetail | null> {
  const row = await prisma.collection.findUnique({
    where: { id },
    select: COLLECTION_DETAIL_SELECT,
  });
  if (!row) return null;

  return {
    ...row,
    statusMedia: computeStatusMedia(row.videoUrl, row.pdfUrl),
  };
}

export async function createCollection(input: CollectionWriteInput): Promise<CollectionDetail> {
  const created = await prisma.collection.create({
    data: input,
    select: COLLECTION_DETAIL_SELECT,
  });

  return {
    ...created,
    statusMedia: computeStatusMedia(created.videoUrl, created.pdfUrl),
  };
}

export async function updateCollection(id: number, input: CollectionWriteInput): Promise<CollectionDetail | null> {
  const existing = await prisma.collection.findUnique({
    where: { id },
    select: { photoUrl: true, pdfUrl: true },
  });
  if (!existing) return null;

  const updated = await prisma.collection.update({
    where: { id },
    data: input,
    select: COLLECTION_DETAIL_SELECT,
  });

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
  const existing = await prisma.collection.findUnique({
    where: { id },
    select: { photoUrl: true, pdfUrl: true },
  });
  if (!existing) return false;

  await prisma.collection.delete({ where: { id } });

  await Promise.all([
    deleteFromBlob(existing.photoUrl),
    deleteFromBlob(existing.pdfUrl),
  ]);

  return true;
}