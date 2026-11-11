export type BookingStatus = "pending" | "confirmed" | "rejected";
export type FilterStatus = "semua" | BookingStatus;

export type Booking = {
  id: string;
  institution: string;
  contact: string;
  date: string;
  participants: number;
  status: BookingStatus;
  email: string;
  phone: string;
  purpose: string;
  notes: string;
};

export const statusLabels: Record<BookingStatus, string> = {
  pending: "Menunggu",
  confirmed: "Dikonfirmasi",
  rejected: "Ditolak",
};
