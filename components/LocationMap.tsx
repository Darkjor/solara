"use client";
// "use client": resalta el hotspot al pasar o enfocar una fila de la lista (y
// viceversa). En táctil se activa con el toque en la fila. La lista de tiempos
// es el contenido real; el mapa es apoyo visual.

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { site, timeGroups, times, type TimeKey } from "@/lib/site";

export function LocationMap() {
  const t = useTranslations("location");
  const [active, setActive] = useState<TimeKey | null>(null);
  const byKey = Object.fromEntries(times.map((x) => [x.key, x])) as Record<TimeKey, (typeof times)[number]>;

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-8">
      <div className="location-map stone-soft relative self-start overflow-hidden bg-selva-950 lg:col-span-8" data-map>
        <Image src="/img/mapa-ubicacion.webp" alt={t("mapAlt")} width={3600} height={2026} sizes="(min-width:1024px) 66vw, 100vw" className="h-auto w-full" />
        <ul aria-hidden className="absolute inset-0">
          {times.map((x) => (
            <li
              key={x.key}
              data-hotspot={x.key}
              className="absolute"
              style={{ left: `${x.x}%`, top: `${x.y}%` }}
            >
              <span
                className={`block size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-tierra-300/80 transition-transform duration-200 ${
                  active === x.key ? "scale-[1.6] bg-tierra-300" : ""
                }`}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-4">
        <h3 className="display t-h3">{t("nearbyTitle")}</h3>
        <div className="mt-5 grid gap-6">
          {timeGroups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "border-t border-tinta-900/12 pt-5" : ""}>
              <p className="t-small font-semibold text-tinta-600">{t(`group${gi + 1}` as "group1")}</p>
              <ul className="mt-2">
                {group.map((k) => (
                  <li key={k}>
                    <button
                      type="button"
                      data-time-row={k}
                      onMouseEnter={() => setActive(k)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(k)}
                      onBlur={() => setActive(null)}
                      onClick={() => setActive(active === k ? null : k)}
                      className={`flex min-h-11 w-full items-baseline justify-between gap-4 rounded-lg px-2 py-2 text-left transition-colors hover:bg-tierra-100 ${active === k ? "bg-tierra-100" : ""}`}
                    >
                      <span>{t(k)}</span>
                      <span className="num shrink-0 font-semibold text-tierra-600">{t("minutes", { n: String(byKey[k].min).padStart(2, "0") })}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="sr-only">{site.city}</p>
      </div>
    </div>
  );
}
