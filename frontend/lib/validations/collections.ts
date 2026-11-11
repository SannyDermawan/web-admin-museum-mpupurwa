// Skema form Tambah / Edit Koleksi. Batas panjang mengikuti kolom di schema.sql (repo database).

import { z } from "zod";
import { requiredText } from "@/lib/validations/common";

export const ERA_OPTIONS = ["Kanjuruhan", "Tumapel", "Singosari", "Majapahit", "Prasasti"] as const;

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_BYTES = 10 * 1024 * 1024;

/** Teks boleh kosong, tetapi tidak boleh lebih panjang dari `max`. */
const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} maksimal ${max} karakter.`);

/** `File` tidak ada saat halaman dirender di server, jadi jangan memakai z.instanceof(File) di level modul. */
const isFile = (value: unknown): value is File => typeof File !== "undefined" && value instanceof File;

const fileField = z.custom<File | null>((value) => value === null || isFile(value), "File tidak valid.");

const isHttpUrl = (value: string) => {
  if (!value) return true;
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

export const collectionSchema = z.object({
  nama: requiredText("Nama koleksi wajib diisi.").max(150, "Nama koleksi maksimal 150 karakter."),
  era: z.enum(ERA_OPTIONS, { error: "Era / kerajaan tidak valid." }),
  periode: optionalText(80, "Periode"),
  asal: optionalText(120, "Asal temuan"),
  material: optionalText(100, "Material"),
  ukuran: optionalText(120, "Ukuran"),
  makna: z.string().trim(),
  videoUrl: optionalText(255, "Alamat video").refine(
    isHttpUrl,
    "Alamat video harus berupa URL yang valid (diawali http:// atau https://).",
  ),
  foto: fileField
    .refine((file) => !file || ["image/jpeg", "image/png"].includes(file.type), "Foto harus berformat JPG atau PNG.")
    .refine((file) => !file || file.size <= MAX_PHOTO_BYTES, "Ukuran foto maksimal 5 MB."),
  pdfDoc: fileField
    .refine((file) => !file || file.type === "application/pdf", "Dokumen harus berformat PDF.")
    .refine((file) => !file || file.size <= MAX_PDF_BYTES, "Ukuran dokumen maksimal 10 MB."),
});

export type CollectionFormValues = z.infer<typeof collectionSchema>;
