import { StatCard } from "./StatCard";
import { AccountsIcon, CalendarIcon, CollectionIcon, UserIcon } from "@/components/ui/icons";
import { formatNumber } from "@/lib/utils";
import type { DashboardStats } from "@/types";

function formatTrend(value: number, suffix = ""): string {
  return `${value >= 0 ? "+" : "-"}${Math.abs(value)}${suffix}`;
}

/** Section: the four summary cards at the top of the dashboard. */
export function StatCards({ stats }: { stats: DashboardStats }) {
  return (
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
  );
}
