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

import { randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { config } from "../config";
import { verifyCheckinQr } from "../lib/checkinQr";
import { prisma } from "../lib/prisma";
import { bodyAsRecord, isOneOf, isValidEmail, readText } from "../lib/validate";
import { dateOnly, todayInMuseumTimezone } from "../services/dates";
import { fail, ok } from "../utils/response";

const COLLECTION_SELECT = {
  id: true,
  name: true,
  era: true,
  period: true,
  origin: true,
  material: true,
  dimensions: true,
  meaning: true,
  photoUrl: true,
  videoUrl: true,
  pdfUrl: true,
} as const;

const EDUCATION_LEVELS = ["Mahasiswa", "Pelajar", "Umum"] as const;
const MIN_PARTICIPANTS = 2;
const MAX_PARTICIPANTS = 500;

export async function listPublicCollections(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await prisma.collection.findMany({ select: COLLECTION_SELECT, orderBy: { id: "asc" } });
    return ok(res, rows);
  } catch (error) {
    return next(error);
  }
}

export async function getPublicCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const raw = readText(req.params.id);
    if (!/^\d+$/.test(raw)) return fail(res, 400, "Id koleksi tidak valid.");
    const row = await prisma.collection.findUnique({ where: { id: Number(raw) }, select: COLLECTION_SELECT });
    if (!row) return fail(res, 404, "Koleksi tidak ditemukan.");
    return ok(res, row);
  } catch (error) {
    return next(error);
  }
}

/** Id acak yang sulit ditebak: pengunjung hanya bisa melihat booking yang id-nya ia pegang. */
function newBookingId(): string {
  return `bk-${randomBytes(6).toString("hex")}`;
}

function newVisitId(): string {
  return `VIS-${randomBytes(4).toString("hex")}`; // 12 karakter, muat di VarChar(12)
}

function mapPublicBooking(row: {
  id: string;
  institution: string;
  contactName: string;
  phone: string;
  visitDate: Date;
  participantCount: number;
  notes: string | null;
  status: string;
  createdAt: Date;
}) {
  return {
    id: row.id,
    institution: row.institution,
    contactName: row.contactName,
    phone: row.phone,
    visitDate: row.visitDate.toISOString().slice(0, 10),
    participants: row.participantCount,
    notes: row.notes ?? "",
    status: row.status,
    submittedAt: row.createdAt.toISOString(),
  };
}

export async function createPublicBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const body = bodyAsRecord(req.body);

    const institution = readText(body.institution);
    if (!institution) return fail(res, 400, "Nama instansi wajib diisi.");
    if (institution.length > 150) return fail(res, 400, "Nama instansi maksimal 150 karakter.");

    const contactName = readText(body.contactName);
    if (!contactName) return fail(res, 400, "Nama penanggung jawab wajib diisi.");
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

    const created = await prisma.booking.create({
      data: {
        id: newBookingId(),
        institution,
        contactName,
        email: email || null,
        phone,
        visitDate: dateOnly(visitDate),
        participantCount: participants,
        notes: notes || null,
        status: "pending",
      },
    });
    return ok(res, mapPublicBooking(created), { status: 201, message: "Pengajuan booking terkirim." });
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
    const rows = await prisma.booking.findMany({ where: { id: { in: ids } }, orderBy: { createdAt: "desc" } });
    return ok(res, rows.map(mapPublicBooking));
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

    const visitorName = readText(body.name);
    if (!visitorName) return fail(res, 400, "Nama pengunjung wajib diisi.");
    if (visitorName.length > 100) return fail(res, 400, "Nama maksimal 100 karakter.");

    const domicile = readText(body.domicile);
    if (!domicile) return fail(res, 400, "Domisili wajib diisi.");
    if (domicile.length > 80) return fail(res, 400, "Domisili maksimal 80 karakter.");

    const institution = readText(body.institution);
    if (institution.length > 150) return fail(res, 400, "Institusi maksimal 150 karakter.");

    const level = body.educationLevel ?? "Umum";
    if (!isOneOf(level, EDUCATION_LEVELS)) return fail(res, 400, "Jenjang harus Mahasiswa, Pelajar, atau Umum.");

    // Satu pengunjung (nama + domisili) hanya tercatat sekali per hari.
    const today = dateOnly(todayInMuseumTimezone());
    const dupe = await prisma.visit.findFirst({ where: { visitDate: today, visitorName, domicile } });
    if (dupe) return ok(res, { id: dupe.id, alreadyRecorded: true }, { message: "Kunjungan hari ini sudah tercatat." });

    // Jam masuk dalam zona waktu museum, disimpan sebagai kolom TIME.
    const hhmm = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    const created = await prisma.visit.create({
      data: {
        id: newVisitId(),
        visitorName,
        domicile,
        institution: institution || null,
        educationLevel: level,
        visitDate: today,
        checkInTime: new Date(`1970-01-01T${hhmm}:00Z`),
      },
    });
    return ok(res, { id: created.id, alreadyRecorded: false }, { status: 201, message: "Kunjungan tercatat." });
  } catch (error) {
    return next(error);
  }
}
