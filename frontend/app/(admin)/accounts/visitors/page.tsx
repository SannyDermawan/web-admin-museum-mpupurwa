import type { Metadata } from "next";
import { Suspense } from "react";
import { VisitorAccountsView } from "@/components/accounts/VisitorAccountsView";

export const metadata: Metadata = { title: "Manajemen Akun · Pengunjung" };

export default function Page() {
  // The view reads ?q= from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <VisitorAccountsView />
    </Suspense>
  );
}
