"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AccountsToolbar } from "@/components/accounts/AccountsToolbar";
import { DeleteAccountModal } from "@/components/accounts/DeleteAccountModal";
import { EditVisitorModal } from "@/components/accounts/EditVisitorModal";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { EditIcon, SearchIcon, TrashIcon } from "@/components/ui/icons";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/PageState";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { useApiData } from "@/hooks/use-api-data";
import { formatDateShort } from "@/lib/utils";
import type { VisitorAccount, VisitorAccountsData } from "@/types";

const COLUMNS = ["Nama", "Kontak", "Asal Sekolah", "Tingkat", "Terdaftar", "Aksi"];

export function VisitorAccountsView() {
  // Two search boxes exist: the one in this card, and the top bar one (?q=). The card's box wins when it has text.
  const navbarQuery = useSearchParams().get("q")?.trim() ?? "";
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const query = debouncedSearch || navbarQuery;

  const url = query ? `/api/accounts/visitors?q=${encodeURIComponent(query)}` : "/api/accounts/visitors";
  const { data, error, loading, reload } = useApiData<VisitorAccountsData>(url);

  const [editing, setEditing] = useState<VisitorAccount | null>(null);
  const [deleting, setDeleting] = useState<VisitorAccount | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <Card>
      <AccountsToolbar active="visitors" />
      <div className="flex items-center justify-between gap-3.5 border-b border-stone-line px-[22px] py-4">
        <div className="flex w-[280px] max-w-full items-center gap-2 rounded-[9px] border border-stone-line bg-offwhite px-3.5 py-[9px]">
          <SearchIcon className="size-[15px] flex-none text-ink-soft" />
          <input
            type="text"
            aria-label="Cari akun pengunjung"
            placeholder="Cari nama, No. HP, atau Gmail..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-transparent text-[13px] text-ink outline-none"
          />
        </div>
      </div>

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
