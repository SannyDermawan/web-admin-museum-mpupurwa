import { prisma } from "../lib/prisma";

export interface SimilarCollectionItem {
  id: number;
  name: string;
  era: string;
  material: string | null;
  photoUrl: string | null;
}

// Kata umum Bahasa Indonesia yang diabaikan saat menghitung kemiripan makna/sejarah koleksi.
const STOPWORDS = new Set([
  "yang", "dan", "di", "ke", "dari", "pada", "dalam", "untuk", "dengan", "atau",
  "ini", "itu", "adalah", "merupakan", "sebagai", "oleh", "karena", "namun",
  "tetapi", "juga", "serta", "dapat", "akan", "telah", "sudah", "saat", "ketika",
  "antara", "hingga", "sampai", "bahwa", "tersebut", "berada", "memiliki", "menjadi",
  "arca", "prasasti", "koleksi", "museum", "mpu", "purwa", "batu", "era", "abad",
]);

function tokenizeMeaning(text: string | null): Set<string> {
  if (!text) return new Set();
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 4 && !STOPWORDS.has(word));
  return new Set(tokens);
}

function normalizeText(value: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

/**
 * Menghitung skor kemiripan deterministik antara koleksi acuan dan kandidat lain:
 * - Era sama: +5 poin
 * - Material sama (non-kosong): +3 poin
 * - Irisan kata penting pada `meaning`: +1 poin per kata unik yang sama (maksimal +6 poin)
 */
function computeSimilarityScore(
  target: { era: string; material: string | null; meaningTokens: Set<string> },
  candidate: { era: string; material: string | null; meaningTokens: Set<string> },
): number {
  let score = 0;

  if (normalizeText(target.era) !== "" && normalizeText(target.era) === normalizeText(candidate.era)) {
    score += 5;
  }

  const targetMat = normalizeText(target.material);
  const candidateMat = normalizeText(candidate.material);
  if (targetMat !== "" && targetMat === candidateMat) {
    score += 3;
  }

  let sharedWords = 0;
  for (const word of target.meaningTokens) {
    if (candidate.meaningTokens.has(word)) {
      sharedWords++;
      if (sharedWords >= 6) break;
    }
  }
  score += sharedWords;

  return score;
}

/**
 * Mengembalikan hingga 4 koleksi lain yang paling mirip dengan `collectionId`.
 * Menggunakan satu kali query `findMany` agar tidak terjadi N+1 query.
 * Mengembalikan `null` bila `collectionId` tidak ditemukan di database.
 */
export async function findSimilarCollections(collectionId: number, limit = 4): Promise<SimilarCollectionItem[] | null> {
  const allRows = await prisma.collection.findMany({
    select: {
      id: true,
      name: true,
      era: true,
      material: true,
      meaning: true,
      photoUrl: true,
    },
    orderBy: { id: "asc" },
  });

  const target = allRows.find((row) => row.id === collectionId);
  if (!target) return null;

  const targetProfile = {
    era: target.era,
    material: target.material,
    meaningTokens: tokenizeMeaning(target.meaning),
  };

  const scored = allRows
    .filter((row) => row.id !== collectionId)
    .map((row) => ({
      item: {
        id: row.id,
        name: row.name,
        era: row.era,
        material: row.material,
        photoUrl: row.photoUrl,
      },
      score: computeSimilarityScore(targetProfile, {
        era: row.era,
        material: row.material,
        meaningTokens: tokenizeMeaning(row.meaning),
      }),
    }))
    .sort((a, b) => b.score - a.score || a.item.id - b.item.id);

  return scored.slice(0, limit).map((entry) => entry.item);
}