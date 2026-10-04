import { Request, Response } from "express";
import { BOOKING_STATUSES, BookingStatus, bookingsData } from "../data/bookings";

export const getBookings = (req: Request, res: Response) => {
  res.json({ success: true, data: bookingsData });
};

export const updateBookingStatus = (req: Request, res: Response) => {
  const { id } = req.params;
  const status = req.body?.status;

  if (!BOOKING_STATUSES.includes(status as BookingStatus)) {
    return res.status(400).json({
      success: false,
      message: "Status tidak valid. Gunakan pending, confirmed, completed, atau rejected.",
    });
  }

  const booking = bookingsData.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking tidak ditemukan" });
  }

  booking.status = status;
  res.json({ success: true, data: booking });
};