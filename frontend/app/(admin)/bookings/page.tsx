import type { Metadata } from "next";
import { BookingView } from "./components/BookingView";

export const metadata: Metadata = { title: "Booking Rombongan" };

export default function BookingRombonganPage() {
  return <BookingView />;
}
