import { Router } from "express";
import { forgotPassword, login, logout } from "../controllers/auth.controller";

export const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/forgot-password", forgotPassword);
