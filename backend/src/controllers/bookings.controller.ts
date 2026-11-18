import type { NextFunction, Request, Response } from "express";
import { bodyAsRecord, isOneOf, readText } from "../lib/validate";
import { BOOKING_STATUSES, changeBookingStatus, listBookings } from "../services/bookings.service";
import { fail, ok } from "../utils/response";

function isPrismaNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === "P2025";
}

export async function getBookings(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await listBookings();
    return ok(res, data);
  } catch (error) {
    return next(error);
  }
}

export async function updateBookingStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = readText(req.params.id);
    const body = bodyAsRecord(req.body);
    const status = body.status;

    if (!isOneOf(status, BOOKING_STATUSES)) {
      return fail(res, 400, "Status tidak valid. Gunakan pending, confirmed, completed, atau rejected.");
    }

    const updated = await changeBookingStatus(id, status);
    return ok(res, updated, { message: "Status booking berhasil diperbarui." });
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return fail(res, 404, "Booking tidak ditemukan.");
    }
    return next(error);
  }
}