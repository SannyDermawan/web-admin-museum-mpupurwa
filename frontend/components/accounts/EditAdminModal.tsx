"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { FormAlert } from "@/components/accounts/FormAlert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { apiPatch } from "@/lib/api";
import { ROLE_LABEL, STATUS_LABEL } from "@/lib/accounts";
import type { AdminAccount, AdminStatus, UpdateAdminRequest, UserRole } from "@/types";

type Props = {
  account: AdminAccount;
  onClose: () => void;
  /** Called after the server accepted the change. The parent reloads its list. */
  onSaved: () => void;
};

/**
 * Popup "Edit Akun Admin". The design only specifies the visitor popup; this one reuses its
 * look for the admin edit button. The email is shown read-only because it is the login name.
 */
export function EditAdminModal({ account, onClose, onSaved }: Props) {
  const formId = useId();
  const [name, setName] = useState(account.name);
  const [role, setRole] = useState<UserRole>(account.role);
  const [status, setStatus] = useState<AdminStatus>(account.status);
  const [nameError, setNameError] = useState<string>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);
    if (!name.trim()) {
      setNameError("Nama lengkap wajib diisi.");
      return;
    }
    setNameError(undefined);

    setSubmitting(true);
    try {
      const payload: UpdateAdminRequest = { name: name.trim(), role, status };
      await apiPatch(`/api/accounts/admins/${account.id}`, payload);
      onSaved();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Gagal menyimpan perubahan.");
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit Akun Admin"
      footer={
        <>
          <Button variant="outline" className="flex-1 p-[11px]!" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form={formId} className="flex-1 p-[11px]!" disabled={submitting}>
            {submitting ? "Menyimpan…" : "Simpan Perubahan"}
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={handleSubmit}>
        <Input
          id={`${formId}-name`}
          label="Nama Lengkap"
          value={name}
          error={nameError}
          autoFocus
          onChange={(event) => setName(event.target.value)}
        />
        <Input id={`${formId}-email`} label="Email" value={account.email} readOnly className="bg-offwhite text-ink-soft" />
        <Select
          id={`${formId}-role`}
          label="Peran"
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole)}
        >
          {(Object.keys(ROLE_LABEL) as UserRole[]).map((value) => (
            <option key={value} value={value}>
              {ROLE_LABEL[value]}
            </option>
          ))}
        </Select>
        <Select
          id={`${formId}-status`}
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value as AdminStatus)}
        >
          {(Object.keys(STATUS_LABEL) as AdminStatus[]).map((value) => (
            <option key={value} value={value}>
              {STATUS_LABEL[value]}
            </option>
          ))}
        </Select>
        <FormAlert message={serverError} />
      </form>
    </Modal>
  );
}
