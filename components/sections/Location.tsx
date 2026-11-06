import Image from "next/image";
import { useTranslations } from "next-intl";
import { Anchor, ArrowUpRight, Lighthouse, Umbrella } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { MapaUbicacion } from "@/components/MapaUbicacion";
import { geo, times } from "@/lib/site";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/** Los tres datos del destino (playa 5, faro 5, muelle 10 min). */
const FEATURED: { key: "beach" | "lighthouse" | "dock"; Icon: Icon }[] = [
  { key: "beach", Icon: Umbrella },
  { key: "lighthouse", Icon: Lighthouse },
  { key: "dock", Icon: Anchor },
];

/**
 * Capitulo 2, ubicacion. Estado base (movil, tablet y movimiento reducido): H2 + lead,
 * mapa estatal, tres distancias en fila y el Google Maps embebido. En >=1024 con
 * movimiento, Scenes.tsx pone `loc-live` y fija el escenario (pin): el mapa estatal se
 * acerca a SOLARA, hace fundido a la vista local y las tres distancias entran una por
 * tiempo. Al soltar el pin sigue el bloque de Google Maps. Ganchos: `[data-loc-stage]`,
 * `[data-loc-state]`, `[data-loc-local]`, `[data-loc-item]`.
 */
export function Location() {
  const t = useTranslations("location");
  return (
    <section id="ubicacion" data-scene="location" className="loc-section section bg-arena-100">
      <div data-loc-stage className="loc-stage">
        <div className="wrap loc-grid">
          <div className="loc-head">
            <h2 className="t-h2 display reveal max-w-[16ch]">{t("title")}</h2>
            <p className="t-lead reveal prose-measure mt-5 text-tinta-900" style={delay(80)}>
              {t("lead")}
            </p>
          </div>
          <div className="loc-map relative mx-auto mt-10 aspect-[993/1284] w-full max-w-[26rem] overflow-hidden md:mt-12 lg:mt-0 lg:max-w-none">
            <div data-loc-state className="loc-state absolute inset-0">
              <Image src="/img/mapa-quintana-roo.webp" alt="" aria-hidden fill sizes="(min-width:1024px) 40vw, 420px" className="object-cover" />
            </div>
            <div data-loc-local className="loc-local absolute inset-0">
              <Image src="/img/mapa-ubicacion.webp" alt="" aria-hidden fill sizes="40vw" className="object-cover" />
            </div>
          </div>
          <ul className="loc-list mt-8 grid divide-y divide-tinta-900/20 md:mt-10 md:grid-cols-3 md:divide-x md:divide-y-0 lg:mt-0">
            {FEATURED.map(({ key, Icon }) => {
              const min = times.find((x) => x.key === key)?.min ?? 0;
              return (
                <li key={key} data-loc-item className="flex items-center gap-4 py-4 md:px-8 md:py-2 md:first:pl-0 md:last:pr-0">
                  <Icon size={28} weight="light" className="shrink-0 text-tierra-700" aria-hidden />
                  <span className="flex-1">{t(key)}</span>
                  <span className="loc-min num shrink-0 font-semibold text-tierra-700">{t("minutes", { n: String(min).padStart(2, "0") })}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-10 lg:mt-12">
        <MapaUbicacion />
      </div>

      <div className="wrap mt-10 lg:mt-12">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
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
