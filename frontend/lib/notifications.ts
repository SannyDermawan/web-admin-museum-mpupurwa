// Builds the bell notifications from data the project already has: bookings that wait for
// approval (GET /api/dashboard) and newly registered visitor accounts (GET /api/accounts/visitors).
// Nothing is stored or sent: the list is recomputed from those two answers.

import type { PendingBookingSummary, VisitorAccount } from "@/types";

export type AppNotification = {
  /** Stable id, used to remember that it was read */
  id: string;
  title: string;
  message: string;
  /** When it happened (ms since epoch); newest first */
  time: number;
  /** Page the notification opens */
  href: string;
};

const DAY = 24 * 60 * 60 * 1000;
const NEW_BOOKING_WITHIN = DAY;
const NEW_ACCOUNTS_SHOWN = 2;
const MAX_NOTIFICATIONS = 8;

export function buildNotifications(
  pendingBookings: PendingBookingSummary[],
  visitorAccounts: VisitorAccount[],
  now: number,
): AppNotification[] {
  const bookingNotifications = pendingBookings.map((booking): AppNotification => {
    const time = Date.parse(booking.createdAt);
    const isNew = now - time < NEW_BOOKING_WITHIN;
    return {
      id: `booking:${booking.id}`,
      title: isNew ? "Booking baru" : "Booking menunggu",
      message: isNew
        ? `${booking.institutionName} mengajukan kunjungan ${booking.participantCount} peserta`
        : `${booking.institutionName} (${booking.participantCount} peserta) belum ditinjau`,
      time,
      // Same link the dashboard's "Tinjau" button uses.
      href: `/bookings?review=${booking.id}`,
    };
  });

  const accountNotifications = [...visitorAccounts]
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
    .slice(0, NEW_ACCOUNTS_SHOWN)
    .map(
      (account): AppNotification => ({
        id: `account:${account.id}`,
        title: "Akun pengunjung baru",
        message: `${account.name} mendaftar di aplikasi`,
        // registeredAt is a date only; treat it as the start of that day in Jakarta time.
        time: Date.parse(`${account.registeredAt}T00:00:00+07:00`),
        href: "/accounts/visitors",
      }),
    );

  return [...bookingNotifications, ...accountNotifications].sort((a, b) => b.time - a.time).slice(0, MAX_NOTIFICATIONS);
}
