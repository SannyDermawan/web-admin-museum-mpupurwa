import { Router } from "express";
import { getCheckinQr, getTodayVisitors } from "../controllers/visitors.controller";

export const visitorsRoutes = Router();

visitorsRoutes.get("/today", getTodayVisitors);
visitorsRoutes.get("/checkin-qr", getCheckinQr);
