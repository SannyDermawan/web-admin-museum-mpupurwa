export const COLLECTION_ERAS = ["Kanjuruhan", "Tumapel", "Singosari", "Majapahit", "Prasasti"] as const;
export type CollectionEra = (typeof COLLECTION_ERAS)[number];

export type CollectionMediaStatus =
  | "Lengkap"
  | "Belum ada video"
  | "Belum ada PDF"
  | "Belum ada video dan PDF";

export interface CollectionListItem {
  id: number;
  name: string;
  era: string;
  material: string | null;
  statusMedia: CollectionMediaStatus;
}

export interface CollectionDetail extends CollectionListItem {
  period: string | null;
  origin: string | null;
  dimensions: string | null;
  meaning: string | null;
  photoUrl: string | null;
  videoUrl: string | null;
  pdfUrl: string | null;
}

export interface CollectionWriteInput {
  name: string;
  era: CollectionEra;
  period: string | null;
  origin: string | null;
  material: string | null;
  dimensions: string | null;
  meaning: string | null;
  photoUrl: string | null;
  videoUrl: string | null;
  pdfUrl: string | null;
}