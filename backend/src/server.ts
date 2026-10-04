import cors from "cors";
import express from "express";
import { config } from "./config";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requireAuth } from "./middleware/requireAuth";
import { accountsRoutes } from "./routes/accounts.routes";
import { authRoutes } from "./routes/auth.routes";
import { dashboardRoutes } from "./routes/dashboard.routes";
import { visitorsRoutes } from "./routes/visitors.routes";
import bookingsRoutes from "./routes/bookings.routes";

const app = express();

app.disable("x-powered-by");
// Only the frontend may call this API from a browser. `credentials` lets the login cookie travel with it.
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());

// Public: login, logout, forgot password.
app.use("/api/auth", authRoutes);

// Protected: need a valid login cookie. Add new modules here.
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use("/api/visitors", requireAuth, visitorsRoutes);
app.use("/api/accounts", requireAuth, accountsRoutes);
app.use("/api/bookings", requireAuth, bookingsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port} (${config.nodeEnv})`);
  console.log(`Allowing requests from ${config.frontendUrl}`);
});
