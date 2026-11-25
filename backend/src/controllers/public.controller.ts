// Endpoint publik untuk aplikasi mobile pengunjung (tanpa login admin).
//
//   GET  /api/public/collections        daftar koleksi lengkap
//   GET  /api/public/collections/:id    satu koleksi
//   POST /api/public/bookings           ajukan booking rombongan (status awal: pending)
//   GET  /api/public/bookings?ids=a,b   status booking milik pengunjung (id didapat saat mengajukan)
//   POST /api/public/visits             catat check-in setelah scan QR
//
// Semua balasan memakai format yang sama dengan API admin: { success, data, message? }.
// Sengaja TIDAK ada endpoint ubah/hapus: perubahan data hanya lewat admin yang login.

import type { NextFunction, Request, Response } from "express";
import { config } from "../config";
import { verifyCheckinQr } from "../lib/checkinQr";
import { PERSON_NAME_RULE, bodyAsRecord, isOneOf, isPersonName, isValidEmail, readText } from "../lib/validate";
import { dateOnly, todayInMuseumTimezone } from "../services/dates";
import {
  findPublicBookings,
  findPublicCollection,
  listPublicCollectionData,
  recordCheckIn,
  submitPublicBooking,
} from "../services/publicApi.service";
import { fail, ok } from "../utils/response";

const EDUCATION_LEVELS = ["Mahasiswa", "Pelajar", "Umum"] as const;
const MIN_PARTICIPANTS = 2;
const MAX_PARTICIPANTS = 500;

export async function listPublicCollections(_req: Request, res: Response, next: NextFunction) {
  try {
    return ok(res, await listPublicCollectionData());
  } catch (error) {
    return next(error);
  }
}

export async function getPublicCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const raw = readText(req.params.id);
    if (!/^\d+$/.test(raw)) return fail(res, 400, "Id koleksi tidak valid.");
    const row = await findPublicCollection(Number(raw));
    if (!row) return fail(res, 404, "Koleksi tidak ditemukan.");
    return ok(res, row);
  } catch (error) {
    return next(error);
  }
}

export async function createPublicBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const body = bodyAsRecord(req.body);

    const institution = readText(body.institution);
    if (!institution) return fail(res, 400, "Nama instansi wajib diisi.");
    if (institution.length > 150) return fail(res, 400, "Nama instansi maksimal 150 karakter.");

    const contactName = readText(body.contactName);
    if (!contactName) return fail(res, 400, "Nama penanggung jawab wajib diisi.");
    if (!isPersonName(contactName)) return fail(res, 400, `Nama penanggung jawab ${PERSON_NAME_RULE}`);
    if (contactName.length > 100) return fail(res, 400, "Nama penanggung jawab maksimal 100 karakter.");

    const phone = readText(body.phone);
    if (!/^[0-9+\-\s]{8,20}$/.test(phone)) return fail(res, 400, "Nomor HP tidak valid.");

    const participants = Number(body.participants);
    if (!Number.isInteger(participants) || participants < MIN_PARTICIPANTS || participants > MAX_PARTICIPANTS) {
      return fail(res, 400, `Jumlah peserta harus ${MIN_PARTICIPANTS} sampai ${MAX_PARTICIPANTS}.`);
    }

    const visitDate = readText(body.visitDate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(visitDate) || Number.isNaN(dateOnly(visitDate).getTime())) {
      return fail(res, 400, "Tanggal kunjungan harus berformat YYYY-MM-DD.");
    }
    if (visitDate < todayInMuseumTimezone()) return fail(res, 400, "Tanggal kunjungan tidak boleh sudah lewat.");

    const email = readText(body.email);
    if (email && !isValidEmail(email)) return fail(res, 400, "Format email tidak valid.");

    const notes = readText(body.notes);
    if (notes.length > 1000) return fail(res, 400, "Catatan maksimal 1000 karakter.");

    const created = await submitPublicBooking({
      institution,
      contactName,
      email: email || null,
      phone,
      visitDate,
      participants,
      notes: notes || null,
    });
    return ok(res, created, { status: 201, message: "Pengajuan booking terkirim." });
  } catch (error) {
    return next(error);
  }
}

export async function listPublicBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const ids = readText(req.query.ids)
      .split(",")
      .map((id) => id.trim())
      .filter((id) => /^bk-[0-9a-f]{12}$/.test(id))
      .slice(0, 50);
    if (ids.length === 0) return ok(res, []);
    return ok(res, await findPublicBookings(ids));
  } catch (error) {
    return next(error);
  }
}

export async function createPublicVisit(req: Request, res: Response, next: NextFunction) {
  try {
    const body = bodyAsRecord(req.body);

    // QR di pintu masuk: bertanda tangan dan hanya berlaku pada hari ini (lihat lib/checkinQr.ts).
    if (body.qrToken !== undefined && body.qrToken !== null && body.qrToken !== "") {
      const qr = verifyCheckinQr(body.qrToken);
      if (!qr.ok) {
        req.log.warn({ event: "checkin_qr_rejected", reason: qr.reason }, "Check-in QR rejected");
        return fail(res, 400, qr.reason === "expired" ? "QR sudah kedaluwarsa. Pindai QR yang dipasang hari ini." : "QR check-in tidak valid.");
      }
    } else if (config.checkinQrRequired) {
      return fail(res, 400, "Pindai QR di pintu masuk museum untuk check-in.");
    }

    // Pengunjung yang sudah login (token Bearer): identitasnya diambil dari akun, bukan dari isian aplikasi,
    // supaya check-in tidak bisa memakai nama orang lain, dan riwayatnya terhubung ke akun.
    const account = req.visitor;
    let visitorName: string;
    let domicile: string;
    let institution: string;
    let level: (typeof EDUCATION_LEVELS)[number];

    if (account) {
      visitorName = account.name;
      domicile = account.domicile;
      institution = account.institution ?? "";
      level = account.educationLevel;
    } else {
      visitorName = readText(body.name);
      if (!visitorName) return fail(res, 400, "Nama pengunjung wajib diisi.");
      if (!isPersonName(visitorName)) return fail(res, 400, `Nama pengunjung ${PERSON_NAME_RULE}`);
      if (visitorName.length > 100) return fail(res, 400, "Nama maksimal 100 karakter.");

      domicile = readText(body.domicile);
      if (!domicile) return fail(res, 400, "Domisili wajib diisi.");
      if (domicile.length > 80) return fail(res, 400, "Domisili maksimal 80 karakter.");

      institution = readText(body.institution);
      if (institution.length > 150) return fail(res, 400, "Institusi maksimal 150 karakter.");

      const requested = body.educationLevel ?? "Umum";
      if (!isOneOf(requested, EDUCATION_LEVELS)) return fail(res, 400, "Jenjang harus Mahasiswa, Pelajar, atau Umum.");
      level = requested;
    }

    const visit = await recordCheckIn({
      visitorAccountId: account?.id ?? null,
      visitorName,
      domicile,
      institution: institution || null,
      educationLevel: level,
    });
    return visit.alreadyRecorded
      ? ok(res, visit, { message: "Kunjungan hari ini sudah tercatat." })
      : ok(res, visit, { status: 201, message: "Kunjungan tercatat." });
  } catch (error) {
    return next(error);
  }
}
