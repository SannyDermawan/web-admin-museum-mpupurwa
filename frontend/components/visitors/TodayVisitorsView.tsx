"use client";

import { useSearchParams } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CalendarIcon } from "@/components/ui/icons";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/PageState";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { useApiData } from "@/hooks/use-api-data";
import { downloadCsv, formatDateLong } from "@/lib/utils";
import type { TodayVisitorsData } from "@/types";

const COLUMNS = ["Pengunjung", "Domisili", "Asal Sekolah / Institusi", "Tingkat Pendidikan", "Waktu Check-in"];

export function TodayVisitorsView() {
  // The top bar search box writes ?q=... to the URL.
  const query = useSearchParams().get("q")?.trim() ?? "";
  const url = query ? `/api/visitors/today?q=${encodeURIComponent(query)}` : "/api/visitors/today";
  const { data, error, loading, reload } = useApiData<TodayVisitorsData>(url);

  function handleDownload() {
    if (!data) return;
    downloadCsv(`pengunjung-${data.date}.csv`, [
      COLUMNS,
      ...data.visitors.map((v) => [v.name, v.domicile, v.institution ?? "—", v.educationLevel, v.checkInTime]),
    ]);
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-3.5 border-b border-stone-line px-[22px] py-4">
        {data ? (
          <div className="flex items-center gap-2 rounded-lg border border-stone-line px-3 py-2 text-[13px] font-semibold">
            <CalendarIcon className="size-[15px] text-ink-soft" />
            {formatDateLong(data.date)}
          </div>
        ) : (
          <div />
        )}
        <Button variant="outline" onClick={handleDownload} disabled={!data || data.visitors.length === 0}>
          Unduh CSV
        </Button>
      </div>

      {loading && !data ? (
        <LoadingState label="Memuat pengunjung…" />
      ) : error || !data ? (
        <ErrorState message={error ?? "Gagal memuat pengunjung."} onRetry={reload} />
      ) : data.visitors.length === 0 ? (
        <EmptyState
          message={query ? "Tidak ada pengunjung yang cocok dengan pencarian." : "Belum ada pengunjung yang check-in hari ini."}
        />
      ) : (
        <Table
          head={COLUMNS.map((column) => (
            <Th key={column}>{column}</Th>
          ))}
        >
          {data.visitors.map((visitor) => (
            <Tr key={visitor.id}>
              <Td>
                <div className="flex items-center gap-2.5">
                  <Avatar name={visitor.name} />
                  <span className="font-bold">{visitor.name}</span>
                </div>
              </Td>
              <Td>{visitor.domicile}</Td>
              <Td>{visitor.institution ?? "—"}</Td>
              <Td>{visitor.educationLevel}</Td>
              <Td>{visitor.checkInTime}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </Card>
  );
}
