import { Router } from "express";
import { forgotPassword, login, logout, me } from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";
import { forgotPasswordLimiter, loginLimiter } from "../middleware/rateLimiter";

export const authRoutes = Router();

authRoutes.post("/login", loginLimiter, login);
authRoutes.post("/logout", logout);
authRoutes.get("/me", requireAuth, me);
authRoutes.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
