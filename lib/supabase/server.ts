/**
 * Cliente Supabase para Server Components, Server Actions y Route Handlers.
 * Usa la anon key + cookies de sesión (SSR) — nunca la service role key.
 *
 * Consumido por: cualquier Server Component/Action/Route Handler que necesite
 * leer/escribir datos respetando RLS y la sesión del usuario autenticado.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Crea un cliente Supabase ligado a las cookies de la petición actual.
 *
 * Por qué es async: `cookies()` en Next.js 15+ es asíncrono (App Router).
 *
 * Trampa: `setAll` puede lanzar cuando se llama desde un Server Component
 * puro (RSC) — Next.js no permite mutar cookies fuera de Server Actions o
 * Route Handlers. Se ignora ese error a propósito porque `proxy.ts`
 * (middleware, se crea en la Tarea 6 — todavía no existe en el repo) se
 * encarga de refrescar la sesión en esos casos.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (all) => {
          try {
            all.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch (e) {
            // RSC: proxy.ts (Tarea 6) refresca la sesión en este caso — no es un error real
            // en producción. En dev sí se registra para no tragar en silencio un fallo genuino
            // (p. ej. `options` inválido) mientras `proxy.ts` no exista todavía.
            if (process.env.NODE_ENV === "development") {
              console.warn("[supabase] no se pudieron escribir cookies:", e);
            }
          }
        },
      },
    },
  );
}
