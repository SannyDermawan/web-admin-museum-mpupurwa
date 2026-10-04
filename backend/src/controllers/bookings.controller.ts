import { Request, Response } from "express";
import { bookingsData } from "../data/bookings";

export const getBookings = (req: Request, res: Response) => {
  res.json({ success: true, data: bookingsData });
};

export const updateBookingStatus = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const booking = bookingsData.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking tidak ditemukan" });
  }

  booking.status = status;
  res.json({ success: true, data: booking });
};