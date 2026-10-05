import type { ReactNode } from "react";

// El sitio tiene dos árboles con su propio <html>: `app/[locale]` (landing)
// y `app/panel` (CRM). Este layout raíz solo los deja pasar.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
