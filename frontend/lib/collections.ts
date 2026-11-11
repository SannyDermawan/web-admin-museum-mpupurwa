import { z } from "zod";

// Helper requiredText mandiri (di-trim & cek tidak kosong)
const requiredText = (message: string) =>
  z.string().trim().min(1, message);

// Helper pengecekan File aman SSR (Server-Side Rendering)
const isFile = (v: unknown): v is File =>
  typeof File !== "undefined" && v instanceof File;

export const collectionSchema = z.object({
  nama: requiredText("Nama koleksi wajib diisi.").max(150, "Nama maksimal 150 karakter."),
  era: z.enum(["Kanjuruhan", "Tumapel", "Singosari", "Majapahit", "Prasasti"]),
  periode: z.string().max(80, "Periode maksimal 80 karakter.").optional().or(z.literal("")),
  asal: z.string().max(120, "Asal maksimal 120 karakter.").optional().or(z.literal("")),
  material: z.string().max(100, "Material maksimal 100 karakter.").optional().or(z.literal("")),
  ukuran: z.string().max(120, "Ukuran maksimal 120 karakter.").optional().or(z.literal("")),
  makna: z.string().optional().or(z.literal("")),
  videoUrl: z
    .string()
    .max(255, "Alamat video maksimal 255 karakter.")
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || /^https?:\/\/.+/.test(val),
      "Alamat video harus berupa URL yang valid (diawali http:// atau https://)."
    ),
  foto: z
    .custom<File | null>((v) => v === null || isFile(v), "Format file tidak valid.")
    .refine((file) => !file || ["image/jpeg", "image/png"].includes(file.type), "Foto harus berformat JPG atau PNG.")
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, "Ukuran foto maksimal 5 MB.")
    .optional()
    .nullable(),
  pdfDoc: z
    .custom<File | null>((v) => v === null || isFile(v), "Format file tidak valid.")
    .refine((file) => !file || file.type === "application/pdf", "Dokumen harus berformat PDF.")
    .refine((file) => !file || file.size <= 10 * 1024 * 1024, "Ukuran dokumen maksimal 10 MB.")
    .optional()
    .nullable(),
});

export type CollectionFormValues = z.infer<typeof collectionSchema>;