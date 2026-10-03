import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller";

export const dashboardRoutes = Router();

dashboardRoutes.get("/", getDashboard);
