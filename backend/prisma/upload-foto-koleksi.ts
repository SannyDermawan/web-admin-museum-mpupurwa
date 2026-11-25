// Mengunggah foto arca dari folder lokal (mis. mobile-mpupurwa/assets/images) ke Vercel Blob
// lalu mengisi kolom `photoUrl` di tabel `collections`.
//
// Jalankan dari folder backend:
//   npx tsx prisma/upload-foto-koleksi.ts "<path-folder-foto>" --dry-run
//   npx tsx prisma/upload-foto-koleksi.ts "<path-folder-foto>"
//
// Aturan pemetaan nama file -> nama arca di database:
// 1. Ambil nama file tanpa ekstensi dan normalisasi ke huruf kecil dengan pemisah spasi.
// 2. Satukan variasi ejaan umum ("ganesha" <-> "ganesya").
// 3. Cocokkan dengan nama koleksi di database:
//    - Prioritas 1: sama persis setelah normalisasi (mis. `arca_brahma.jpg` -> `Arca Brahma`).
//    - Prioritas 2: nama file tanpa awalan `arca_` sama persis dengan nama koleksi (mis. `arca_siwa_catur_muka.jpg` -> `Siwa Catur Muka`).
//    - Prioritas 3: seluruh token kata nama file (tanpa awalan `arca_`) terkandung di dalam tepat satu koleksi.
// 4. Pengecualian (ejaan file berbeda dari nama di database) ada di ALIASES, mengikuti
//    `assets/data/koleksi.json` milik aplikasi mobile.
// 5. Aman diulang: koleksi yang `photoUrl`-nya sudah terisi akan dilewati, dan satu arca hanya diisi sekali per jalan.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";

const prisma = new PrismaClient();
const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // Sama dengan aturan blob.service.ts (maks 4 MB)

const ALLOWED_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

function hasValidImageSignature(buffer: Buffer): boolean {
  const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng =
    buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  return isJpeg || isPng;
}

function normalizeTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/ganesha/g, "ganesya")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function safeFileName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const extension = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  return `${base || "file"}${extension ? `.${extension}` : ""}`;
}

// Nama file (tanpa ekstensi) -> nama arca, untuk file yang tidak bisa dicocokkan otomatis.
const ALIASES: Record<string, string> = {
  arca_avalokitesvara: "Arca Bodhisatwa Avalokitecvara",
  arca_ganesha_1: "Arca Ganesha",
  arca_ganesha_2: "Arca Ganesha II",
};

function matchCollection<T extends { id: number; name: string }>(fileName: string, collections: T[]): T | null {
  const baseName = fileName.slice(0, fileName.length - extname(fileName).length);

  const alias = ALIASES[baseName.toLowerCase()];
  if (alias) {
    const key = normalizeTokens(alias).join(" ");
    return collections.find((c) => normalizeTokens(c.name).join(" ") === key) ?? null;
  }

  const fileTokens = normalizeTokens(baseName);
  if (fileTokens.length === 0) return null;

  const fileKey = fileTokens.join(" ");

  const exact = collections.find((c) => normalizeTokens(c.name).join(" ") === fileKey);
  if (exact) return exact;

  const withoutPrefix = fileTokens[0] === "arca" ? fileTokens.slice(1) : fileTokens;
  const withoutPrefixKey = withoutPrefix.join(" ");

  const exactNoPrefix = collections.find((c) => normalizeTokens(c.name).join(" ") === withoutPrefixKey);
  if (exactNoPrefix) return exactNoPrefix;

  const subsetMatches = collections.filter((c) => {
    const colTokens = new Set(normalizeTokens(c.name));
    return withoutPrefix.every((token) => colTokens.has(token));
  });

  return subsetMatches.length === 1 ? subsetMatches[0] : null;
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const folderArg = args.find((arg) => !arg.startsWith("--"));

  if (!folderArg) {
    console.error("Penggunaan: npx tsx prisma/upload-foto-koleksi.ts <folder-foto> [--dry-run]");
    process.exitCode = 1;
    return;
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!isDryRun && !blobToken) {
    console.error("BLOB_READ_WRITE_TOKEN belum diatur di environment. Gunakan --dry-run atau isi token di backend/.env.");
    process.exitCode = 1;
    return;
  }

  const folderPath = resolve(folderArg);
  const files = readdirSync(folderPath).filter((file) => {
    const full = join(folderPath, file);
    return statSync(full).isFile() && Object.hasOwn(ALLOWED_EXT, extname(file).toLowerCase());
  });

  const collections = await prisma.collection.findMany({
    select: { id: true, name: true, photoUrl: true },
    orderBy: { id: "asc" },
  });

  console.log(`Mode: ${isDryRun ? "DRY-RUN (tidak mengunggah / mengubah DB)" : "UNGGAH NYATA"}`);
  console.log(`Folder: ${folderPath} (${files.length} file gambar ditemukan)\n`);

  let diunggah = 0;
  let dilewatiSudahAda = 0;
  let tidakCocok = 0;
  let tidakValid = 0;

  for (const file of files) {
    const fullPath = join(folderPath, file);
    const ext = extname(file).toLowerCase();
    const mimeType = ALLOWED_EXT[ext];
    const buffer = readFileSync(fullPath);

    if (buffer.length > MAX_PHOTO_BYTES || !hasValidImageSignature(buffer)) {
      console.log(`[SKIP - INVALID] ${file} -> melebihi 4 MB atau bukan JPG/PNG asli`);
      tidakValid++;
      continue;
    }

    const matched = matchCollection(file, collections);
    if (!matched) {
      console.log(`[SKIP - NO MATCH] ${file} -> tidak ditemukan koleksi yang cocok`);
      tidakCocok++;
      continue;
    }

    if (matched.photoUrl) {
      console.log(`[SKIP - SUDAH ADA] ${file} -> #${matched.id} "${matched.name}" (sudah punya photoUrl)`);
      dilewatiSudahAda++;
      continue;
    }

    if (isDryRun) {
      matched.photoUrl = "(direncanakan)";
      console.log(`[RENCANA] ${file} (${(buffer.length / 1024).toFixed(1)} KB) -> #${matched.id} "${matched.name}"`);
      diunggah++;
      continue;
    }

    const blob = await put(`koleksi/foto/${safeFileName(file)}`, buffer, {
      access: "public",
      contentType: mimeType,
      addRandomSuffix: true,
      token: blobToken,
    });

    await prisma.collection.update({
      where: { id: matched.id },
      data: { photoUrl: blob.url },
    });

    matched.photoUrl = blob.url;
    console.log(`[OK] ${file} -> #${matched.id} "${matched.name}" (${blob.url})`);
    diunggah++;
  }

  console.log(
    `\nRingkasan: ${diunggah} ${isDryRun ? "direncanakan" : "diunggah"}, ${dilewatiSudahAda} sudah punya foto, ${tidakCocok} tidak cocok, ${tidakValid} tidak valid.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
