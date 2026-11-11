import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../types";
import { fail } from "../utils/response";

/** Use after authMiddleware. Answers 403 when the logged-in admin's role is not allowed. */
export function requireRole(...allowed: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return fail(res, 401, "Silakan masuk terlebih dahulu.");
    if (!allowed.includes(req.user.role)) return fail(res, 403, "Kamu tidak punya izin untuk tindakan ini.");
    next();
  };
}
