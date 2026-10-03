import type { Request, Response } from "express";
import { getDashboardData } from "../data/dashboard";
import { ok } from "../utils/response";

// GET /api/dashboard
export function getDashboard(_req: Request, res: Response) {
  return ok(res, getDashboardData());
}
