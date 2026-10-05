// Configuracion por-request de next-intl: resuelve que locale sirve esta
// peticion y carga su archivo de mensajes. Referenciado desde
// `next.config.ts` via `createNextIntlPlugin("./i18n/request.ts")`.
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * `requestLocale` viene del segmento `[locale]` que resolvio `proxy.ts`.
 * Puede venir invalido o vacio (ej. una ruta fuera de `[locale]`, o el
 * catch-all resolviendo un valor no soportado) — en ese caso se usa el
 * locale por defecto en vez de romper el render con un mensaje inexistente.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
