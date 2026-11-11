import type { Request, Response } from "express";
import { getTodayVisitors as findTodayVisitors } from "../services/visitors.service";
import { ok } from "../utils/response";

// GET /api/visitors/today?q=malang   (q is optional)
export async function getTodayVisitors(req: Request, res: Response) {
  const query = typeof req.query.q === "string" ? req.query.q : undefined;
  return ok(res, await findTodayVisitors(query));
}
