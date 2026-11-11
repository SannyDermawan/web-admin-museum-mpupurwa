"use client";

import { useEffect, useMemo, useState } from "react";
import "./booking.css";
import { BookingDetailModal } from "./BookingDetailModal";
import { BookingTable } from "./BookingTable";
import { BookingToolbar } from "./BookingToolbar";
import type { Booking, BookingStatus, FilterStatus } from "./types";
import { apiGet, apiPatch } from "@/lib/api";

/** Holds the bookings, filter and search text; each section of the page is a separate file in this folder. */
export function BookingView() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("semua");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        // apiGet sends the login cookie and uses NEXT_PUBLIC_API_URL (see lib/api.ts).
        const result = await apiGet<Booking[]>("/api/bookings");
        setBookings(result.data);
      } catch (error) {
        console.error("Gagal mengambil data booking:", error);
      }
    }
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus = filter === "semua" || booking.status === filter;
      const matchesSearch =
        !keyword ||
        booking.institution.toLowerCase().includes(keyword) ||
        booking.contact.toLowerCase().includes(keyword) ||
        booking.date.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, filter, search]);

  const updateStatus = async (id: string, status: BookingStatus) => {
    try {
      await apiPatch(`/api/bookings/${id}/status`, { status });
      setBookings((current) => current.map((booking) => (booking.id === id ? { ...booking, status } : booking)));
    } catch (error) {
      console.error("Gagal memperbarui status:", error);
    }
  };

  const counts: Record<FilterStatus, number> = {
    semua: bookings.length,
    pending: bookings.filter((booking) => booking.status === "pending").length,
    confirmed: bookings.filter((booking) => booking.status === "confirmed").length,
    rejected: bookings.filter((booking) => booking.status === "rejected").length,
  };

  return (
    <main className="booking-page">
      <section className="panel">
        <BookingToolbar
          filter={filter}
          onFilterChange={setFilter}
          counts={counts}
          search={search}
          onSearchChange={setSearch}
        />
        <BookingTable
          bookings={filteredBookings}
          totalCount={bookings.length}
          onUpdateStatus={updateStatus}
          onSelect={setSelectedBooking}
        />
      </section>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onApprove={() => {
            updateStatus(selectedBooking.id, "confirmed");
            setSelectedBooking({ ...selectedBooking, status: "confirmed" });
          }}
          onReject={() => {
            updateStatus(selectedBooking.id, "rejected");
            setSelectedBooking({ ...selectedBooking, status: "rejected" });
          }}
        />
      )}
    </main>
  );
}
