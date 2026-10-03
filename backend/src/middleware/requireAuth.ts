import type { NextFunction, Request, Response } from "express";
import { findAdminById } from "../data/auth";
import { fail } from "../utils/response";
import { SESSION_COOKIE, readCookie, verifySessionToken } from "../utils/session";

/** Put in front of any route that needs a logged-in admin. Answers 401 otherwise. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const payload = verifySessionToken(readCookie(req, SESSION_COOKIE));
  const user = payload ? findAdminById(payload.sub) : null;
  if (!user) return fail(res, 401, "Silakan masuk terlebih dahulu.");

  res.locals.user = user;
  next();
}
