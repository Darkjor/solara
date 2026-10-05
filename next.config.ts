import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Conecta `i18n/request.ts` (el `getRequestConfig` que resuelve locale y
// mensajes por peticion) con el build de Next. Sin este plugin, `proxy.ts`
// seguiria resolviendo el locale pero los server components no tendrian
// acceso a `useTranslations`/`getMessages`.
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Nota: se probó `experimental.inlineCss` y no mejoró Lighthouse (82-84 contra
// 85-86 sin él), así que se deja el CSS externo, que además se cachea.
const nextConfig: NextConfig = {
  images: {
    // AVIF pesa ~20-30 % menos que WebP; WebP queda de respaldo.
    formats: ["image/avif", "image/webp"],
    // 60 para fotos grandes decorativas, 75 (default) para el resto.
    qualities: [60, 75],
  },
};

export default withNextIntl(nextConfig);
