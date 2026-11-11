"use client";

import { useId, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormAlert } from "@/components/accounts/FormAlert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { apiPost } from "@/lib/api";
import { ROLE_LABEL } from "@/lib/accounts";
import { addAdminSchema, type AddAdminFormValues } from "@/lib/validations/accounts";
import type { AdminAccount, CreateAdminRequest, UserRole } from "@/types";

const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

/** "Mpu-7Kd92x": easy to read out loud, so there is no 0/O or 1/l/I. */
function generateTemporaryPassword(): string {
  const picks = Array.from({ length: 6 }, () => PASSWORD_CHARS[Math.floor(Math.random() * PASSWORD_CHARS.length)]);
  return `Mpu-${picks.join("")}`;
}

type Props = {
  onClose: () => void;
  /** Called after the server created the admin. The parent reloads its list. */
  onCreated: () => void;
};

/** Popup "Tambah Admin Baru". Mount it only while it is open, so the form starts empty each time. */
export function AddAdminModal({ onClose, onCreated }: Props) {
  const formId = useId();
  // Generated once when the modal opens, not on every render.
  const [initialPassword] = useState(generateTemporaryPassword);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddAdminFormValues>({
    resolver: zodResolver(addAdminSchema),
    defaultValues: { name: "", email: "", role: "admin", temporaryPassword: initialPassword },
  });

  async function onSubmit(values: AddAdminFormValues) {
    setServerError(null);
    try {
      const payload: CreateAdminRequest = {
        name: values.name,
        email: values.email,
        role: values.role,
        temporaryPassword: values.temporaryPassword,
      };
      await apiPost<AdminAccount>("/api/accounts/admins", payload);
      onCreated();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Gagal membuat akun admin.");
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Tambah Admin Baru"
      footer={
        <>
          <Button variant="outline" className="flex-1 p-[11px]!" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form={formId} className="flex-1 p-[11px]!" disabled={isSubmitting}>
            {isSubmitting ? "Membuat…" : "Buat akun admin"}
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={handleSubmit(onSubmit)}>
        <Input
          id={`${formId}-name`}
          label="Nama lengkap"
          placeholder="Nama admin"
          error={errors.name?.message}
          autoFocus
          {...register("name")}
        />
        <Input
          id={`${formId}-email`}
          label="Email"
          type="email"
          placeholder="nama@mpupurwa.id"
          error={errors.email?.message}
          {...register("email")}
        />
        <Select id={`${formId}-role`} label="Peran" error={errors.role?.message} {...register("role")}>
          {(Object.keys(ROLE_LABEL) as UserRole[]).map((value) => (
            <option key={value} value={value}>
              {ROLE_LABEL[value]}
            </option>
          ))}
        </Select>
        <Input
          id={`${formId}-password`}
          label="Kata sandi sementara"
          type="text"
          autoComplete="off"
          error={errors.temporaryPassword?.message}
          {...register("temporaryPassword")}
        />
        <p className="-mt-1 text-xs leading-normal text-ink-soft">
          Admin baru diminta mengganti kata sandi saat pertama kali masuk.
        </p>
        <div className="mt-3.5">
          <FormAlert message={serverError} />
        </div>
      </form>
    </Modal>
  );
}
