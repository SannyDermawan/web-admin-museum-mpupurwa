// Rute publik untuk aplikasi mobile. Tanpa login, jadi HANYA baca koleksi dan kirim booking/check-in.
// Ubah/hapus data tidak tersedia di sini.

import cors from "cors";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createPublicBooking,
  createPublicVisit,
  getPublicCollection,
  listPublicBookings,
  listPublicCollections,
} from "../controllers/public.controller";
import { getSimilarPublicCollections } from "../controllers/publicSimilar.controller";
import { login, me, register, verifyOtp } from "../controllers/visitorAuth.controller";
import { visitorAuthLimiter, visitorVerifyLimiter } from "../middleware/rateLimiter";
import { optionalVisitor, requireVisitor } from "../middleware/requireVisitor";
import { fail } from "../utils/response";

export const publicRoutes = Router();

// Aplikasi native tidak terkena CORS, tetapi Flutter Web (untuk uji coba) iya. Data di sini memang publik.
publicRoutes.use(cors({ origin: "*", methods: ["GET", "POST"] }));

// Pembatas untuk endpoint yang menulis data, supaya tidak dibanjiri.
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => fail(res, 429, "Terlalu banyak permintaan. Coba lagi beberapa saat lagi."),
});

publicRoutes.get("/collections", listPublicCollections);
publicRoutes.get("/collections/:id", getPublicCollection);
publicRoutes.get("/collections/:id/similar", getSimilarPublicCollections);
publicRoutes.post("/bookings", writeLimiter, createPublicBooking);
publicRoutes.get("/bookings", listPublicBookings);
publicRoutes.post("/visits", writeLimiter, optionalVisitor, createPublicVisit);

// Pendaftaran dan login pengunjung (OTP lewat email). Token dikirim sebagai `Authorization: Bearer <token>`.
publicRoutes.post("/auth/register", visitorAuthLimiter, register);
publicRoutes.post("/auth/login", visitorAuthLimiter, login);
publicRoutes.post("/auth/verify-otp", visitorVerifyLimiter, verifyOtp);
publicRoutes.get("/auth/me", requireVisitor, me);