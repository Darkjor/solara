import { notFound } from "next/navigation";

// Cualquier ruta desconocida bajo un locale muestra el 404 localizado de
// `app/[locale]/not-found.tsx` (con header y footer) en vez del genérico.
export default function CatchAll() {
  notFound();
}
