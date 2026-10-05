import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, alternates: { languages: { es: SITE_URL, en: `${SITE_URL}/en` } }, priority: 1 },
    { url: `${SITE_URL}/aviso-de-privacidad`, alternates: { languages: { en: `${SITE_URL}/en/privacy` } }, priority: 0.2 },
  ];
}
