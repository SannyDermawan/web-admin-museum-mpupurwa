import type { Request, Response } from "express";
import { getBookingStatusCounts } from "../data/bookings";
import { DASHBOARD_RANGES, getDashboardData, getVisitorTrend } from "../data/dashboard";
import type { DashboardRange } from "../types";
import { fail, ok } from "../utils/response";

const INVALID_RANGE = "Rentang waktu tidak valid. Gunakan 24h, 7d, atau 30d.";

/** ?range= (optional, default 7d). Returns null when the value is not one of the allowed ranges. */
function readRange(req: Request): DashboardRange | null {
  const range = typeof req.query.range === "string" ? req.query.range : "7d";
  return DASHBOARD_RANGES.includes(range as DashboardRange) ? (range as DashboardRange) : null;
}

// GET /api/dashboard
export function getDashboard(_req: Request, res: Response) {
  return ok(res, getDashboardData());
}

// GET /api/dashboard/visitor-trend?range=24h|7d|30d
export function getVisitorTrendChart(req: Request, res: Response) {
  const range = readRange(req);
  if (!range) return fail(res, 400, INVALID_RANGE);
  return ok(res, getVisitorTrend(range));
}

// GET /api/dashboard/booking-status?range=24h|7d|30d
export function getBookingStatusChart(req: Request, res: Response) {
  const range = readRange(req);
  if (!range) return fail(res, 400, INVALID_RANGE);
  return ok(res, { range, counts: getBookingStatusCounts(range) });
}
