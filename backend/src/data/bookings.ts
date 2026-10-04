// Dummy group bookings (UTS). This is the ONE booking data source: the Booking API
// (bookings.controller.ts) and the dashboard statistics (helpers at the bottom) both read
// `bookingsData`, so approving a booking on the Booking page also changes the dashboard.

import type { BookingStatusCounts, DashboardRange, PendingBookingSummary } from "../types";

export type BookingStatus = "pending" | "confirmed" | "completed" | "rejected";

/** The statuses a booking can have (used to validate PATCH /api/bookings/:id/status). */
export const BOOKING_STATUSES: BookingStatus[] = ["pending", "confirmed", "completed", "rejected"];

export interface BookingItem {
  id: string;
  institution: string;
  contact: string;
  phone: string;
  /** Visit date as shown on the Booking page, e.g. "29 Sep 2026" */
  date: string;
  participants: number;
  /** Submission time as text for people, e.g. "22 Sep 2026, 10:14". Always the same moment as `createdAt`. */
  submittedAt: string;
  /**
   * Submission time as an ISO timestamp. The dashboard needs it to count bookings of the
   * last 24 hours / 7 days / 30 days (the text in `submittedAt` is not made for filtering).
   */
  createdAt: string;
  notes: string;
  status: BookingStatus;
}

const HOUR = 60 * 60 * 1000;

const MUSEUM_TIMEZONE = "Asia/Jakarta";

// Bookings were submitted "so many hours ago" counted from the moment the data is read (see the
// getters below), so the 24 hour / 7 day / 30 day windows always contain data, however long the
// server has been running.
const hoursAgo = (hours: number) => new Date(Date.now() - hours * HOUR).toISOString();

const submittedAtFormat = new Intl.DateTimeFormat("id-ID", {
  timeZone: MUSEUM_TIMEZONE,
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** ISO timestamp -> "22 Sep 2026, 10:14" (the format `submittedAt` always had). */
function formatSubmittedAt(iso: string): string {
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    submittedAtFormat.formatToParts(new Date(iso)).find((item) => item.type === type)?.value ?? "";
  return `${part("day")} ${part("month")} ${part("year")}, ${part("hour")}:${part("minute")}`;
}

export const bookingsData: BookingItem[] = [
  {
    id: "sdn1",
    institution: "SDN Merjosari 1 Malang",
    contact: "Dewi Saraswati",
    phone: "0813-2456-7890",
    date: "29 Sep 2026",
    participants: 65,
    get createdAt() {
      return hoursAgo(6 * 24);
    },
    get submittedAt() {
      return formatSubmittedAt(this.createdAt);
    },
    notes: "Butuh pemandu untuk siswa SD",
    status: "pending",
  },
  {
    id: "smpn4",
    institution: "SMPN 4 Malang",
    contact: "Budi Hartono",
    phone: "0812-3456-7891",
    date: "02 Okt 2026",
    participants: 48,
    get createdAt() {
      return hoursAgo(3 * 24);
    },
    get submittedAt() {
      return formatSubmittedAt(this.createdAt);
    },
    notes: "Kunjungan edukasi sejarah",
    status: "pending",
  },
  {
    id: "tk",
    institution: "TK Tunas Bangsa",
    contact: "Sri Wahyuni",
    phone: "0815-6789-0123",
    date: "05 Okt 2026",
    participants: 20,
    get createdAt() {
      return hoursAgo(5);
    },
    get submittedAt() {
      return formatSubmittedAt(this.createdAt);
    },
    notes: "Siswa PAUD dan pendamping",
    status: "pending",
  },
  {
    id: "ub",
    institution: "Universitas Brawijaya — Prodi Sejarah",
    contact: "Anisa Rahma",
    phone: "0821-9876-5432",
    date: "25 Sep 2026",
    participants: 30,
    get createdAt() {
      return hoursAgo(12 * 24);
    },
    get submittedAt() {
      return formatSubmittedAt(this.createdAt);
    },
    notes: "Penelitian lapangan",
    status: "confirmed",
  },
  {
    id: "sman1",
    institution: "SMAN 1 Batu",
    contact: "Rudi Setiawan",
    phone: "0857-1234-5678",
    date: "20 Sep 2026",
    participants: 55,
    get createdAt() {
      return hoursAgo(25 * 24);
    },
    get submittedAt() {
      return formatSubmittedAt(this.createdAt);
    },
    notes: "- ",
    status: "rejected",
  },
];

// ---------- Helpers for the dashboard ----------

const WINDOW_HOURS: Record<DashboardRange, number> = { "24h": 24, "7d": 7 * 24, "30d": 30 * 24 };

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", mei: "05", jun: "06",
  jul: "07", agu: "08", sep: "09", okt: "10", nov: "11", des: "12",
};

/** "29 Sep 2026" / "02 Okt 2026" -> "2026-09-29" / "2026-10-02". Returns null when the text is not in that format. */
function toIsoDate(text: string): string | null {
  const match = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/.exec(text.trim());
  const month = match ? MONTHS[match[2].toLowerCase()] : undefined;
  return match && month ? `${match[3]}-${month}-${match[1].padStart(2, "0")}` : null;
}

/** Bookings waiting for approval, earliest visit first (the dashboard's "Booking Menunggu" list). */
export function getPendingBookings(): PendingBookingSummary[] {
  return bookingsData
    .filter((booking) => booking.status === "pending")
    .map((booking) => ({
      id: booking.id,
      institutionName: booking.institution,
      participantCount: booking.participants,
      // Falls back to the submission day if a visit date is ever written in another format.
      visitDate: toIsoDate(booking.date) ?? booking.createdAt.slice(0, 10),
      createdAt: booking.createdAt,
    }))
    .sort((a, b) => a.visitDate.localeCompare(b.visitDate));
}

/** How many bookings of each status were submitted within the range. Counted from `bookingsData`. */
export function getBookingStatusCounts(range: DashboardRange): BookingStatusCounts {
  const since = Date.now() - WINDOW_HOURS[range] * HOUR;
  const counts: BookingStatusCounts = { confirmed: 0, pending: 0, completed: 0, rejected: 0 };

  for (const booking of bookingsData) {
    // A status outside the four known ones (the PATCH endpoint does not validate it) is not counted.
    if (Date.parse(booking.createdAt) >= since && booking.status in counts) counts[booking.status] += 1;
  }
  return counts;
}
