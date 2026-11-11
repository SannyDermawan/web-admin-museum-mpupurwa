// Builds the Express app: JSON parser, CORS, and the routers. server.ts only starts it.

import cors from "cors";
import express from "express";
import { config } from "./config";
import { requireAuth } from "./middleware/authMiddleware";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requireRole } from "./middleware/requireRole";
import { accountsRoutes } from "./routes/accounts.routes";
import { authRoutes } from "./routes/authRoutes";
import bookingsRoutes from "./routes/bookings.routes";
import { dashboardRoutes } from "./routes/dashboard.routes";
import { uploadsRoutes } from "./routes/uploads.routes";
import { visitorsRoutes } from "./routes/visitors.routes";

export const app = express();

app.disable("x-powered-by");
// Only the frontend may call this API from a browser. `credentials` lets the login cookie travel with it.
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());

// Public: login, logout, forgot password (and /me, which checks the login itself).
app.use("/api/auth", authRoutes);

// Protected: need a valid login cookie. Add new modules here.
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use("/api/visitors", requireAuth, visitorsRoutes);
app.use("/api/bookings", requireAuth, bookingsRoutes);
app.use("/api/uploads", requireAuth, uploadsRoutes);

// Accounts: every admin may see visitor accounts, but only a super admin may manage admin accounts.
app.use("/api/accounts", requireAuth);
app.use("/api/accounts/admins", requireRole("super_admin"));
app.use("/api/accounts", accountsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
