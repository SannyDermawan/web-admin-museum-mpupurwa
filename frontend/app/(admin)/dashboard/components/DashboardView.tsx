"use client";

import { BookingStatistics } from "./BookingStatistics";
import { PendingBookings } from "./PendingBookings";
import { RecentVisitors } from "./RecentVisitors";
import { StatCards } from "./StatCards";
import { VisitorStatistics } from "./VisitorStatistics";
import { Card } from "@/components/ui/Card";
import { ErrorState, LoadingState } from "@/components/ui/PageState";
import { useApiData } from "@/hooks/use-api-data";
import type { DashboardData } from "@/types";

/** Loads the dashboard data once and lays out its sections. Each section lives in its own file here. */
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

  return (
    <>
      <StatCards stats={data.stats} />

      <div className="mb-5 grid items-stretch gap-5 xl:grid-cols-[2fr_1fr]">
        <VisitorStatistics />
        <BookingStatistics />
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[1.3fr_1fr]">
        <RecentVisitors visitors={data.recentVisitors} />
        <PendingBookings bookings={data.pendingBookings} />
      </div>
    </>
  );
}
