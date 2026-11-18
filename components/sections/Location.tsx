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
 * Capitulo 2, ubicacion. Sin efecto de scroll: H2 + lead y las tres distancias, un solo mapa ilustrado segun el
 * dispositivo (movil: Quintana Roo; escritorio: mapa local a ancho de contenedor) y el Google Maps embebido.
 */
export function Location() {
  const t = useTranslations("location");
  return (
    <section id="ubicacion" data-scene="location" className="section bg-arena-100">
      <div className="wrap grid items-center gap-10 lg:grid-cols-12 lg:gap-x-16">
        <div className="lg:col-span-6">
          <h2 className="t-h2 display reveal max-w-[16ch]">{t("title")}</h2>
          <p className="t-lead reveal prose-measure mt-5 text-tinta-900" style={delay(80)}>
            {t("lead")}
          </p>
        </div>
        <ul className="grid divide-y divide-tinta-900/20 lg:col-span-6">
          {FEATURED.map(({ key, Icon }) => {
            const min = times.find((x) => x.key === key)?.min ?? 0;
            return (
              <li key={key} className="flex items-center gap-4 py-4">
                <Icon size={28} weight="light" className="shrink-0 text-tierra-700" aria-hidden />
                <span className="flex-1">{t(key)}</span>
                <span className="num shrink-0 font-display text-4xl text-tierra-700">{t("minutes", { n: String(min).padStart(2, "0") })}</span>
              </li>
            );
          })}
        </ul>
        {/* Solo movil: el mapa de Quintana Roo. En escritorio se ve el mapa local de abajo. */}
        <div className="relative mx-auto aspect-[993/1284] w-full max-w-[26rem] overflow-hidden lg:hidden">
          <Image src="/img/mapa-quintana-roo.webp" alt="" aria-hidden fill sizes="420px" className="object-cover" />
        </div>
      </div>

      {/* Solo escritorio: el mapa local a ancho de contenedor. En movil se ve el de Quintana Roo de arriba. */}
      <div className="wrap mt-10 hidden lg:mt-12 lg:block">
        <div className="relative aspect-[3600/2026] w-full overflow-hidden">
          <Image src="/img/mapa-ubicacion.webp" alt="" aria-hidden fill sizes="(min-width:1360px) 1280px, 100vw" className="object-cover" />
        </div>
      </div>


      <div className="wrap mt-10 grid items-center gap-8 lg:mt-12 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-8 lg:col-start-5 lg:row-start-1">
          <MapaUbicacion />
        </div>
        <div className="lg:col-span-4 lg:col-start-1 lg:row-start-1">
          <span aria-hidden className="block h-px w-10 bg-tierra-600" />
          <p className="mt-4 text-tinta-900">{t("address")}</p>
          <a href={geo.placeUrl} target="_blank" rel="noopener" className="link-action mt-4">
            {t("openMaps")}
            <span className="sr-only"> {t("newTab")}</span>
            <ArrowUpRight size={18} aria-hidden />
          </a>
          <p className="t-small mt-6 max-w-[40ch] text-tinta-900/80">{t("note")}</p>
        </div>
      </div>
    </section>
  );
}
