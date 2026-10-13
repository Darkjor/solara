import { useTranslations } from "next-intl";
import { LocationMap } from "@/components/LocationMap";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/**
 * Destino. Ganchos para M4: `[data-scene="location"]`, `.location-map` (mapa
 * local con hotspots `[data-hotspot]`) y las filas `[data-time-row]` (contenido
 * real; la imagen es apoyo). Sin escena fija: el mapa se acerca de 1.35 a 1
 * una sola vez al entrar (`.location-local`).
 */
export function Location() {
  const t = useTranslations("location");
  return (
    <section id="ubicacion" data-scene="location" className="section bg-arena-100">
      <div className="wrap">
        <LocationMap
          head={
            <>
              <h2 className="t-h2 display reveal max-w-[16ch]">{t("title")}</h2>
              <p className="t-lead reveal prose-measure mt-5 text-tinta-900" style={delay(80)}>
                {t("lead")}
              </p>
            </>
          }
        />
        <p className="t-small mt-8 max-w-[62ch] text-tinta-600">{t("note")}</p>
      </div>
    </section>
  );
}
