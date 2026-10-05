import type { ReactNode } from "react";
import { Assistant } from "next/font/google";
import "../globals.css";

const rubik = Assistant({ subsets: ["latin"], variable: "--font-assistant", display: "swap" });

export const metadata = {
  title: { default: "CRM | SOLARA", template: "%s | CRM SOLARA" },
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${rubik.variable} antialiased`}>
      <body className="font-ui min-h-dvh bg-[#faf7f2] text-tinta">{children}</body>
    </html>
  );
}
