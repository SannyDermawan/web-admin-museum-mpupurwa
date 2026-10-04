import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminAccountsView } from "@/components/accounts/AdminAccountsView";

export const metadata: Metadata = { title: "Manajemen Akun · Admin" };

export default function Page() {
  // The view reads ?q= from the URL, which needs a Suspense boundary.
  return (
    <Suspense>
      <AdminAccountsView />
    </Suspense>
  );
}
