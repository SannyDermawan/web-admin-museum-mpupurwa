"use client";

import { useState } from "react";
import { FormAlert } from "@/components/accounts/FormAlert";
import { Button } from "@/components/ui/Button";
import { TrashIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";
import { apiDelete } from "@/lib/api";

type Props = {
  /** Shown in bold in the confirmation text */
  accountName: string;
  /** What else disappears with the account, e.g. "beserta seluruh riwayat kunjungannya" */
  consequence?: string;
  /** API path of the account, e.g. "/api/accounts/visitors/ACC-001" */
  path: string;
  onClose: () => void;
  /** Called after the server deleted the account. The parent reloads its list. */
  onDeleted: () => void;
};

/** Popup "Hapus akun ini?". Mount it only while an account is waiting for confirmation. */
export function DeleteAccountModal({ accountName, consequence, path, onClose, onDeleted }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setError(null);
    setDeleting(true);
    try {
      await apiDelete(path);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus akun.");
      setDeleting(false);
    }
  }

  return (
    <Modal
      open
      confirm
      onClose={onClose}
      title="Hapus akun ini?"
      footer={
        <>
          <Button variant="outline" className="flex-1 p-[11px]!" onClick={onClose}>
            Batal
          </Button>
          <Button variant="solidDanger" className="flex-1 p-[11px]!" disabled={deleting} onClick={handleDelete}>
            {deleting ? "Menghapus…" : "Ya, Hapus Akun"}
          </Button>
        </>
      }
    >
      <div className="mx-auto mt-1 mb-4 flex size-[52px] items-center justify-center rounded-full bg-danger-bg">
        <TrashIcon className="size-6 text-danger" strokeWidth={1.8} />
      </div>
      <h3 className="mb-2 text-[17px]">Hapus akun ini?</h3>
      <p className="text-[13px] leading-normal text-ink-soft">
        Akun <b className="text-ink">{accountName}</b>
        {consequence ? ` ${consequence}` : ""} akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
      </p>
      <div className="mt-4 text-left">
        <FormAlert message={error} />
      </div>
    </Modal>
  );
}
