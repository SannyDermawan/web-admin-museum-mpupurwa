// Dummy numbers for the dashboard (UTS).

import type {
  DashboardData,
  DashboardRange,
  VisitorTrendData,
  VisitorTrendPoint,
} from "../types";
import { getPendingBookings } from "./bookings";
import { dummyVisitors } from "./visitors";

// ---------- Visitor chart (24 hours / 7 days / 30 days) ----------

/** The ranges every dashboard chart accepts (?range=...). */
export const DASHBOARD_RANGES: DashboardRange[] = ["24h", "7d", "30d"];

const MUSEUM_TIMEZONE = "Asia/Jakarta";

// The museum is open 08.00 - 16.00, Monday to Friday. It is closed on Saturday and Sunday,
// so those days (and hours outside opening time) always have 0 visitors.

// 7 days: Monday - Sunday, oldest first.
const lastSevenDays: VisitorTrendPoint[] = [
  { label: "Senin", visitors: 42 },
  { label: "Selasa", visitors: 58 },
  { label: "Rabu", visitors: 67 },
  { label: "Kamis", visitors: 51 },
  { label: "Jumat", visitors: 73 },
  { label: "Sabtu", visitors: 0 },
  { label: "Minggu", visitors: 0 },
];

// 24 hours: the chart runs from opening (08.00) to closing (16.00), one point per hour.
// It shows the hourly pattern of the latest open day, so it always has data (also on a
// weekend, when the museum is closed). The 73 visitors match "Jumat" in the 7 day chart.
// 16.00 is closing time, so it is always 0.
const OPENING_HOUR = 8;
const CLOSING_HOUR = 16;
const VISITORS_BY_HOUR: Record<number, number> = {
  8: 3, 9: 7, 10: 11, 11: 14, 12: 9, 13: 12, 14: 10, 15: 7,
};

// 30 days: typical visitors by weekday, Sunday first. Saturday and Sunday are closed.
// These are the same numbers as the 7 day chart (Senin 42 ... Jumat 73).
const VISITORS_BY_WEEKDAY = [0, 42, 58, 67, 51, 73, 0];

function lastTwentyFourHours(): VisitorTrendPoint[] {
  return Array.from({ length: CLOSING_HOUR - OPENING_HOUR + 1 }, (_, index) => {
    const hour = OPENING_HOUR + index;
    return { label: `${String(hour).padStart(2, "0")}.00`, visitors: VISITORS_BY_HOUR[hour] ?? 0 };
  });
}

function lastThirtyDays(): VisitorTrendPoint[] {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: MUSEUM_TIMEZONE }).format(new Date()); // YYYY-MM-DD
  const todayUtc = new Date(`${today}T00:00:00Z`);
  const dayLabel = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" });

  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(todayUtc);
    date.setUTCDate(todayUtc.getUTCDate() - (29 - index));
    const typical = VISITORS_BY_WEEKDAY[date.getUTCDay()];
    // Older open days get a small repeatable wobble so they are not all identical.
    // The latest 7 days use the exact numbers of the 7 day chart. Closed days stay at 0.
    const isLastSevenDays = index >= 23;
    const wobble = isLastSevenDays ? 0 : ((index * 7) % 11) - 5;
    return { label: dayLabel.format(date), visitors: typical === 0 ? 0 : typical + wobble };
  });
}

export function getVisitorTrend(range: DashboardRange): VisitorTrendData {
  const points = range === "24h" ? lastTwentyFourHours() : range === "30d" ? lastThirtyDays() : lastSevenDays;
  return { range, points };
}

// The visitor/account/collection numbers are aggregates, so they are stored here instead of
// being counted from lists. Booking numbers are counted from data/bookings.ts.
export function getDashboardData(): DashboardData {
  const pendingBookings = getPendingBookings();

  return {
    stats: {
      todayVisitors: 23,
      todayVisitorsChangePercent: 12,
      pendingBookings: pendingBookings.length,
      totalAccounts: 1204,
      newAccounts: 48,
      totalCollections: 129,
    },
    recentVisitors: dummyVisitors.slice(0, 4),
    pendingBookings,
  };
}
