export type BookingStatus = "pending" | "confirmed" | "completed" | "rejected";
export type FilterStatus = "semua" | BookingStatus;

export type Booking = {
  id: string;
  institution: string;
  contact: string;
  date: string;
  participants: number;
  status: BookingStatus;
  email: string | null;
  phone: string;
  purpose: string | null;
  notes: string | null;
};

export const statusLabels: Record<BookingStatus, string> = {
  pending: "Menunggu",
  confirmed: "Dikonfirmasi",
  completed: "Selesai",
  rejected: "Ditolak",
};