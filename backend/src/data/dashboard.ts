// Dummy numbers for the dashboard (UTS).

import type { BookingStatusCounts, DashboardData, PendingBookingSummary, VisitorTrendPoint } from "../types";
import { dummyVisitors } from "./visitors";

const dummyPendingBookings: PendingBookingSummary[] = [
  { id: "BKG-001", institutionName: "SDN Merjosari 1 Malang", participantCount: 65, visitDate: "2026-09-29" },
  { id: "BKG-002", institutionName: "SMPN 4 Malang", participantCount: 48, visitDate: "2026-10-02" },
  { id: "BKG-003", institutionName: "TK Tunas Bangsa", participantCount: 20, visitDate: "2026-10-05" },
];

// Visitors per day for the last 7 days (oldest first).
const dummyVisitorTrend: VisitorTrendPoint[] = [
  { day: "Senin", visitors: 42 },
  { day: "Selasa", visitors: 58 },
  { day: "Rabu", visitors: 67 },
  { day: "Kamis", visitors: 51 },
  { day: "Jumat", visitors: 73 },
  { day: "Sabtu", visitors: 82 },
  { day: "Minggu", visitors: 64 },
];

// "pending" is counted from the pending list below so both always agree.
const dummyBookingStatus: BookingStatusCounts = {
  confirmed: 18,
  pending: dummyPendingBookings.length,
  completed: 42,
  rejected: 2,
};

// The stat numbers are aggregates, so they are stored here instead of being
// counted from the lists (the real backend will compute them).
export function getDashboardData(): DashboardData {
  return {
    stats: {
      todayVisitors: 23,
      todayVisitorsChangePercent: 12,
      pendingBookings: dummyPendingBookings.length,
      totalAccounts: 1204,
      newAccounts: 48,
      totalCollections: 129,
    },
    visitorTrend: dummyVisitorTrend,
    bookingStatus: dummyBookingStatus,
    recentVisitors: dummyVisitors.slice(0, 4),
    pendingBookings: dummyPendingBookings,
  };
}
