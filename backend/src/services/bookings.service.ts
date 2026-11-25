import type { BookingStatus } from "@prisma/client";
import { listAllBookings, updateBookingStatus } from "../models/bookingModel";

export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "rejected"] as const;

const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

function formatVisitDate(date: Date): string {
  const day = date.getUTCDate();
  const month = MONTHS_ID[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

type BookingRow = {
  id: string;
  institution: string;
  contactName: string;
  email: string | null;
  phone: string;
  visitDate: Date;
  participantCount: number;
  purpose: string | null;
  notes: string | null;
  status: BookingStatus;
};

function mapBooking(row: BookingRow) {
  return {
    id: row.id,
    institution: row.institution,
    contact: row.contactName,
    date: formatVisitDate(row.visitDate),
    participants: row.participantCount,
    status: row.status,
    email: row.email,
    phone: row.phone,
    purpose: row.purpose,
    notes: row.notes,
  };
}

export async function listBookings() {
  return (await listAllBookings()).map(mapBooking);
}

export async function changeBookingStatus(id: string, status: BookingStatus) {
  return mapBooking(await updateBookingStatus(id, status));
}