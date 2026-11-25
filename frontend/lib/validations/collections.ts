// Skema form Tambah / Edit Koleksi. Batas panjang mengikuti kolom di schema.sql (repo database).

import { z } from "zod";
import { requiredText, isYouTubeUrl, isGoogleDriveFileUrl } from "@/lib/validations/common";

export const ERA_OPTIONS = ["Kanjuruhan", "Tumapel", "Singosari", "Majapahit", "Prasasti"] as const;

export const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // same as the backend (Vercel request body limit is 4.5 MB)
export const MAX_PDF_BYTES = 4 * 1024 * 1024;

/** Teks boleh kosong, tetapi tidak boleh lebih panjang dari `max`. */
const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} maksimal ${max} karakter.`);

/** `File` tidak ada saat halaman dirender di server, jadi jangan memakai z.instanceof(File) di level modul. */
const isFile = (value: unknown): value is File => typeof File !== "undefined" && value instanceof File;

const fileField = z.custom<File | null>((value) => value === null || isFile(value), "File tidak valid.");

export const collectionSchema = z.object({
  nama: requiredText("Nama koleksi wajib diisi.").max(150, "Nama koleksi maksimal 150 karakter."),
  era: z.enum(ERA_OPTIONS, { error: "Era / kerajaan tidak valid." }),
  periode: optionalText(80, "Periode"),
  asal: optionalText(120, "Asal temuan"),
  material: optionalText(100, "Material"),
  ukuran: optionalText(120, "Ukuran"),
  makna: z.string().trim(),
  videoUrl: optionalText(255, "Alamat video").refine(
    (value) => !value || isYouTubeUrl(value),
    "Link video harus berupa link YouTube, mis. https://youtu.be/xxxxxxxxxxx.",
  ),
  // Pilihan selain mengunggah file PDF: tempel link berkas yang sudah ada di Google Drive.
  pdfLink: z
    .string()
    .trim()
    .max(500, "Link maksimal 500 karakter.")
    .refine((value) => !value || isGoogleDriveFileUrl(value), "Link harus berupa link berkas Google Drive, mis. https://drive.google.com/file/d/.../view"),
  // true = hapus file yang sudah tersimpan saat form disimpan.
  hapusFoto: z.boolean(),
  hapusPdf: z.boolean(),
  foto: fileField
    .refine((file) => !file || ["image/jpeg", "image/png"].includes(file.type), "Foto harus berformat JPG atau PNG.")
    .refine((file) => !file || file.size <= MAX_PHOTO_BYTES, "Ukuran foto maksimal 4 MB."),
  pdfDoc: fileField
    .refine((file) => !file || file.type === "application/pdf", "Dokumen harus berformat PDF.")
    .refine((file) => !file || file.size <= MAX_PDF_BYTES, "Ukuran dokumen maksimal 4 MB."),
}).refine((values) => !(values.pdfDoc && values.pdfLink), {
  message: "Pilih salah satu: unggah file PDF atau tempel link Google Drive.",
  path: ["pdfLink"],
});

export type CollectionFormValues = z.infer<typeof collectionSchema>;
