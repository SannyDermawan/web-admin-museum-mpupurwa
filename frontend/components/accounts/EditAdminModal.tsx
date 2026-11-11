"use client";

import { useId, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormAlert } from "@/components/accounts/FormAlert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { apiPatch } from "@/lib/api";
import { ROLE_LABEL, STATUS_LABEL } from "@/lib/accounts";
import { editAdminSchema, type EditAdminFormValues } from "@/lib/validations/accounts";
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
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditAdminFormValues>({
    resolver: zodResolver(editAdminSchema),
    defaultValues: { name: account.name, role: account.role, status: account.status },
  });

  async function onSubmit(values: EditAdminFormValues) {
    setServerError(null);
    try {
      const payload: UpdateAdminRequest = { name: values.name, role: values.role, status: values.status };
      await apiPatch(`/api/accounts/admins/${account.id}`, payload);
      onSaved();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Gagal menyimpan perubahan.");
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
          <Button type="submit" form={formId} className="flex-1 p-[11px]!" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan…" : "Simpan Perubahan"}
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={handleSubmit(onSubmit)}>
        <Input
          id={`${formId}-name`}
          label="Nama Lengkap"
          error={errors.name?.message}
          autoFocus
          {...register("name")}
        />
        <Input id={`${formId}-email`} label="Email" value={account.email} readOnly className="bg-offwhite text-ink-soft" />
        <Select id={`${formId}-role`} label="Peran" error={errors.role?.message} {...register("role")}>
          {(Object.keys(ROLE_LABEL) as UserRole[]).map((value) => (
            <option key={value} value={value}>
              {ROLE_LABEL[value]}
            </option>
          ))}
        </Select>
        <Select id={`${formId}-status`} label="Status" error={errors.status?.message} {...register("status")}>
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
