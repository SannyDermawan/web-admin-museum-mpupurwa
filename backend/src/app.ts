// Builds the Express app: JSON parser, CORS, and the routers. server.ts only starts it.

// Pulls in the `req.user` type. Nothing imports express.d.ts, and Vercel only type-checks the files reachable from
// this one (it ignores tsconfig "include"), so without this line the Vercel build fails with TS2339 on req.user.
/// <reference path="./types/express.d.ts" />

import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config";
import { requestLogger } from "./middleware/requestLogger";
import { requireAuth } from "./middleware/authMiddleware";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requireRole } from "./middleware/requireRole";
import { accountsRoutes } from "./routes/accounts.routes";
import { authRoutes } from "./routes/authRoutes";
import bookingsRoutes from "./routes/bookings.routes";
import { dashboardRoutes } from "./routes/dashboard.routes";
import { publicRoutes } from "./routes/public.routes";
import { uploadsRoutes } from "./routes/uploads.routes";
import { visitorsRoutes } from "./routes/visitors.routes";
import { collectionsRoutes } from "./routes/collections.routes";

export const app = express();

app.disable("x-powered-by");
// Behind a proxy (Vercel), trust the first hop so req.secure, req.ip and the rate limiter see the real request.
app.set("trust proxy", 1);
// Log first, so every request (even a rejected one) gets an id and one log line.
app.use(requestLogger);
// Security headers: nosniff, no framing, HSTS (HTTPS only), no referrer leakage, and so on.
app.use(helmet());
// Public API for the mobile app (collections, booking, check-in). Mounted BEFORE the CORS rule below because
// it brings its own open CORS and JSON parser; the admin-only CORS must not answer its preflight requests.
app.use("/api/public", express.json({ limit: "100kb" }), publicRoutes);
// Only the frontend may call this API from a browser. `credentials` lets the login cookie travel with it.
app.use(cors({ origin: config.frontendUrl, credentials: true }));
// A small limit: no endpoint needs a big JSON body (files go through /api/uploads as multipart).
app.use(express.json({ limit: "100kb" }));

// Public: login, logout, forgot password (and /me, which checks the login itself).
app.use("/api/auth", authRoutes);

// Protected: need a valid login cookie. Add new modules here.
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use("/api/visitors", requireAuth, visitorsRoutes);
app.use("/api/bookings", requireAuth, bookingsRoutes);
app.use("/api/collections", requireAuth, collectionsRoutes);
app.use("/api/uploads", requireAuth, uploadsRoutes);

// Accounts: every admin may see visitor accounts, but only a super admin may manage admin accounts.
app.use("/api/accounts", requireAuth);
app.use("/api/accounts/admins", requireRole("super_admin"));
app.use("/api/accounts", accountsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// Vercel runs the app from this default export (no app.listen there). Locally, server.ts calls app.listen.
export default app;
