import { useTranslations } from "next-intl";
import { LocationMap } from "@/components/LocationMap";

/**
 * Ubicación. Ganchos para M4 (fase 2): `[data-scene="location"]`,
 * `.location-map` (mapa local con hotspots `[data-hotspot]`) y las filas
 * `[data-time-row]` de la lista de tiempos (contenido real, la imagen no es la
 * única vía). El mapa regional ya vive en la celda D de Ventajas.
 */
export function Location() {
  const t = useTranslations("location");
  return (
    <section id="ubicacion" data-scene="location" className="section bg-hueso">
      <div className="wrap">
        <p className="t-label reveal text-tierra-600">{t("eyebrow")}</p>
        <h2 className="t-h2 display reveal mt-4">{t("title")}</h2>
        <p className="t-lead reveal prose-measure mt-5 text-tinta-900">{t("lead")}</p>
        <LocationMap />
        <p className="t-small mt-8 max-w-[62ch] text-tinta-600">{t("note")}</p>
      </div>
    </section>
  );
}
