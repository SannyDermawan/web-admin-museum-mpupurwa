import { Router } from "express";
import { getTodayVisitors } from "../controllers/visitors.controller";

export const visitorsRoutes = Router();

visitorsRoutes.get("/today", getTodayVisitors);
