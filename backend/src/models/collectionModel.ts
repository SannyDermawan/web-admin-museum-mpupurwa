// Model tabel `collections` (koleksi arca dan prasasti).

import type { Prisma } from "@prisma/client";
import { prisma } from "../config/db";

const detailSelect = {
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
} satisfies Prisma.CollectionSelect;

export const listCollectionRows = (search?: string) =>
  prisma.collection.findMany({
    where: search
      ? { OR: [{ name: { contains: search } }, { era: { contains: search } }, { material: { contains: search } }] }
      : undefined,
    select: { id: true, name: true, era: true, material: true, videoUrl: true, pdfUrl: true },
    orderBy: { id: "desc" },
  });

/** Semua kolom isi, urut id: dipakai API publik aplikasi mobile. */
export const listCollectionDetails = () => prisma.collection.findMany({ select: detailSelect, orderBy: { id: "asc" } });

export const findCollectionDetail = (id: number) => prisma.collection.findUnique({ where: { id }, select: detailSelect });

export const findCollectionFiles = (id: number) =>
  prisma.collection.findUnique({ where: { id }, select: { photoUrl: true, pdfUrl: true } });

export const insertCollection = (data: Prisma.CollectionCreateInput) =>
  prisma.collection.create({ data, select: detailSelect });

export const updateCollectionRow = (id: number, data: Prisma.CollectionUpdateInput) =>
  prisma.collection.update({ where: { id }, data, select: detailSelect });

export const removeCollection = (id: number) => prisma.collection.delete({ where: { id } });

export const countCollections = () => prisma.collection.count();

export const listCollectionsForSimilarity = () =>
  prisma.collection.findMany({
    select: { id: true, name: true, era: true, material: true, meaning: true, photoUrl: true },
    orderBy: { id: "asc" },
  });
