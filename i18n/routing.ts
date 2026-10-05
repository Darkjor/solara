import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/aviso-de-privacidad": { es: "/aviso-de-privacidad", en: "/privacy" },
    "/gracias": { es: "/gracias", en: "/thank-you" },
  },
});

export type AppPathname = keyof typeof routing.pathnames;
