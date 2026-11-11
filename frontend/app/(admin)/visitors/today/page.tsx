import type { Metadata } from "next";
import { TodayVisitorsView } from "./components/TodayVisitorsView";

export const metadata: Metadata = { title: "Pengunjung Hari Ini" };

export default function TodayVisitorsPage() {
  return <TodayVisitorsView />;
}
