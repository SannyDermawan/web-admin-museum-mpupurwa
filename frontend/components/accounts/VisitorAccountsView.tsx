"use client";

import { useState } from "react";
import { AccountsToolbar } from "@/components/accounts/AccountsToolbar";
import { DeleteAccountModal } from "@/components/accounts/DeleteAccountModal";
import { EditVisitorModal } from "@/components/accounts/EditVisitorModal";
import { Avatar } from "@/components/ui/Avatar";
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

export function VisitorAccountsView() {
  const [search, setSearch] = useState("");
  const query = useDebouncedValue(search).trim();

  const url = query ? `/api/accounts/visitors?q=${encodeURIComponent(query)}` : "/api/accounts/visitors";
  const { data, error, loading, reload } = useApiData<VisitorAccountsData>(url);

  const [editing, setEditing] = useState<VisitorAccount | null>(null);
  const [deleting, setDeleting] = useState<VisitorAccount | null>(null);

  return (
    <Card>
      <AccountsToolbar
        active="visitors"
        action={
          <SearchField
            value={search}
            onChange={setSearch}
            label="Cari akun pengunjung"
            placeholder="Cari nama, No. HP, atau Gmail..."
          />
        }
      />

      {loading && !data ? (
        <LoadingState label="Memuat akun pengunjung…" />
      ) : error || !data ? (
        <ErrorState message={error ?? "Gagal memuat akun pengunjung."} onRetry={reload} />
      ) : data.visitors.length === 0 ? (
        <EmptyState message={query ? "Tidak ada akun yang cocok dengan pencarian." : "Belum ada akun pengunjung."} />
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
          consequence="beserta seluruh riwayat kunjungannya"
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
