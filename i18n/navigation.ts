// Envoltorios de navegacion conscientes del locale, generados por next-intl
// a partir de `routing`. Los componentes publicos deben importar `Link`,
// `redirect`, `usePathname` y `useRouter` de AQUI y no de `next/link` /
// `next/navigation`: la version de next-intl antepone el locale correcto y
// traduce el pathname (ej. `/nosotros` -> `/en/about`) automaticamente.
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * `Link`: como `next/link` pero traduce el `href` segun `routing.pathnames`
 * y el locale activo.
 * `redirect`/`permanentRedirect`: como los de `next/navigation` pero con el
 * mismo prefijo/traduccion de ruta.
 * `usePathname`: devuelve el pathname SIN el prefijo de locale (la clave de
 * `routing.pathnames`, no la URL final).
 * `useRouter`: como `next/navigation`'s `useRouter`, con soporte para
 * `{ locale }` en `push`/`replace` (lo usa `LocaleSwitcher`).
 * `getPathname`: helper server-side para construir un `href` de un locale
 * especifico (ej. en `generateMetadata` para `alternates.languages`).
 */
export const { Link, redirect, permanentRedirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
