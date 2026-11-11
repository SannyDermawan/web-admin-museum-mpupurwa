// Numbers and charts of the dashboard, all counted from the database in a few queries.

import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type {
  BookingStatusCounts,
  DashboardData,
  DashboardRange,
  PendingBookingSummary,
  VisitorTrendData,
  VisitorTrendPoint,
} from "../types";
import { addDays, dateOnly, toIsoDate, todayInMuseumTimezone } from "./dates";
import { toVisitor } from "./visitors.service";

/** The ranges every dashboard chart accepts (?range=...). */
export const DASHBOARD_RANGES: DashboardRange[] = ["24h", "7d", "30d"];

// The museum is open 08.00 - 16.00 (Monday - Friday). The hourly chart runs from opening to closing.
const OPENING_HOUR = 8;
const CLOSING_HOUR = 16;

const RANGE_MS: Record<DashboardRange, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

const weekdayLabel = new Intl.DateTimeFormat("id-ID", { weekday: "long", timeZone: "UTC" });
const dayMonthLabel = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" });

/** One point per day for the last `days` days (oldest first); days without check-ins are 0. */
async function visitsPerDay(days: number, label: Intl.DateTimeFormat): Promise<VisitorTrendPoint[]> {
  const today = dateOnly(todayInMuseumTimezone());
  const start = addDays(today, -(days - 1));

  const rows = await prisma.visit.groupBy({
    by: ["visitDate"],
    where: { visitDate: { gte: start, lte: today } },
    _count: { _all: true },
  });
  const countByDay = new Map(rows.map((row) => [toIsoDate(row.visitDate), row._count._all]));

  return Array.from({ length: days }, (_, index) => {
    const date = addDays(start, index);
    return { label: label.format(date), visitors: countByDay.get(toIsoDate(date)) ?? 0 };
  });
}

/** The hourly pattern (08.00 - 16.00) of the latest day that has check-ins, so the chart is never empty on a weekend. */
async function visitsPerHourOfLatestDay(): Promise<VisitorTrendPoint[]> {
  const latest = await prisma.visit.aggregate({ _max: { visitDate: true } });
  const counts = new Map<number, number>();

  if (latest._max.visitDate) {
    const visits = await prisma.visit.findMany({
      where: { visitDate: latest._max.visitDate },
      select: { checkInTime: true },
    });
    for (const { checkInTime } of visits) {
      const hour = checkInTime.getUTCHours();
      counts.set(hour, (counts.get(hour) ?? 0) + 1);
    }
  }

  return Array.from({ length: CLOSING_HOUR - OPENING_HOUR + 1 }, (_, index) => {
    const hour = OPENING_HOUR + index;
    return { label: `${String(hour).padStart(2, "0")}.00`, visitors: counts.get(hour) ?? 0 };
  });
}

export async function getVisitorTrend(range: DashboardRange): Promise<VisitorTrendData> {
  const points =
    range === "24h"
      ? await visitsPerHourOfLatestDay()
      : range === "30d"
        ? await visitsPerDay(30, dayMonthLabel)
        : await visitsPerDay(7, weekdayLabel);
  return { range, points };
}

/** Bookings submitted inside the range, counted per status (a status without bookings is 0). */
export async function getBookingStatusCounts(range: DashboardRange): Promise<BookingStatusCounts> {
  const since = new Date(Date.now() - RANGE_MS[range]);
  const rows = await prisma.booking.groupBy({
    by: ["status"],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
  });

  const counts: BookingStatusCounts = { confirmed: 0, pending: 0, completed: 0, rejected: 0 };
  for (const row of rows) counts[row.status] = row._count._all;
  return counts;
}

type BookingRow = Prisma.BookingGetPayload<object>;

function toPendingSummary(booking: BookingRow): PendingBookingSummary {
  return {
    id: booking.id,
    institutionName: booking.institution,
    participantCount: booking.participantCount,
    visitDate: toIsoDate(booking.visitDate),
    createdAt: booking.createdAt.toISOString(),
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const today = dateOnly(todayInMuseumTimezone());
  const yesterday = addDays(today, -1);
  const thirtyDaysAgo = addDays(today, -30);

  const [todayVisitors, yesterdayVisitors, pendingBookings, totalAccounts, newAccounts, totalCollections, recentVisits] =
    await Promise.all([
      prisma.visit.count({ where: { visitDate: today } }),
      prisma.visit.count({ where: { visitDate: yesterday } }),
      prisma.booking.findMany({ where: { status: "pending" }, orderBy: [{ visitDate: "asc" }, { createdAt: "asc" }] }),
      prisma.visitorAccount.count(),
      prisma.visitorAccount.count({ where: { registeredAt: { gte: thirtyDaysAgo } } }),
      prisma.collection.count(),
      prisma.visit.findMany({ where: { visitDate: today }, orderBy: [{ checkInTime: "desc" }, { id: "desc" }], take: 4 }),
    ]);

  const changePercent =
    yesterdayVisitors === 0 ? 0 : Math.round(((todayVisitors - yesterdayVisitors) / yesterdayVisitors) * 100);

  return {
    stats: {
      todayVisitors,
      todayVisitorsChangePercent: changePercent,
      pendingBookings: pendingBookings.length,
      totalAccounts,
      newAccounts,
      totalCollections,
    },
    recentVisitors: recentVisits.map(toVisitor),
    pendingBookings: pendingBookings.map(toPendingSummary),
  };
}
