import type { Request, Response } from "express";
import { checkinQrPayload } from "../lib/checkinQr";
import { todayInMuseumTimezone } from "../services/dates";
import { getTodayVisitors as findTodayVisitors } from "../services/visitors.service";
import { ok } from "../utils/response";

// GET /api/visitors/today?q=malang   (q is optional)
export async function getTodayVisitors(req: Request, res: Response) {
  const query = typeof req.query.q === "string" ? req.query.q : undefined;
  return ok(res, await findTodayVisitors(query));
}

// GET /api/visitors/checkin-qr   the QR content for today. The admin page turns it into an image to print or show
// at the entrance; it changes every day, so yesterday's QR cannot be reused.
export function getCheckinQr(_req: Request, res: Response) {
  const date = todayInMuseumTimezone();
  return ok(res, { date, payload: checkinQrPayload(date) });
}
