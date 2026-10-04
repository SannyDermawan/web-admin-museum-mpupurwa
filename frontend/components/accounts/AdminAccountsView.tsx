"use client";

import { useState } from "react";
import { AccountsToolbar } from "@/components/accounts/AccountsToolbar";
import { AddAdminModal } from "@/components/accounts/AddAdminModal";
import { DeleteAccountModal } from "@/components/accounts/DeleteAccountModal";
import { EditAdminModal } from "@/components/accounts/EditAdminModal";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { EditIcon, TrashIcon } from "@/components/ui/icons";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/PageState";
import { SearchField } from "@/components/ui/SearchField";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { useApiData } from "@/hooks/use-api-data";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ROLE_LABEL, STATUS_LABEL, formatLastLogin } from "@/lib/accounts";
import { useAuthUser } from "@/lib/auth-storage";
import type { AdminAccount, AdminAccountsData } from "@/types";

const COLUMNS = ["Admin", "Peran", "Login terakhir", "Status", "Aksi"];

export function AdminAccountsView() {
  const [search, setSearch] = useState("");
  const query = useDebouncedValue(search).trim();
  const url = query ? `/api/accounts/admins?q=${encodeURIComponent(query)}` : "/api/accounts/admins";
  const { data, error, loading, reload } = useApiData<AdminAccountsData>(url);
  const currentUser = useAuthUser();

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<AdminAccount | null>(null);
  const [deleting, setDeleting] = useState<AdminAccount | null>(null);

  return (
    <Card>
      <AccountsToolbar active="admins" action={<Button onClick={() => setAdding(true)}>+ Tambah Admin</Button>} />
      <div className="flex items-center justify-between gap-3.5 border-b border-stone-line px-[22px] py-4">
        <SearchField value={search} onChange={setSearch} label="Cari akun admin" placeholder="Cari nama atau email admin..." />
      </div>

      {loading && !data ? (
        <LoadingState label="Memuat akun admin…" />
      ) : error || !data ? (
        <ErrorState message={error ?? "Gagal memuat akun admin."} onRetry={reload} />
      ) : data.admins.length === 0 ? (
        <EmptyState message={query ? "Tidak ada admin yang cocok dengan pencarian." : "Belum ada akun admin."} />
      ) : (
        <Table
          head={COLUMNS.map((column) => (
            <Th key={column}>{column}</Th>
          ))}
        >
          {data.admins.map((admin) => (
            <Tr key={admin.id}>
              <Td>
                <div className="flex items-center gap-2.5">
                  <Avatar name={admin.name} />
                  <div>
                    <div className="font-bold">{admin.name}</div>
                    <div className="mt-0.5 text-xs text-ink-soft">{admin.email}</div>
                  </div>
                </div>
              </Td>
              <Td>
                <Badge variant={admin.role === "super_admin" ? "superRole" : "role"}>{ROLE_LABEL[admin.role]}</Badge>
              </Td>
              <Td className="whitespace-nowrap">{formatLastLogin(admin.lastLoginAt)}</Td>
              <Td>
                <Badge variant={admin.status === "active" ? "confirmed" : "pending"}>{STATUS_LABEL[admin.status]}</Badge>
              </Td>
              <Td>
                {admin.id === currentUser?.id ? (
                  <span className="text-xs text-ink-soft">Akun kamu</span>
                ) : (
                  <div className="flex gap-2">
                    <IconButton label={`Edit akun ${admin.name}`} onClick={() => setEditing(admin)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton label={`Hapus akun ${admin.name}`} danger onClick={() => setDeleting(admin)}>
                      <TrashIcon />
                    </IconButton>
                  </div>
                )}
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      {adding && (
        <AddAdminModal
          onClose={() => setAdding(false)}
          onCreated={() => {
            setAdding(false);
            reload();
          }}
        />
      )}
      {editing && (
        <EditAdminModal
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
          path={`/api/accounts/admins/${deleting.id}`}
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
