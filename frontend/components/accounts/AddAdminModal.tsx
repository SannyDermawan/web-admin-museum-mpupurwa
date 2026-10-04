"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { FormAlert } from "@/components/accounts/FormAlert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { apiPost } from "@/lib/api";
import { EMAIL_PATTERN, ROLE_LABEL } from "@/lib/accounts";
import type { AdminAccount, CreateAdminRequest, UserRole } from "@/types";

const MIN_PASSWORD_LENGTH = 8;
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

type Errors = Partial<Record<"name" | "email" | "password", string>>;

/** Popup "Tambah Admin Baru". Mount it only while it is open, so the form starts empty each time. */
export function AddAdminModal({ onClose, onCreated }: Props) {
  const formId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [password, setPassword] = useState(generateTemporaryPassword);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): Errors {
    const found: Errors = {};
    if (!name.trim()) found.name = "Nama lengkap wajib diisi.";
    if (!email.trim()) found.email = "Email wajib diisi.";
    else if (!EMAIL_PATTERN.test(email.trim())) found.email = "Format email tidak valid.";
    if (password.length < MIN_PASSWORD_LENGTH) {
      found.password = `Kata sandi sementara minimal ${MIN_PASSWORD_LENGTH} karakter.`;
    }
    return found;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setServerError(null);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const payload: CreateAdminRequest = { name: name.trim(), email: email.trim(), role, temporaryPassword: password };
      await apiPost<AdminAccount>("/api/accounts/admins", payload);
      onCreated();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Gagal membuat akun admin.");
      setSubmitting(false);
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
          <Button type="submit" form={formId} className="flex-1 p-[11px]!" disabled={submitting}>
            {submitting ? "Membuat…" : "Buat akun admin"}
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={handleSubmit}>
        <Input
          id={`${formId}-name`}
          label="Nama lengkap"
          placeholder="Nama admin"
          value={name}
          error={errors.name}
          autoFocus
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          id={`${formId}-email`}
          label="Email"
          type="email"
          placeholder="nama@mpupurwa.id"
          value={email}
          error={errors.email}
          onChange={(event) => setEmail(event.target.value)}
        />
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
        <Input
          id={`${formId}-password`}
          label="Kata sandi sementara"
          type="text"
          autoComplete="off"
          value={password}
          error={errors.password}
          onChange={(event) => setPassword(event.target.value)}
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
