"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { AuthHeading } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiPost } from "@/lib/api";
import type { ForgotPasswordRequest } from "@/types";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSentMessage(null);
    setSubmitting(true);
    try {
      const payload: ForgotPasswordRequest = { email };
      const { message } = await apiPost<null>("/api/auth/forgot-password", payload);
      setSentMessage(message ?? "Tautan atur ulang sudah dikirim.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim tautan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Link href="/login" className="mb-[22px] inline-block text-[12.5px] font-bold text-ink-soft hover:text-ink">
        Kembali ke halaman masuk
      </Link>
      <AuthHeading
        title="Atur ulang kata sandi"
        description="Masukkan email admin kamu. Kami kirim tautan untuk membuat kata sandi baru."
      />

      {sentMessage && (
        <div role="status" className="mb-4 rounded-[9px] border border-success-line bg-success-bg px-3.5 py-3 text-[13px] leading-normal text-success">
          {sentMessage}
        </div>
      )}
      {error && (
        <div role="alert" className="mb-4 rounded-[9px] border border-danger-line bg-danger-bg px-3.5 py-3 text-[13px] leading-normal text-danger">
          {error}
        </div>
      )}

      <Input
        id="email"
        label="Email"
        type="email"
        autoComplete="username"
        placeholder="nama@mpupurwa.id"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <Button type="submit" block disabled={submitting}>
        {submitting ? "Mengirim…" : "Kirim tautan atur ulang"}
      </Button>
    </form>
  );
}
