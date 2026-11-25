"use client";

import { useState } from "react";
import { AccountsToolbar } from "../../components/AccountsToolbar";
import { DeleteAccountModal } from "../../components/DeleteAccountModal";
import { EditVisitorModal } from "./EditVisitorModal";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { EditIcon, TrashIcon } from "@/components/ui/icons";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/PageState";
import { SearchField } from "@/components/ui/SearchField";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { useApiData } from "@/hooks/use-api-data";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatDateShort } from "@/lib/utils";
import type { VisitorAccount, VisitorAccountsData } from "@/types";

const COLUMNS = ["Nama", "Kontak", "Asal Sekolah", "Tingkat", "Terdaftar", "Aksi"];

type VerificationFilter = "all" | "verified" | "unverified";

export function VisitorAccountsView() {
  const [search, setSearch] = useState("");
  const query = useDebouncedValue(search).trim();

  const url = query ? `/api/accounts/visitors?q=${encodeURIComponent(query)}` : "/api/accounts/visitors";
  const { data, error, loading, reload } = useApiData<VisitorAccountsData>(url);

  const [verification, setVerification] = useState<VerificationFilter>("all");
  // The list from the server is complete, so filtering by verification happens here.
  const visitors = (data?.visitors ?? []).filter(
    (visitor) => verification === "all" || visitor.verified === (verification === "verified"),
  );

  const [editing, setEditing] = useState<VisitorAccount | null>(null);
  const [deleting, setDeleting] = useState<VisitorAccount | null>(null);

  return (
    <Card>
      <AccountsToolbar
        active="visitors"
        action={
          <>
            <select
              aria-label="Status verifikasi"
              value={verification}
              onChange={(event) => setVerification(event.target.value as VerificationFilter)}
              className="rounded-lg border border-stone-line bg-white px-3 py-2 text-[13px] font-semibold text-ink"
            >
              <option value="all">Semua status</option>
              <option value="verified">Terverifikasi</option>
              <option value="unverified">Belum verifikasi</option>
            </select>
            <SearchField
              value={search}
              onChange={setSearch}
              label="Cari akun pengunjung"
              placeholder="Cari nama, No. HP, atau Gmail..."
            />
          </>
        }
      />

      {loading && !data ? (
        <LoadingState label="Memuat akun pengunjung…" />
      ) : error || !data ? (
        <ErrorState message={error ?? "Gagal memuat akun pengunjung."} onRetry={reload} />
      ) : visitors.length === 0 ? (
        <EmptyState
          message={query || verification !== "all" ? "Tidak ada akun yang cocok." : "Belum ada akun pengunjung."}
        />
      ) : (
        <Table
          head={COLUMNS.map((column) => (
            <Th key={column}>{column}</Th>
          ))}
        >
          {visitors.map((visitor) => (
            <Tr key={visitor.id}>
              <Td>
                <div className="flex items-center gap-2.5">
                  <Avatar name={visitor.name} />
                  <div>
                    <div className="font-bold">{visitor.name}</div>
                    <Badge variant={visitor.verified ? "confirmed" : "pending"} className="mt-1 whitespace-nowrap">
                      {visitor.verified ? "Terverifikasi" : "Belum verifikasi"}
                    </Badge>
                  </div>
                </div>
              </Td>
              <Td>
                <div>{visitor.phone}</div>
                <div className="mt-0.5 text-xs text-ink-soft">{visitor.email}</div>
              </Td>
              <Td>{visitor.institution ?? "—"}</Td>
              <Td>{visitor.educationLevel}</Td>
              <Td className="whitespace-nowrap">{formatDateShort(visitor.registeredAt)}</Td>
              <Td>
                <div className="flex gap-2">
                  <IconButton label={`Edit akun ${visitor.name}`} onClick={() => setEditing(visitor)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton label={`Hapus akun ${visitor.name}`} danger onClick={() => setDeleting(visitor)}>
                    <TrashIcon />
                  </IconButton>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      {editing && (
        <EditVisitorModal
          key={editing.id}
          account={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
      {deleting && (
        <DeleteAccountModal
          accountName={deleting.name}
          note="Pengunjung ini akan keluar dari aplikasi. Riwayat check-in tetap tersimpan."
          path={`/api/accounts/visitors/${deleting.id}`}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            reload();
          }}
        />
      )}
    </Card>
  );
}
