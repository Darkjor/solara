"use client";
// "use client": resalta el hotspot al pasar o enfocar una fila de los 3 datos (y
// viceversa). En tactil se activa con el toque en la fila. Los datos con minutos
// son el contenido real; el mapa es apoyo visual.

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Anchor, Lighthouse, Umbrella, type Icon } from "@phosphor-icons/react";
import { times } from "@/lib/site";

type Featured = "beach" | "lighthouse" | "dock";

/** Los tres datos del destino, en el orden en que entran en cascada. */
const FEATURED: { key: Featured; Icon: Icon }[] = [
  { key: "beach", Icon: Umbrella },
  { key: "lighthouse", Icon: Lighthouse },
  { key: "dock", Icon: Anchor },
];

export function LocationMap({ head }: { head: ReactNode }) {
  const t = useTranslations("location");
  const [active, setActive] = useState<Featured | null>(null);
  const spots = FEATURED.map((f) => {
    const p = times.find((x) => x.key === f.key);
    return { key: f.key, Icon: f.Icon, min: p?.min ?? 0, x: p?.x ?? 0, y: p?.y ?? 0 };
  });

  return (
    <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1">
        {head}
        <ul className="mt-8 grid gap-2">
          {spots.map(({ key, Icon, min }) => (
            <li key={key}>
              <button
                type="button"
                data-time-row={key}
                data-min={min}
                onMouseEnter={() => setActive(key)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(key)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(active === key ? null : key)}
                className={`flex min-h-14 w-full items-center gap-4 rounded-lg px-2 py-2 text-left transition-colors hover:bg-tierra-100 ${active === key ? "bg-tierra-100" : ""}`}
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-tierra-600 text-white">
                  <Icon size={22} weight="light" aria-hidden />
                </span>
                <span className="flex-1">{t(key)}</span>
                <span className="num shrink-0 font-semibold text-tierra-600">{t("minutes", { n: String(min).padStart(2, "0") })}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="location-map relative self-start overflow-hidden rounded-lg bg-selva-950 lg:col-span-7 lg:col-start-1 lg:row-start-1" data-map>
        <Image src="/img/mapa-ubicacion.webp" alt={t("mapAlt")} width={3600} height={2026} sizes="(min-width:1024px) 58vw, 100vw" className="location-local h-auto w-full" />
        {/* Mapa regional del brochure: solo lo muestra la escena M4 (clase scene-live). */}
        <div className="location-regional" aria-hidden>
          <Image src="/img/mapa-quintana-roo.webp" alt="" fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover object-[50%_63%]" />
        </div>
        <ul aria-hidden className="absolute inset-0">
          {spots.map((x) => (
            <li key={x.key} data-hotspot={x.key} data-min={x.min} className="absolute" style={{ left: `${x.x}%`, top: `${x.y}%` }}>
              <span
                className={`block size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-tierra-300/80 transition-transform duration-200 ${
                  active === x.key ? "scale-[1.6] bg-tierra-300" : ""
                }`}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
