"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { AuthHeading } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextLink } from "@/components/ui/TextLink";
import { apiPost } from "@/lib/api";
import { setAuthUser } from "@/lib/auth-storage";
import type { LoginData, LoginRequest } from "@/types";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: LoginRequest = { email, password, remember };
      const { data } = await apiPost<LoginData>("/api/auth/login", payload);
      setAuthUser(data.user);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk. Coba lagi.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <AuthHeading title="Masuk ke Admin Panel" description="Gunakan akun admin yang diberikan oleh pengelola museum." />

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
      <Input
        id="password"
        label="Kata sandi"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        endAdornment={
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="text-xs font-bold text-ink-soft hover:text-ink"
          >
            {showPassword ? "Sembunyikan" : "Tampilkan"}
          </button>
        }
      />

      <div className="mt-1 mb-[22px] flex items-center justify-between text-[12.5px]">
        <label className="flex cursor-pointer items-center gap-2 text-ink-soft">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="accent-gold"
          />
          Ingat saya di perangkat ini
        </label>
        <TextLink href="/forgot-password">Lupa kata sandi?</TextLink>
      </div>

      <Button type="submit" block disabled={submitting}>
        {submitting ? "Memproses…" : "Masuk"}
      </Button>

      <div className="mt-[26px] border-t border-stone-line pt-5 text-[12.5px] leading-[1.55] text-ink-soft">
        Belum punya akses? Akun admin dibuat oleh Super Admin. Hubungi pengelola museum untuk dibuatkan akun.
      </div>
    </form>
  );
}
