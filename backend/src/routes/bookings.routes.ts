import { Router } from "express";
import { getBookings, updateBookingStatus } from "../controllers/bookings.controller";

const router = Router();

router.get("/", getBookings);
router.patch("/:id/status", updateBookingStatus);

export default router;