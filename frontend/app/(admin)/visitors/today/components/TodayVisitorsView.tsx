"use client";

import { useState } from "react";
import { VISITOR_COLUMNS, VisitorsTable } from "./VisitorsTable";
import { VisitorsToolbar } from "./VisitorsToolbar";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/PageState";
import { useApiData } from "@/hooks/use-api-data";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { downloadCsv } from "@/lib/utils";
import type { TodayVisitorsData } from "@/types";

/** Holds the search text and the data; the toolbar and the table are separate sections in this folder. */
export function TodayVisitorsView() {
  const [search, setSearch] = useState("");
  const query = useDebouncedValue(search).trim();
  const url = query ? `/api/visitors/today?q=${encodeURIComponent(query)}` : "/api/visitors/today";
  const { data, error, loading, reload } = useApiData<TodayVisitorsData>(url);

  function handleDownload() {
    if (!data) return;
    downloadCsv(`pengunjung-${data.date}.csv`, [
      VISITOR_COLUMNS,
      ...data.visitors.map((v) => [v.name, v.domicile, v.institution ?? "—", v.educationLevel, v.checkInTime]),
    ]);
  }

  return (
    <Card>
      <VisitorsToolbar
        date={data?.date}
        search={search}
        onSearchChange={setSearch}
        onDownload={handleDownload}
        downloadDisabled={!data || data.visitors.length === 0}
      />

      {loading && !data ? (
        <LoadingState label="Memuat pengunjung…" />
      ) : error || !data ? (
        <ErrorState message={error ?? "Gagal memuat pengunjung."} onRetry={reload} />
      ) : data.visitors.length === 0 ? (
        <EmptyState
          message={query ? "Tidak ada pengunjung yang cocok dengan pencarian." : "Belum ada pengunjung yang check-in hari ini."}
        />
      ) : (
        <VisitorsTable visitors={data.visitors} />
      )}
    </Card>
  );
}
