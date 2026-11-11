import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/PageState";
import { TextLink } from "@/components/ui/TextLink";
import { formatDateShort } from "@/lib/utils";
import type { PendingBookingSummary } from "@/types";

/** Section: "Booking Menunggu", group bookings that wait for an admin decision. */
export function PendingBookings({ bookings }: { bookings: PendingBookingSummary[] }) {
  return (
    <Card>
      <CardHeader title="Booking Menunggu" action={<TextLink tone="charcoal" href="/bookings">Lihat semua</TextLink>} />
      <div className="py-1.5">
        {bookings.length === 0 ? (
          <EmptyState message="Tidak ada booking yang menunggu." />
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="flex items-start gap-3 border-b border-stone-line px-[22px] py-3.5 last:border-b-0">
              <div className="mt-1.5 size-2 flex-none rounded-full bg-gold" />
              <div className="flex-1">
                <div className="text-[13.5px] font-bold">{booking.institutionName}</div>
                <div className="mt-0.5 text-xs text-ink-soft">
                  {`${booking.participantCount} peserta · ${formatDateShort(booking.visitDate)}`}
                </div>
                <div className="mt-2 flex gap-1.5">
                  {/* The booking module opens its detail popup for ?review=<id>. */}
                  <Link href={`/bookings?review=${booking.id}`} className={buttonStyles({ variant: "success" })}>
                    Tinjau
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
