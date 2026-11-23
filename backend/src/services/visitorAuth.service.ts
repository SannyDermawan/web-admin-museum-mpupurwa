// Pendaftaran dan login pengunjung aplikasi mobile: tanpa kata sandi, memakai kode OTP 6 digit yang dikirim ke email.
//
//   register  -> membuat akun (belum terverifikasi) lalu mengirim OTP
//   login     -> mengirim OTP ke akun yang sudah ada
//   verifyOtp -> kode benar: akun terverifikasi dan pengunjung mendapat token login (lihat lib/visitorToken.ts)
//
// Aturan keamanan OTP: kode 6 digit acak (crypto.randomInt), hanya hash HMAC-nya yang disimpan, berlaku 10 menit,
// maksimal 5 tebakan salah per kode, minta kode baru paling cepat tiap 60 detik, dan hanya kode terbaru yang berlaku.

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import { config } from "../config";
import { createVisitorToken } from "../lib/visitorToken";
import { prisma } from "../lib/prisma";
import type { VisitorEducationLevel, VisitorProfile } from "../types/visitors";
import { dateOnly, todayInMuseumTimezone } from "./dates";
import { sendOtpEmail } from "./mailer";

export const OTP_TTL_SECONDS = 10 * 60;
export const OTP_RESEND_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 5;

const ID_PREFIX = "ACC-";
const MAX_ID_ATTEMPTS = 3;

export class VisitorAuthError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "VisitorAuthError";
  }
}

function isPrismaError(error: unknown, code: string): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

function hashCode(accountId: string, code: string): string {
  const key = createHmac("sha256", config.sessionSecret).update("visitor-otp-v1").digest("hex");
  return createHmac("sha256", key).update(`${accountId}:${code}`).digest("hex");
}

const ACCOUNT_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  domicile: true,
  institution: true,
  educationLevel: true,
  emailVerifiedAt: true,
} as const;

type AccountRow = Prisma.VisitorAccountGetPayload<{ select: typeof ACCOUNT_SELECT }>;

export function toVisitorProfile(row: AccountRow): VisitorProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    domicile: row.domicile,
    institution: row.institution,
    educationLevel: row.educationLevel,
    verified: row.emailVerifiedAt !== null,
  };
}

export async function findVisitorById(id: string): Promise<VisitorProfile | null> {
  const row = await prisma.visitorAccount.findUnique({ where: { id }, select: ACCOUNT_SELECT });
  return row ? toVisitorProfile(row) : null;
}

/** "ACC-007" untuk akun berikutnya: angka tertinggi yang dipakai ditambah satu (nomor akun terhapus tidak dipakai ulang). */
async function nextVisitorId(): Promise<string> {
  const rows = await prisma.visitorAccount.findMany({ select: { id: true } });
  const highest = rows.reduce((max, { id }) => {
    const number = id.startsWith(ID_PREFIX) ? Number.parseInt(id.slice(ID_PREFIX.length), 10) : 0;
    return Number.isFinite(number) ? Math.max(max, number) : max;
  }, 0);
  return `${ID_PREFIX}${String(highest + 1).padStart(3, "0")}`;
}

export type RegisterInput = {
  name: string;
  email: string;
  phone: string;
  domicile: string;
  institution: string | null;
  educationLevel: VisitorEducationLevel;
};

export type OtpIssued = { sent: boolean; devCode?: string };

const COOLDOWN_MESSAGE = `Tunggu ${OTP_RESEND_SECONDS} detik sebelum meminta kode baru.`;

/** true jika akun ini baru saja meminta kode (kurang dari OTP_RESEND_SECONDS yang lalu). */
async function resendTooSoon(accountId: string): Promise<boolean> {
  const latest = await prisma.visitorOtp.findFirst({
    where: { accountId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  return latest !== null && Date.now() - latest.createdAt.getTime() < OTP_RESEND_SECONDS * 1000;
}

/** Membuat OTP baru untuk akun lalu mengirimnya. `silentCooldown`: saat terlalu cepat, tidak melempar error (dipakai login). */
async function issueOtp(account: { id: string; name: string; email: string }, silentCooldown: boolean): Promise<OtpIssued> {
  if (await resendTooSoon(account.id)) {
    if (silentCooldown) return { sent: false };
    throw new VisitorAuthError(429, COOLDOWN_MESSAGE);
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  // Hanya kode terbaru yang berlaku: kode lama dihapus.
  const [, created] = await prisma.$transaction([
    prisma.visitorOtp.deleteMany({ where: { accountId: account.id } }),
    prisma.visitorOtp.create({
      data: { accountId: account.id, codeHash: hashCode(account.id, code), expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000) },
    }),
  ]);

  try {
    await sendOtpEmail(account.email, account.name, code, OTP_TTL_SECONDS / 60);
  } catch (error) {
    // Kode yang tidak sampai ke pengunjung tidak boleh tertinggal.
    await prisma.visitorOtp.delete({ where: { id: created.id } }).catch(() => undefined);
    throw error;
  }
  return { sent: true, ...(config.otpDevEcho ? { devCode: code } : {}) };
}

export async function registerVisitor(input: RegisterInput): Promise<OtpIssued> {
  const existing = await prisma.visitorAccount.findUnique({ where: { email: input.email }, select: ACCOUNT_SELECT });
  if (existing?.emailVerifiedAt) throw new VisitorAuthError(409, "Email sudah terdaftar. Silakan masuk.");

  const profile = {
    name: input.name,
    phone: input.phone,
    domicile: input.domicile,
    institution: input.institution,
    educationLevel: input.educationLevel,
  };

  let account: { id: string; name: string; email: string };
  if (existing) {
    // Diperiksa SEBELUM data diubah: permintaan yang ditolak karena terlalu cepat tidak boleh menimpa profil.
    if (await resendTooSoon(existing.id)) throw new VisitorAuthError(429, COOLDOWN_MESSAGE);
    // Pendaftaran yang belum diverifikasi boleh diulang: data diperbarui dan kode baru dikirim.
    account = await prisma.visitorAccount.update({ where: { id: existing.id }, data: profile, select: { id: true, name: true, email: true } });
  } else {
    account = await createAccount(input.email, profile);
  }
  return issueOtp(account, false);
}

async function createAccount(email: string, profile: Omit<RegisterInput, "email">) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await prisma.visitorAccount.create({
        data: { id: await nextVisitorId(), email, ...profile, registeredAt: dateOnly(todayInMuseumTimezone()) },
        select: { id: true, name: true, email: true },
      });
    } catch (error) {
      if (isPrismaError(error, "P2002")) {
        // Dua pendaftaran di saat yang sama bisa memilih id yang sama: coba lagi dengan id berikutnya.
        const target = String(error.meta?.target ?? "");
        if (target.includes("email")) throw new VisitorAuthError(409, "Email sudah terdaftar. Silakan masuk.");
        if (attempt < MAX_ID_ATTEMPTS) continue;
      }
      throw error;
    }
  }
}

/** Mengirim OTP ke akun yang ada. Tidak membocorkan apakah emailnya terdaftar: hasilnya selalu sama bagi pemanggil. */
export async function loginVisitor(email: string): Promise<OtpIssued> {
  const account = await prisma.visitorAccount.findUnique({ where: { email }, select: { id: true, name: true, email: true } });
  if (!account) return { sent: false };
  return issueOtp(account, true);
}

const WRONG_CODE = "Kode salah atau sudah kedaluwarsa.";

export async function verifyVisitorOtp(email: string, code: string) {
  const account = await prisma.visitorAccount.findUnique({ where: { email }, select: ACCOUNT_SELECT });
  if (!account) throw new VisitorAuthError(400, WRONG_CODE);

  const otp = await prisma.visitorOtp.findFirst({ where: { accountId: account.id }, orderBy: { createdAt: "desc" } });
  if (!otp || otp.expiresAt.getTime() < Date.now()) throw new VisitorAuthError(400, WRONG_CODE);

  // Tebakan dihitung lebih dulu (atomik di database), baru dibandingkan, supaya permintaan paralel tidak melewati batas.
  const counted = await prisma.visitorOtp.updateMany({
    where: { id: otp.id, attempts: { lt: OTP_MAX_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  });
  if (counted.count === 0) throw new VisitorAuthError(429, "Terlalu banyak tebakan salah. Minta kode baru.");

  const expected = Buffer.from(otp.codeHash);
  const given = Buffer.from(hashCode(account.id, code));
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) throw new VisitorAuthError(400, WRONG_CODE);

  const verified = await prisma.$transaction(async (tx) => {
    await tx.visitorOtp.deleteMany({ where: { accountId: account.id } });
    return tx.visitorAccount.update({
      where: { id: account.id },
      data: { emailVerifiedAt: account.emailVerifiedAt ?? new Date() },
      select: ACCOUNT_SELECT,
    });
  });
  return { ...createVisitorToken(verified.id), account: toVisitorProfile(verified) };
}
