import type { Metadata } from "next";
import { Fraunces, Karla } from "next/font/google";
import "./globals.css";

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "Admin Panel · Museum Mpu Purwa",
    template: "%s · Admin Mpu Purwa",
  },
  description: "Panel admin untuk mengelola kunjungan, booking, akun, dan koleksi Museum Mpu Purwa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${karla.variable} ${fraunces.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
