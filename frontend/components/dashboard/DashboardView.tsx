"use client";

import Link from "next/link";
import { BookingStatistics } from "@/components/dashboard/BookingStatistics";
import { StatCard } from "@/components/dashboard/StatCard";
import { VisitorStatistics } from "@/components/dashboard/VisitorStatistics";
import { Avatar } from "@/components/ui/Avatar";
import { buttonStyles } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { AccountsIcon, CalendarIcon, CollectionIcon, UserIcon } from "@/components/ui/icons";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/PageState";
import { Table, Td, Tr } from "@/components/ui/Table";
import { TextLink } from "@/components/ui/TextLink";
import { useApiData } from "@/hooks/use-api-data";
import { formatDateShort, formatNumber } from "@/lib/utils";
import type { DashboardData } from "@/types";

function formatTrend(value: number, suffix = ""): string {
  return `${value >= 0 ? "+" : "-"}${Math.abs(value)}${suffix}`;
}

export function DashboardView() {
  const { data, error, loading, reload } = useApiData<DashboardData>("/api/dashboard");

  if (loading && !data) {
    return (
      <Card>
        <LoadingState label="Memuat dashboard…" />
      </Card>
    );
  }
  if (error || !data) {
    return (
      <Card>
        <ErrorState message={error ?? "Gagal memuat dashboard."} onRetry={reload} />
      </Card>
    );
  }

  const { stats, visitorTrend, bookingStatus, recentVisitors, pendingBookings } = data;

  return (
    <>
      <div className="mb-7 grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          tone="gold"
          icon={UserIcon}
          value={formatNumber(stats.todayVisitors)}
          label="Pengunjung hari ini"
          trend={formatTrend(stats.todayVisitorsChangePercent, "%")}
        />
        <StatCard icon={CalendarIcon} value={formatNumber(stats.pendingBookings)} label="Booking menunggu konfirmasi" />
        <StatCard
          icon={AccountsIcon}
          value={formatNumber(stats.totalAccounts)}
          label="Total akun terdaftar"
          trend={formatTrend(stats.newAccounts)}
        />
        <StatCard icon={CollectionIcon} value={formatNumber(stats.totalCollections)} label="Koleksi terdaftar" />
      </div>

      <div className="mb-5 grid items-stretch gap-5 xl:grid-cols-[2fr_1fr]">
        <VisitorStatistics trend={visitorTrend} />
        <BookingStatistics counts={bookingStatus} />
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader title="Pengunjung Terbaru" action={<TextLink tone="charcoal" href="/visitors/today">Lihat semua</TextLink>} />
          <div className="py-1.5">
            {recentVisitors.length === 0 ? (
              <EmptyState message="Belum ada pengunjung hari ini." />
            ) : (
              <Table>
                {recentVisitors.map((visitor) => (
                  <Tr key={visitor.id}>
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={visitor.name} />
                        <div>
                          <div className="font-bold">{visitor.name}</div>
                          <div className="mt-0.5 text-xs text-ink-soft">{`${visitor.domicile} · ${visitor.educationLevel}`}</div>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-right text-ink-soft">{visitor.checkInTime}</Td>
                  </Tr>
                ))}
              </Table>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Booking Menunggu" action={<TextLink tone="charcoal" href="/bookings">Lihat semua</TextLink>} />
          <div className="py-1.5">
            {pendingBookings.length === 0 ? (
              <EmptyState message="Tidak ada booking yang menunggu." />
            ) : (
              pendingBookings.map((booking) => (
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
      </div>
    </>
  );
}
