// Mengimpor 13 arca asli Museum Mpu Purwa ke tabel `collections` TANPA menghapus data lain.
// Jalankan dari folder backend:   npx tsx prisma/import-koleksi.ts
//
// - Arca dicocokkan lewat nama: sudah ada -> diperbarui, belum ada -> dibuat. Aman dijalankan berulang.
// - photoUrl dikosongkan: unggah fotonya lewat halaman Manajemen Koleksi (Vercel Blob). Sampai itu dilakukan,
//   aplikasi mobile memakai foto bawaannya.
// - pdfUrl berisi tautan Google Drive dari QR plakat. Kalau PDF diunggah ulang lewat admin, tautan ini tergantikan.
// - Tambahkan --hapus-demo untuk menghapus 6 data demo bawaan seed (nama persis di DEMO_NAMES). Data lain
//   (mis. koleksi yang Anda buat sendiri) tidak disentuh.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_NAMES = [
  "Arca Ganesya Tikus",
  "Arca Brahma",
  "Siwa Catur Muka",
  "Makara Gapura",
  "Prasasti Kanjuruhan",
  "Arca Nandi",
];

type Row = {
  name: string;
  era: string;
  period: string | null;
  origin: string | null;
  material: string | null;
  dimensions: string | null;
  meaning: string | null;
  photoUrl: string | null;
  videoUrl: string | null;
  pdfUrl: string | null;
};

async function main() {
  const rows: Row[] = JSON.parse(readFileSync(join(__dirname, "data", "koleksi-asli.json"), "utf-8"));

  if (process.argv.includes("--hapus-demo")) {
    // "Arca Brahma" ada di data demo DAN data asli: yang demo punya pdfUrl example.com, jadi dibedakan lewat itu.
    const demo = await prisma.collection.deleteMany({
      where: { name: { in: DEMO_NAMES }, OR: [{ pdfUrl: null }, { pdfUrl: { startsWith: "https://example.com/" } }] },
    });
    console.log(`Data demo dihapus: ${demo.count}`);
  }

  let dibuat = 0;
  let diperbarui = 0;
  for (const row of rows) {
    const existing = await prisma.collection.findFirst({ where: { name: row.name } });
    if (existing) {
      // Jangan menimpa foto yang sudah diunggah lewat admin.
      await prisma.collection.update({ where: { id: existing.id }, data: { ...row, photoUrl: existing.photoUrl } });
      diperbarui++;
    } else {
      await prisma.collection.create({ data: row });
      dibuat++;
    }
  }
  console.log(`Koleksi asli: ${dibuat} dibuat, ${diperbarui} diperbarui (total ${rows.length}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
