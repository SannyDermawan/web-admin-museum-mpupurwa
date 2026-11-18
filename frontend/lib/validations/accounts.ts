import { z } from "zod";
import { emailSchema, passwordSchema, requiredText } from "@/lib/validations/common";

// Aturan meniru backend (accounts.controller.ts): jangan lebih longgar atau lebih ketat.
// Batas panjang mengikuti ukuran kolom di prisma/schema.prisma.
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 150;
const MAX_DOMICILE_LENGTH = 80;
const MAX_INSTITUTION_LENGTH = 150;
const MAX_PASSWORD_LENGTH = 72; // bcrypt hanya memakai 72 karakter pertama

const nameSchema = requiredText("Nama lengkap wajib diisi.").max(
  MAX_NAME_LENGTH,
  `Nama lengkap maksimal ${MAX_NAME_LENGTH} karakter.`,
);

const roleSchema = z.enum(["admin", "super_admin"], { error: "Peran tidak valid." });

export const addAdminSchema = z.object({
  name: nameSchema,
  email: emailSchema.max(MAX_EMAIL_LENGTH, `Email maksimal ${MAX_EMAIL_LENGTH} karakter.`),
  role: roleSchema,
  // Sama dengan backend (validatePassword): panjang, huruf kecil, huruf besar, dan angka.
  temporaryPassword: passwordSchema.max(MAX_PASSWORD_LENGTH, `Kata sandi maksimal ${MAX_PASSWORD_LENGTH} karakter.`),
});
export type AddAdminFormValues = z.infer<typeof addAdminSchema>;

export const editAdminSchema = z.object({
  name: nameSchema,
  role: roleSchema,
  status: z.enum(["active", "inactive"], { error: "Status tidak valid." }),
});
export type EditAdminFormValues = z.infer<typeof editAdminSchema>;

export const editVisitorSchema = z
  .object({
    name: nameSchema,
    domicile: requiredText("Domisili wajib diisi.").max(
      MAX_DOMICILE_LENGTH,
      `Domisili maksimal ${MAX_DOMICILE_LENGTH} karakter.`,
    ),
    educationLevel: z.enum(["Mahasiswa", "Pelajar", "Umum"], { error: "Tingkat pendidikan tidak valid." }),
    institution: z
      .string()
      .trim()
      .max(MAX_INSTITUTION_LENGTH, `Asal sekolah / institusi maksimal ${MAX_INSTITUTION_LENGTH} karakter.`),
  })
  .refine((values) => values.educationLevel === "Umum" || values.institution.length > 0, {
    message: "Asal sekolah / institusi wajib diisi untuk pelajar dan mahasiswa.",
    path: ["institution"],
  });
export type EditVisitorFormValues = z.infer<typeof editVisitorSchema>;
