// Limits repeated attempts on sensitive endpoints. This is an extra layer, not a replacement for validation.

import rateLimit from "express-rate-limit";
import { fail } from "../utils/response";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

/** Failed logins only: a correct login does not count towards the limit. */
export const loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => {
    req.log.warn({ event: "rate_limited", endpoint: "login" }, "Too many login attempts");
    return fail(res, 429, "Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.");
  },
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => {
    req.log.warn({ event: "rate_limited", endpoint: "forgot-password" }, "Too many reset requests");
    return fail(res, 429, "Terlalu banyak permintaan. Coba lagi dalam 15 menit.");
  },
});
