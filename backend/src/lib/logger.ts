// One logger for the whole backend (pino). Logs are JSON in production and readable text in development.
// Secrets never reach the log: cookies, authorization headers and password fields are redacted.

import pino from "pino";
import { config } from "../config";

/** Paths (in a log object) whose value is replaced with [REDACTED]. */
export const REDACT_PATHS = [
  "req.headers.cookie",
  "req.headers.authorization",
  'res.headers["set-cookie"]',
  "password",
  "*.password",
  "temporaryPassword",
  "*.temporaryPassword",
  "passwordHash",
  "*.passwordHash",
  "token",
  "*.token",
];

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (config.isProduction ? "info" : "debug"),
  redact: { paths: REDACT_PATHS, censor: "[REDACTED]" },
  ...(config.isProduction
    ? {}
    : { transport: { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" } } }),
});

/** "dewi@mpupurwa.id" -> "d***@mpupurwa.id": enough to spot an attack, not enough to leak an address. */
export function maskEmail(email: string): string {
  const [name = "", domain = ""] = email.split("@");
  return `${name.slice(0, 1)}***@${domain}`;
}
