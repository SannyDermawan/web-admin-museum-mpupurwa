// Logika API publik untuk aplikasi mobile (koleksi, booking, check-in). Validasi input ada di controller,
// query ada di models/.

import { randomBytes } from "node:crypto";
import { insertBooking, listBookingsByIds, type BookingRecord } from "../models/bookingModel";
import { findCollectionDetail, listCollectionDetails } from "../models/collectionModel";
import { findVisit, insertVisit } from "../models/visitModel";
import type { EducationLevel } from "../types";
import { dateOnly, todayInMuseumTimezone } from "./dates";

export const listPublicCollectionData = () => listCollectionDetails();

export const findPublicCollection = (id: number) => findCollectionDetail(id);

/** Id acak yang sulit ditebak: pengunjung hanya bisa melihat booking yang id-nya ia pegang. */
function newBookingId(): string {
  return `bk-${randomBytes(6).toString("hex")}`;
}

function newVisitId(): string {
  return `VIS-${randomBytes(4).toString("hex")}`; // 12 karakter, muat di VarChar(12)
}

function toPublicBooking(row: BookingRecord) {
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

export type PublicBookingInput = {
  institution: string;
  contactName: string;
  email: string | null;
  phone: string;
  visitDate: string;
  participants: number;
  notes: string | null;
};

export async function submitPublicBooking(input: PublicBookingInput) {
  const created = await insertBooking({
    id: newBookingId(),
    institution: input.institution,
    contactName: input.contactName,
    email: input.email,
    phone: input.phone,
    visitDate: dateOnly(input.visitDate),
    participantCount: input.participants,
    notes: input.notes,
    status: "pending",
  });
  return toPublicBooking(created);
}

export async function findPublicBookings(ids: string[]) {
  return (await listBookingsByIds(ids)).map(toPublicBooking);
}

export type CheckInInput = {
  visitorAccountId: string | null;
  visitorName: string;
  domicile: string;
  institution: string | null;
  educationLevel: EducationLevel;
};

/** Mencatat check-in. Satu pengunjung hanya sekali per hari: per akun jika login, jika tidak per (nama + domisili). */
export async function recordCheckIn(input: CheckInInput): Promise<{ id: string; alreadyRecorded: boolean }> {
  const today = dateOnly(todayInMuseumTimezone());
  const dupe = await findVisit(
    input.visitorAccountId
      ? { visitDate: today, visitorAccountId: input.visitorAccountId }
      : { visitDate: today, visitorName: input.visitorName, domicile: input.domicile },
  );
  if (dupe) return { id: dupe.id, alreadyRecorded: true };

  // Jam masuk dalam zona waktu museum, disimpan sebagai kolom TIME.
  const hhmm = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }).format(new Date());

  const created = await insertVisit({
    id: newVisitId(),
    ...input,
    visitDate: today,
    checkInTime: new Date(`1970-01-01T${hhmm}:00Z`),
  });
  return { id: created.id, alreadyRecorded: false };
}
