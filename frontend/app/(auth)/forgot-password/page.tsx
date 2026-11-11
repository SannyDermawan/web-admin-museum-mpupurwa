import type { Metadata } from "next";
import { AuthShell } from "../components/AuthShell";
import { ForgotPasswordForm } from "./components/ForgotPasswordForm";

export const metadata: Metadata = { title: "Atur Ulang Kata Sandi" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
