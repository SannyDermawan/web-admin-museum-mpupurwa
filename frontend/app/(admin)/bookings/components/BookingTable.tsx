import { statusLabels } from "./types";
import type { Booking, BookingStatus } from "./types";

type BookingTableProps = {
  bookings: Booking[];
  totalCount: number;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  onSelect: (booking: Booking) => void;
};

/** Section: the table of booking requests plus the "Menampilkan x dari y" footer. */
export function BookingTable({ bookings, totalCount, onUpdateStatus, onSelect }: BookingTableProps) {
  return (
    <>
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
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>
                  <div className="institution-cell">
                    <span className="institution-avatar">{booking.institution.slice(0, 1)}</span>
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
                        <button type="button" className="action-btn approve" onClick={() => onUpdateStatus(booking.id, "confirmed")}>
                          Setujui
                        </button>
                        <button type="button" className="action-btn reject" onClick={() => onUpdateStatus(booking.id, "rejected")}>
                          Tolak
                        </button>
                        {/* Still waiting: Setujui / Tolak come first, so the detail button stays a compact icon. */}
                        <button
                          type="button"
                          className="detail-btn"
                          aria-label={`Lihat detail ${booking.institution}`}
                          title="Lihat detail"
                          onClick={() => onSelect(booking)}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 11v5M12 8h.01" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="action-btn neutral"
                        aria-label={`Lihat detail ${booking.institution}`}
                        onClick={() => onSelect(booking)}
                      >
                        Lihat Detail
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
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
        Menampilkan <strong>{bookings.length}</strong> dari <strong>{totalCount}</strong> pengajuan
      </div>
    </>
  );
}
