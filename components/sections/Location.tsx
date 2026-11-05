import { useTranslations } from "next-intl";
import { Anchor, ArrowUpRight, Lighthouse, Umbrella } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { MapaUbicacion } from "@/components/MapaUbicacion";
import { geo, times } from "@/lib/site";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/** Los tres datos del destino bajo los mapas (playa 5, faro 5, muelle 10 min). */
const FEATURED: { key: "beach" | "lighthouse" | "dock"; Icon: Icon }[] = [
  { key: "beach", Icon: Umbrella },
  { key: "lighthouse", Icon: Lighthouse },
  { key: "dock", Icon: Anchor },
];

/**
 * Ubicacion (S1 arena): H2 + lead, Google Maps embebido (mapa + satelite, a
 * sangre, sin marco ni tarjeta), tres distancias en fila con filetes de 1 px solo
 * entre columnas, direccion y enlace a la ficha de Google Maps.
 */
export function Location() {
  const t = useTranslations("location");
  return (
    <section id="ubicacion" className="section bg-arena-100">
      <div className="wrap">
        <h2 className="t-h2 display reveal max-w-[16ch]">{t("title")}</h2>
        <p className="t-lead reveal prose-measure mt-5 text-tinta-900" style={delay(80)}>
          {t("lead")}
        </p>
      </div>

      <div className="mt-10 lg:mt-12">
        <MapaUbicacion />
      </div>

      <div className="wrap mt-10 lg:mt-12">
        <ul className="grid divide-y divide-tinta-900/20 md:grid-cols-3 md:divide-x md:divide-y-0">
          {FEATURED.map(({ key, Icon }) => {
            const min = times.find((x) => x.key === key)?.min ?? 0;
            return (
              <li key={key} className="flex items-center gap-4 py-4 md:px-8 md:py-2 md:first:pl-0 md:last:pr-0">
                <Icon size={28} weight="light" className="shrink-0 text-tierra-700" aria-hidden />
                <span className="flex-1">{t(key)}</span>
                <span className="num shrink-0 font-semibold text-tierra-700">{t("minutes", { n: String(min).padStart(2, "0") })}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <p className="text-tinta-900">{t("address")}</p>
          <a href={geo.placeUrl} target="_blank" rel="noopener" className="link-action">
            {t("openMaps")}
            <span className="sr-only"> {t("newTab")}</span>
            <ArrowUpRight size={18} aria-hidden />
          </a>
        </div>
        <p className="t-small mt-6 max-w-[62ch] text-tinta-900/80">{t("note")}</p>
      </div>
    </section>
  );
}
