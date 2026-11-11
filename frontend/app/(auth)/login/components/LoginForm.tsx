"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthHeading } from "../../components/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextLink } from "@/components/ui/TextLink";
import { apiPost } from "@/lib/api";
import { setAuthUser } from "@/lib/user-auth";
import { loginSchema } from "@/lib/validations/auth";
import type { LoginFormValues } from "@/lib/validations/auth";
import type { LoginData } from "@/types";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  // Tombol tetap nonaktif setelah berhasil, selama halaman berpindah ke dashboard.
  const busy = isSubmitting || isSubmitSuccessful;

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      const { data } = await apiPost<LoginData>("/api/auth/login", values);
      setAuthUser(data.user);
      router.replace("/dashboard");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Gagal masuk. Coba lagi.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <AuthHeading title="Masuk ke Admin Panel" description="Gunakan akun admin yang diberikan oleh pengelola museum." />

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
      <Input
        id="password"
        label="Kata sandi"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        error={errors.password?.message}
        endAdornment={
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="text-xs font-bold text-ink-soft hover:text-ink"
          >
            {showPassword ? "Sembunyikan" : "Tampilkan"}
          </button>
        }
        {...register("password")}
      />

      <div className="mt-1 mb-[22px] flex items-center justify-between text-[12.5px]">
        <label className="flex cursor-pointer items-center gap-2 text-ink-soft">
          <input type="checkbox" className="accent-gold" {...register("remember")} />
          Ingat saya di perangkat ini
        </label>
        <TextLink href="/forgot-password">Lupa kata sandi?</TextLink>
      </div>

      <Button type="submit" block disabled={busy}>
        {busy ? "Memproses…" : "Masuk"}
      </Button>

      <div className="mt-[26px] border-t border-stone-line pt-5 text-[12.5px] leading-[1.55] text-ink-soft">
        Belum punya akses? Akun admin dibuat oleh Super Admin. Hubungi pengelola museum untuk dibuatkan akun.
      </div>
    </form>
  );
}
