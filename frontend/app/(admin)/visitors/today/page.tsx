import type { Metadata } from "next";
import { Suspense } from "react";
import { TodayVisitorsView } from "@/components/visitors/TodayVisitorsView";

export const metadata: Metadata = { title: "Pengunjung Hari Ini" };

export default function TodayVisitorsPage() {
  // The view reads ?q= from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <TodayVisitorsView />
    </Suspense>
  );
}
