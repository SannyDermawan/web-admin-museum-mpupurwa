// Logs every request once, when it finishes: method, path, status and duration, with a request id.
// The id is also sent back as the X-Request-Id header, so a user's error report can be matched to the log line.

import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";
import pinoHttp from "pino-http";
import { logger } from "../lib/logger";

const SAFE_ID = /^[A-Za-z0-9-]{8,64}$/;

export const requestLogger = pinoHttp({
  logger,
  // Reuse the caller's id only when it looks harmless (no log injection); otherwise make a new one.
  genReqId: (req: IncomingMessage, res) => {
    const incoming = req.headers["x-request-id"];
    const id = typeof incoming === "string" && SAFE_ID.test(incoming) ? incoming : randomUUID();
    res.setHeader("X-Request-Id", id);
    return id;
  },
  // 5xx = error, 4xx (401, 403, 429, ...) = warn so security events stand out, everything else = info.
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  // Keep log lines small: no headers, no query string values, only what helps to investigate.
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: String(req.url).split("?")[0], ip: req.remoteAddress }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});
