import type { CollectionFormValues } from "@/lib/validations/collections";

export type MediaStatus = "Lengkap" | "Belum ada video" | "Belum ada PDF" | "Belum ada video dan PDF";

export interface CollectionItem {
  id: string;
  nama: string;
  era: string;
  material: string;
  statusMedia: MediaStatus;
  /** Vercel Blob links, filled when the collection was saved with a photo or a PDF. */
  fotoUrl?: string | null;
  pdfUrl?: string | null;
  videoUrl?: string;
}

/** What the form hands over on save: the text fields plus the Vercel Blob links of the uploaded files. */
export type CollectionFormData = Omit<CollectionFormValues, "foto" | "pdfDoc"> & {
  fotoUrl: string | null;
  pdfUrl: string | null;
};

/** Same rule as the v_collections view in the database (schema.sql). */
export function getMediaStatus(videoUrl?: string | null, pdfUrl?: string | null): MediaStatus {
  if (videoUrl && pdfUrl) return "Lengkap";
  if (!videoUrl && !pdfUrl) return "Belum ada video dan PDF";
  return videoUrl ? "Belum ada PDF" : "Belum ada video";
}
