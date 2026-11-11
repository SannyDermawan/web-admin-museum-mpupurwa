import { z } from "zod";
import { emailSchema, requiredText } from "@/lib/validations/common";

// Aturan meniru backend (accounts.controller.ts): jangan lebih longgar atau lebih ketat.
const MAX_NAME_LENGTH = 100;
const MIN_PASSWORD_LENGTH = 8;

const nameSchema = requiredText("Nama lengkap wajib diisi.").max(
  MAX_NAME_LENGTH,
  `Nama lengkap maksimal ${MAX_NAME_LENGTH} karakter.`,
);

const roleSchema = z.enum(["admin", "super_admin"], { error: "Peran tidak valid." });

export const addAdminSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  role: roleSchema,
  temporaryPassword: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Kata sandi sementara minimal ${MIN_PASSWORD_LENGTH} karakter.`),
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
    domicile: requiredText("Domisili wajib diisi."),
    educationLevel: z.enum(["Mahasiswa", "Pelajar", "Umum"], { error: "Tingkat pendidikan tidak valid." }),
    institution: z.string().trim(),
  })
  .refine((values) => values.educationLevel === "Umum" || values.institution.length > 0, {
    message: "Asal sekolah / institusi wajib diisi untuk pelajar dan mahasiswa.",
    path: ["institution"],
  });
export type EditVisitorFormValues = z.infer<typeof editVisitorSchema>;
