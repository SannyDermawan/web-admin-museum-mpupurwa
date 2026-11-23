// Mengirim kode OTP lewat email.
//
//  - RESEND_API_KEY diisi : kirim sungguhan lewat Resend (https://resend.com), dari alamat MAIL_FROM.
//  - kosong, development  : kode dicatat di log server (dan, jika OTP_DEV_ECHO, ikut dibalas ke aplikasi) supaya bisa diuji.
//  - kosong, production   : gagal dengan 503. Tidak pernah mengirim kode lewat respons API di production.

import { config } from "../config";
import { logger } from "../lib/logger";

export class MailError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "MailError";
  }
}

export type OtpDelivery = { delivered: boolean };

export async function sendOtpEmail(to: string, name: string, code: string, ttlMinutes: number): Promise<OtpDelivery> {
  if (!config.resendApiKey) {
    if (config.isProduction) throw new MailError(503, "Pengiriman email belum dikonfigurasi di server.");
    logger.info({ event: "otp_dev", to, code }, "OTP (development, email tidak dikirim)");
    return { delivered: false };
  }

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: config.mailFrom,
        to: [to],
        subject: `Kode masuk Museum Mpu Purwa: ${code}`,
        text: `Halo ${name},\n\nKode masukmu: ${code}\nBerlaku ${ttlMinutes} menit. Jangan berikan kode ini kepada siapa pun.\n\nJika kamu tidak meminta kode ini, abaikan email ini.\n\nMuseum Mpu Purwa`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    logger.error({ err: error }, "Pengiriman email OTP gagal (jaringan)");
    throw new MailError(502, "Gagal mengirim email. Coba lagi beberapa saat lagi.");
  }

  if (!response.ok) {
    // Isi balasan Resend dicatat (tanpa kode OTP), tidak dikirim ke pengunjung.
    logger.error({ status: response.status, body: (await response.text()).slice(0, 300) }, "Resend menolak email OTP");
    throw new MailError(502, "Gagal mengirim email. Coba lagi beberapa saat lagi.");
  }
  return { delivered: true };
}
