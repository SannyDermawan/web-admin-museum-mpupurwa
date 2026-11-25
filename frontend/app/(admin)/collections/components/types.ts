import type { CollectionFormValues } from "@/lib/validations/collections";

export type MediaStatus = "Lengkap" | "Belum ada video" | "Belum ada PDF" | "Belum ada video dan PDF";

/** Bentuk item koleksi dari endpoint GET /api/collections */
export interface CollectionItem {
  id: number;
  name: string;
  era: string;
  material: string | null;
  statusMedia: MediaStatus;
}

/** Bentuk detail koleksi dari endpoint GET /api/collections/:id */
export interface CollectionDetail extends CollectionItem {
  period: string | null;
  origin: string | null;
  dimensions: string | null;
  meaning: string | null;
  photoUrl: string | null;
  videoUrl: string | null;
  pdfUrl: string | null;
}

/** Data dari CollectionFormModal saat tombol Simpan diklik */
export type CollectionFormData = Omit<CollectionFormValues, "foto" | "pdfDoc" | "pdfLink" | "hapusFoto" | "hapusPdf"> & {
  fotoUrl: string | null;
  pdfUrl: string | null;
};