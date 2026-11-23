// Bentuk akun pengunjung yang dikirim ke aplikasi mobile (tanpa data internal).

export type VisitorEducationLevel = "Mahasiswa" | "Pelajar" | "Umum";

export type VisitorProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  domicile: string;
  institution: string | null;
  educationLevel: VisitorEducationLevel;
  /** true setelah pengunjung memasukkan kode OTP yang dikirim ke emailnya */
  verified: boolean;
};
