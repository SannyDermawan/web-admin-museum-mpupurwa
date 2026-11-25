// Model tabel `visitor_otps` (kode OTP pengunjung, disimpan sebagai hash).

import { prisma } from "../config/db";
import { visitorProfileSelect } from "./visitorAccountModel";

export const findLatestOtp = (accountId: string) =>
  prisma.visitorOtp.findFirst({ where: { accountId }, orderBy: { createdAt: "desc" } });

/** Hanya kode terbaru yang berlaku: kode lama dihapus dalam satu transaksi dengan pembuatan yang baru. */
export async function replaceOtp(accountId: string, codeHash: string, expiresAt: Date) {
  const [, created] = await prisma.$transaction([
    prisma.visitorOtp.deleteMany({ where: { accountId } }),
    prisma.visitorOtp.create({ data: { accountId, codeHash, expiresAt } }),
  ]);
  return created;
}

export const removeOtp = (id: number) => prisma.visitorOtp.delete({ where: { id } });

/** Menghitung satu tebakan secara atomik. `count` 0 berarti batas tebakan sudah habis. */
export const countOtpAttempt = (id: number, maxAttempts: number) =>
  prisma.visitorOtp.updateMany({ where: { id, attempts: { lt: maxAttempts } }, data: { attempts: { increment: 1 } } });

/** Kode benar: hapus semua OTP akun dan tandai emailnya terverifikasi (sekali pakai). */
export const consumeOtpAndVerify = (accountId: string, verifiedAt: Date) =>
  prisma.$transaction(async (tx) => {
    await tx.visitorOtp.deleteMany({ where: { accountId } });
    return tx.visitorAccount.update({
      where: { id: accountId },
      data: { emailVerifiedAt: verifiedAt },
      select: visitorProfileSelect,
    });
  });
