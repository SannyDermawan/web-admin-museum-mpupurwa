import type { Request, Response } from "express";
import { DASHBOARD_RANGES, getBookingStatusCounts, getDashboardData, getVisitorTrend } from "../services/dashboard.service";
import type { DashboardRange } from "../types";
import { fail, ok } from "../utils/response";

const INVALID_RANGE = "Rentang waktu tidak valid. Gunakan 24h, 7d, atau 30d.";

/** ?range= (optional, default 7d). Returns null when the value is not one of the allowed ranges. */
function readRange(req: Request): DashboardRange | null {
  const range = typeof req.query.range === "string" ? req.query.range : "7d";
  return DASHBOARD_RANGES.includes(range as DashboardRange) ? (range as DashboardRange) : null;
}

// GET /api/dashboard
export async function getDashboard(_req: Request, res: Response) {
  return ok(res, await getDashboardData());
}

// GET /api/dashboard/visitor-trend?range=24h|7d|30d
export async function getVisitorTrendChart(req: Request, res: Response) {
  const range = readRange(req);
  if (!range) return fail(res, 400, INVALID_RANGE);
  return ok(res, await getVisitorTrend(range));
}

// GET /api/dashboard/booking-status?range=24h|7d|30d
export async function getBookingStatusChart(req: Request, res: Response) {
  const range = readRange(req);
  if (!range) return fail(res, 400, INVALID_RANGE);
  return ok(res, { range, counts: await getBookingStatusCounts(range) });
}
