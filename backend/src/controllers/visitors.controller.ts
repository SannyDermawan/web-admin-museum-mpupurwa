import type { Request, Response } from "express";
import { getTodayVisitors as findTodayVisitors } from "../data/visitors";
import { ok } from "../utils/response";

// GET /api/visitors/today?q=malang   (q is optional)
export function getTodayVisitors(req: Request, res: Response) {
  const query = typeof req.query.q === "string" ? req.query.q : undefined;
  return ok(res, findTodayVisitors(query));
}
