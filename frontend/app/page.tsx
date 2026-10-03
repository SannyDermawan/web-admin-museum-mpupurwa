import { redirect } from "next/navigation";

// proxy.ts sends visitors without a session on to /login.
export default function Home() {
  redirect("/dashboard");
}
