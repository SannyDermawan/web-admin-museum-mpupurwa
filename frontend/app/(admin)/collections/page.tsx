import type { Metadata } from "next";
import { CollectionsView } from "./components/CollectionsView";

export const metadata: Metadata = { title: "Manajemen Koleksi" };

export default function CollectionsPage() {
  return <CollectionsView />;
}
