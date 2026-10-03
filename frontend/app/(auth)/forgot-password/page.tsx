import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Atur Ulang Kata Sandi" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
