"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthHeading } from "../../components/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiPost } from "@/lib/api";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import type { ForgotPasswordFormValues } from "@/lib/validations/auth";

export function ForgotPasswordForm() {
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setServerError(null);
    setSentMessage(null);
    try {
      const { message } = await apiPost<null>("/api/auth/forgot-password", values);
      setSentMessage(message ?? "Tautan atur ulang sudah dikirim.");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Gagal mengirim tautan. Coba lagi.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
      {serverError && (
        <div role="alert" className="mb-4 rounded-[9px] border border-danger-line bg-danger-bg px-3.5 py-3 text-[13px] leading-normal text-danger">
          {serverError}
        </div>
      )}

      <Input
        id="email"
        label="Email"
        type="email"
        autoComplete="username"
        placeholder="nama@mpupurwa.id"
        error={errors.email?.message}
        {...register("email")}
      />

      <Button type="submit" block disabled={isSubmitting}>
        {isSubmitting ? "Mengirim…" : "Kirim tautan atur ulang"}
      </Button>
    </form>
  );
}
