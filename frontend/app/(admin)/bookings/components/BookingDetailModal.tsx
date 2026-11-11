import { statusLabels } from "./types";
import type { Booking } from "./types";

type BookingDetailModalProps = {
  booking: Booking;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
};

/** Popup: full detail of one booking, with approve / reject buttons while it is still pending. */
export function BookingDetailModal({ booking, onClose, onApprove, onReject }: BookingDetailModalProps) {
  return (
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="booking-detail-title">
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">Informasi pengajuan</span>
            <h2 id="booking-detail-title">Detail Booking</h2>
          </div>
          <button type="button" className="close-btn" aria-label="Tutup detail" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-institution">
            <span className="institution-avatar large">{booking.institution.slice(0, 1)}</span>
            <div>
              <strong>{booking.institution}</strong>
              <span>Pengajuan booking rombongan</span>
            </div>
          </div>
          <div className="detail-list">
            <div><span>Penanggung jawab</span><strong>{booking.contact}</strong></div>
            <div><span>Tanggal kunjungan</span><strong>{booking.date}</strong></div>
            <div><span>Jumlah peserta</span><strong>{booking.participants} orang</strong></div>
            <div><span>Email</span><strong>{booking.email}</strong></div>
            <div><span>No. telepon</span><strong>{booking.phone}</strong></div>
            <div><span>Tujuan kunjungan</span><strong>{booking.purpose}</strong></div>
            <div><span>Catatan</span><strong>{booking.notes}</strong></div>
            <div>
              <span>Status</span>
              <strong><span className={`status-badge ${booking.status}`}>{statusLabels[booking.status]}</span></strong>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          {booking.status === "pending" && (
            <>
              <button type="button" className="action-btn reject" onClick={onReject}>
                Tolak Pengajuan
              </button>
              <button type="button" className="action-btn approve" onClick={onApprove}>
                Setujui Pengajuan
              </button>
            </>
          )}
          <button type="button" className="action-btn neutral" onClick={onClose}>
            Tutup
          </button>
        </div>
      </section>
    </div>
  );
}
