"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { useApiData } from "@/hooks/use-api-data";
import type { CheckinQrData } from "@/types";

/**
 * Panel: the QR code that visitors scan at the entrance to check in. The backend signs it and it is only valid
 * today (see backend/src/lib/checkinQr.ts), so it changes every day: open this page, then show or print it.
 */
export function CheckinQrCard() {
  const { data, error, loading, reload } = useApiData<CheckinQrData>("/api/visitors/checkin-qr");
  const [image, setImage] = useState<{ payload: string; url: string } | null>(null);

  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    // Drawn in the browser: the QR content never leaves this page.
    QRCode.toDataURL(data.payload, { width: 480, margin: 2, errorCorrectionLevel: "M" })
      .then((url) => {
        if (!cancelled) setImage({ payload: data.payload, url });
      })
      .catch(() => {
        if (!cancelled) setImage(null);
      });
    return () => {
      cancelled = true;
    };
  }, [data]);

  const ready = data && image?.payload === data.payload ? image.url : null;

  return (
    <Card>
      <CardHeader
        title="QR check-in hari ini"
        subtitle="Tampilkan atau cetak di pintu masuk. QR berganti setiap hari, jadi QR kemarin tidak bisa dipakai."
        action={
          ready && data ? (
            <a
              href={ready}
              download={`qr-checkin-${data.date}.png`}
              className="inline-flex shrink-0 items-center rounded-lg border border-stone-line px-3.5 py-2 text-[13px] font-bold text-ink hover:bg-row-hover"
            >
              Unduh PNG
            </a>
          ) : undefined
        }
      />
      <div className="flex flex-wrap items-center gap-6 px-[22px] py-5">
        {error ? (
          <div className="flex items-center gap-3 text-sm text-danger" role="alert">
            {error}
            <Button variant="outline" onClick={reload}>
              Coba lagi
            </Button>
          </div>
        ) : ready ? (
          // eslint-disable-next-line @next/next/no-img-element -- a data: URL drawn in the browser, nothing for next/image to optimise
          <img src={ready} alt={`QR check-in tanggal ${data?.date}`} width={180} height={180} className="rounded-lg border border-stone-line" />
        ) : (
          <div className="grid size-[180px] place-items-center rounded-lg border border-stone-line text-xs text-ink-soft">
            {loading ? "Membuat QR…" : "QR belum tersedia"}
          </div>
        )}
        <ul className="max-w-md list-disc space-y-1.5 pl-5 text-[13px] text-ink-soft">
          <li>Pengunjung memindai QR ini lewat aplikasi museum untuk mencatat kehadiran.</li>
          <li>QR hanya berlaku pada tanggal hari ini (zona waktu Jakarta).</li>
          <li>Jangan membagikan gambar QR di luar museum; QR di pintu masuk dipakai sebagai bukti hadir.</li>
        </ul>
      </div>
    </Card>
  );
}
