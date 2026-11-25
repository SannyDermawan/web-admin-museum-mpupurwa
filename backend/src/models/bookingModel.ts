// Model tabel `bookings` (booking kunjungan rombongan).

import type { BookingStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/db";

export type BookingRecord = Prisma.BookingGetPayload<object>;

export const listAllBookings = () => prisma.booking.findMany({ orderBy: { createdAt: "desc" } });

export const updateBookingStatus = (id: string, status: BookingStatus) =>
  prisma.booking.update({ where: { id }, data: { status } });

export const groupBookingsByStatusSince = (since: Date) =>
  prisma.booking.groupBy({ by: ["status"], where: { createdAt: { gte: since } }, _count: { _all: true } });

export const listPendingBookings = () =>
  prisma.booking.findMany({ where: { status: "pending" }, orderBy: [{ visitDate: "asc" }, { createdAt: "asc" }] });

export const insertBooking = (data: Prisma.BookingCreateInput) => prisma.booking.create({ data });

export const listBookingsByIds = (ids: string[]) =>
  prisma.booking.findMany({ where: { id: { in: ids } }, orderBy: { createdAt: "desc" } });
