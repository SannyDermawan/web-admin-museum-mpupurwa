import type { Metadata } from "next";
import { AuthShell } from "../components/AuthShell";
import { LoginForm } from "./components/LoginForm";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
