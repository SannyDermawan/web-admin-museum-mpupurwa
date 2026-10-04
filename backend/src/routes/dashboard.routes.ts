import { Router } from "express";
import { getBookingStatusChart, getDashboard, getVisitorTrendChart } from "../controllers/dashboard.controller";

export const dashboardRoutes = Router();

dashboardRoutes.get("/", getDashboard);
dashboardRoutes.get("/visitor-trend", getVisitorTrendChart);
dashboardRoutes.get("/booking-status", getBookingStatusChart);
