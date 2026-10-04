"use client";

import { useEffect, useMemo, useState } from "react";

type BookingStatus = "pending" | "confirmed" | "rejected";
type FilterStatus = "semua" | BookingStatus;

type Booking = {
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

const initialBookings: Booking[] = [
  {
    id: "sdn1",
    institution: "SDN Merjosari 1 Malang",
    contact: "Dewi Saraswati",
    date: "29 Sep 2026",
    participants: 65,
    status: "pending",
    email: "dewi.saraswati@example.com",
    phone: "0812-0000-0001",
    purpose: "Kunjungan edukasi sekolah",
    notes: "Rombongan siswa dan guru pendamping.",
  },
  {
    id: "smpn4",
    institution: "SMPN 4 Malang",
    contact: "Budi Hartono",
    date: "02 Okt 2026",
    participants: 48,
    status: "pending",
    email: "budi.hartono@example.com",
    phone: "0812-0000-0002",
    purpose: "Pembelajaran sejarah di luar kelas",
    notes: "Mohon arahan untuk kunjungan rombongan.",
  },
  {
    id: "tk",
    institution: "TK Tunas Bangsa",
    contact: "Sri Wahyuni",
    date: "05 Okt 2026",
    participants: 20,
    status: "pending",
    email: "sri.wahyuni@example.com",
    phone: "0812-0000-0003",
    purpose: "Wisata edukasi anak usia dini",
    notes: "Termasuk guru dan pendamping.",
  },
  {
    id: "ub",
    institution: "Universitas Brawijaya — Prodi Sejarah",
    contact: "Anisa Rahma",
    date: "25 Sep 2026",
    participants: 30,
    status: "confirmed",
    email: "anisa.rahma@example.com",
    phone: "0812-0000-0004",
    purpose: "Observasi dan studi sejarah",
    notes: "Kunjungan mahasiswa Program Studi Sejarah.",
  },
  {
    id: "sman1",
    institution: "SMAN 1 Batu",
    contact: "Rudi Setiawan",
    date: "20 Sep 2026",
    participants: 55,
    status: "rejected",
    email: "rudi.setiawan@example.com",
    phone: "0812-0000-0005",
    purpose: "Kunjungan rombongan sekolah",
    notes: "Pengajuan kunjungan rombongan.",
  },
];

const statusLabels: Record<BookingStatus, string> = {
  pending: "Menunggu",
  confirmed: "Dikonfirmasi",
  rejected: "Ditolak",
};

export default function BookingRombonganPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("semua");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch("http://localhost:5000/api/bookings");
        const result = await res.json();
        if (result.success) {
          setBookings(result.data);
        }
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
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      if (result.success) {
        setBookings((current) =>
          current.map((booking) => (booking.id === id ? { ...booking, status } : booking))
        );
      }
    } catch (error) {
      console.error("Gagal memperbarui status:", error);
    }
  };

  const counts = {
    semua: bookings.length,
    pending: bookings.filter((booking) => booking.status === "pending").length,
    confirmed: bookings.filter((booking) => booking.status === "confirmed").length,
    rejected: bookings.filter((booking) => booking.status === "rejected").length,
  };

  return (
    <main className="booking-page">
      <section className="panel">
        <div className="toolbar">
          <div className="tabs" role="tablist" aria-label="Filter status booking">
            {(
              [
                ["semua", "Semua"],
                ["pending", "Menunggu"],
                ["confirmed", "Dikonfirmasi"],
                ["rejected", "Ditolak"],
              ] as [FilterStatus, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={filter === value}
                className={`tab ${filter === value ? "active" : ""}`}
                onClick={() => setFilter(value)}
              >
                {label}
                <span className="tab-count">{counts[value]}</span>
              </button>
            ))}
          </div>

          <label className="search-box">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              type="search"
              placeholder="Cari instansi atau penanggung jawab..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Instansi</th>
                <th>Penanggung Jawab</th>
                <th>Tanggal Kunjungan</th>
                <th>Peserta</th>
                <th>Status</th>
                <th className="action-heading">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <div className="institution-cell">
                      <span className="institution-avatar">
                        {booking.institution.slice(0, 1)}
                      </span>
                      <span className="institution-name">{booking.institution}</span>
                    </div>
                  </td>
                  <td>{booking.contact}</td>
                  <td>{booking.date}</td>
                  <td>{booking.participants} orang</td>
                  <td>
                    <span className={`status-badge ${booking.status}`}>
                      <span className="status-dot" />
                      {statusLabels[booking.status]}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      {booking.status === "pending" ? (
                        <>
                          <button
                            type="button"
                            className="action-btn approve"
                            onClick={() => updateStatus(booking.id, "confirmed")}
                          >
                            Setujui
                          </button>
                          <button
                            type="button"
                            className="action-btn reject"
                            onClick={() => updateStatus(booking.id, "rejected")}
                          >
                            Tolak
                          </button>
                        </>
                      ) : null}
                      {booking.status === "pending" ? (
                        // Still waiting: Setujui / Tolak come first, so the detail button stays a compact icon.
                        <button
                          type="button"
                          className="detail-btn"
                          aria-label={`Lihat detail ${booking.institution}`}
                          title="Lihat detail"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 11v5M12 8h.01" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="action-btn neutral"
                          aria-label={`Lihat detail ${booking.institution}`}
                          onClick={() => setSelectedBooking(booking)}
                        >
                          Lihat Detail
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    <span className="empty-icon">⌕</span>
                    <strong>Data booking tidak ditemukan</strong>
                    <span>Coba gunakan kata kunci atau filter status lain.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          Menampilkan <strong>{filteredBookings.length}</strong> dari{" "}
          <strong>{bookings.length}</strong> pengajuan
        </div>
      </section>

      {selectedBooking && (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedBooking(null);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-detail-title"
          >
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">Informasi pengajuan</span>
                <h2 id="booking-detail-title">Detail Booking</h2>
              </div>
              <button
                type="button"
                className="close-btn"
                aria-label="Tutup detail"
                onClick={() => setSelectedBooking(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-institution">
                <span className="institution-avatar large">
                  {selectedBooking.institution.slice(0, 1)}
                </span>
                <div>
                  <strong>{selectedBooking.institution}</strong>
                  <span>Pengajuan booking rombongan</span>
                </div>
              </div>
              <div className="detail-list">
                <div><span>Penanggung jawab</span><strong>{selectedBooking.contact}</strong></div>
                <div><span>Tanggal kunjungan</span><strong>{selectedBooking.date}</strong></div>
                <div><span>Jumlah peserta</span><strong>{selectedBooking.participants} orang</strong></div>
                <div><span>Email</span><strong>{selectedBooking.email}</strong></div>
                <div><span>No. telepon</span><strong>{selectedBooking.phone}</strong></div>
                <div><span>Tujuan kunjungan</span><strong>{selectedBooking.purpose}</strong></div>
                <div><span>Catatan</span><strong>{selectedBooking.notes}</strong></div>
                <div>
                  <span>Status</span>
                  <strong><span className={`status-badge ${selectedBooking.status}`}>{statusLabels[selectedBooking.status]}</span></strong>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedBooking.status === "pending" && (
                <>
                  <button
                    type="button"
                    className="action-btn reject"
                    onClick={() => {
                      updateStatus(selectedBooking.id, "rejected");
                      setSelectedBooking({ ...selectedBooking, status: "rejected" });
                    }}
                  >
                    Tolak Pengajuan
                  </button>
                  <button
                    type="button"
                    className="action-btn approve"
                    onClick={() => {
                      updateStatus(selectedBooking.id, "confirmed");
                      setSelectedBooking({ ...selectedBooking, status: "confirmed" });
                    }}
                  >
                    Setujui Pengajuan
                  </button>
                </>
              )}
              <button
                type="button"
                className="action-btn neutral"
                onClick={() => setSelectedBooking(null)}
              >
                Tutup
              </button>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .booking-page {
          min-width: 0;
          color: #241a0f;
          font-family: var(--font-karla, Arial, sans-serif);
        }
        .status-dot {
          width: 7px;
          height: 7px;
          flex: 0 0 auto;
          border-radius: 50%;
          background: currentColor;
        }
        .panel {
          overflow: hidden;
          border: 1px solid #e6e2d8;
          border-radius: 12px;
          background: #fff;
        }
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 20px;
          border-bottom: 1px solid #e6e2d8;
        }
        .tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .tab {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 11px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #7a7368;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }
        .tab.active {
          background: #1f1f1f;
          color: #fff;
        }
        .tab-count {
          display: inline-flex;
          min-width: 18px;
          height: 18px;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border-radius: 20px;
          background: rgba(122, 115, 104, .12);
          font-size: 10px;
        }
        .tab.active .tab-count { background: rgba(255,255,255,.18); }
        .search-box {
          display: flex;
          width: min(310px, 36%);
          min-width: 190px;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border: 1px solid #e6e2d8;
          border-radius: 8px;
          background: #f7f5f0;
        }
        .search-box svg {
          width: 16px;
          height: 16px;
          flex: 0 0 auto;
          fill: none;
          stroke: #7a7368;
          stroke-width: 1.7;
        }
        .search-box input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #241a0f;
          font: inherit;
          font-size: 12px;
        }
        .table-wrap { width: 100%; overflow-x: auto; }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        thead { background: #f7f5f0; }
        th {
          padding: 13px 17px;
          border-bottom: 1px solid #e6e2d8;
          color: #7a7368;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .04em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        td {
          padding: 14px 17px;
          border-bottom: 1px solid #eeeae2;
          color: #443b30;
          font-size: 12px;
          vertical-align: middle;
          white-space: nowrap;
        }
        tbody tr:last-child td { border-bottom: 0; }
        tbody tr:hover { background: #fcfbf8; }
        .institution-cell {
          display: flex;
          min-width: 190px;
          align-items: center;
          gap: 9px;
        }
        .institution-avatar {
          display: inline-flex;
          width: 30px;
          height: 30px;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          border: 1px solid #e6e2d8;
          border-radius: 50%;
          background: #f7f5f0;
          color: #7a7368;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .institution-avatar.large { width: 42px; height: 42px; font-size: 15px; }
        .institution-name { color: #241a0f; font-weight: 700; }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 9px;
          border: 1px solid transparent;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }
        .status-badge.pending { border-color: #e9d9a8; background: #fbf3dc; color: #8a6a1e; }
        .status-badge.confirmed { border-color: #c9e4d3; background: #e7f3ec; color: #2f7d4f; }
        .status-badge.rejected { border-color: #f1cfcd; background: #fbeae9; color: #b3261e; }
        .actions { display: flex; align-items: center; gap: 6px; }
        .action-btn, .detail-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          font-weight: 700;
          transition: background .15s ease;
        }
        .action-btn { min-height: 30px; padding: 0 10px; white-space: nowrap; }
        .approve { border: 1px solid #c9e4d3; background: #e7f3ec; color: #2f7d4f; }
        .approve:hover { background: #d8ecdf; }
        .reject { border: 1px solid #f1cfcd; background: #fbeae9; color: #b3261e; }
        .reject:hover { background: #f7dedd; }
        .neutral { border: 1px solid #e6e2d8; background: #fff; color: #443b30; }
        .neutral:hover { background: #f7f5f0; }
        .detail-btn {
          width: 30px;
          height: 30px;
          border: 1px solid #e6e2d8;
          background: #fff;
          color: #7a7368;
        }
        .detail-btn:hover { border-color: #d4af37; color: #241a0f; }
        .detail-btn svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.6; }
        .empty-state {
          padding: 45px 16px;
          color: #7a7368;
          text-align: center;
          white-space: normal;
        }
        .empty-state strong, .empty-state span { display: block; }
        .empty-state strong { margin: 7px 0 3px; color: #241a0f; font-size: 13px; }
        .empty-icon { font-size: 23px; }
        .table-footer {
          padding: 12px 18px;
          border-top: 1px solid #e6e2d8;
          color: #7a7368;
          font-size: 11px;
        }
        .table-footer strong { color: #241a0f; }
        .modal-overlay {
          position: fixed;
          z-index: 1000;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(31, 26, 15, .45);
        }
        .modal {
          width: 100%;
          max-width: 520px;
          max-height: min(88vh, 760px);
          overflow-y: auto;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 24px 70px rgba(0,0,0,.22);
        }
        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 22px;
          border-bottom: 1px solid #e6e2d8;
        }
        .modal-eyebrow {
          color: #8a6a1e;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .modal-header h2 {
          margin: 4px 0 0;
          color: #241a0f;
          font-family: var(--font-fraunces, Georgia, serif);
          font-size: 19px;
        }
        .close-btn {
          width: 30px;
          height: 30px;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: #7a7368;
          cursor: pointer;
          font-size: 23px;
          line-height: 1;
        }
        .close-btn:hover { background: #f7f5f0; }
        .modal-body { padding: 20px 22px; }
        .detail-institution {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 15px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eeeae2;
        }
        .detail-institution strong, .detail-institution span { display: block; }
        .detail-institution strong { color: #241a0f; font-size: 13px; }
        .detail-institution div span { margin-top: 3px; color: #7a7368; font-size: 11px; }
        .detail-list > div {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 10px 0;
          border-bottom: 1px dashed #e6e2d8;
          font-size: 12px;
        }
        .detail-list > div:last-child { border-bottom: 0; }
        .detail-list > div > span { color: #7a7368; }
        .detail-list > div > strong { max-width: 62%; color: #241a0f; text-align: right; font-weight: 700; }
        .modal-footer {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 8px;
          padding: 15px 22px 20px;
          border-top: 1px solid #e6e2d8;
        }
        @media (max-width: 900px) {
          .toolbar { align-items: stretch; flex-direction: column; }
          .search-box { width: 100%; }
        }
        @media (max-width: 600px) {
          .tabs { gap: 3px; }
          .tab { padding: 7px 8px; font-size: 11px; }
          th, td { padding: 12px 13px; }
          .modal-footer { justify-content: stretch; }
          .modal-footer .action-btn { flex: 1; }
          .detail-list > div { gap: 10px; }
        }
      `}</style>
    </main>
  );
}