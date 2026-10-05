"use client";
// "use client": control deslizante manejado por la persona. Es aritmética
// sobre el precio de lista 2026 ($4,450 MXN/m2). Sin JS se ve la tabla de dos
// filas (noscript). La fase 2 puede animarlo antes de que la persona lo toque
// con el evento "solara:calc" (detail = m2); en cuanto se toca, manda el usuario.

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatMXN } from "@/lib/format";
import { lotMax, lotMin, pricePerM2 } from "@/lib/site";
import { SURFACE_EVENT } from "@/components/LeadForm";

export const CALC_EVENT = "solara:calc";

export function LotCalculator() {
  const t = useTranslations("lots");
  const locale = useLocale();
  const id = useId();
  const [area, setArea] = useState<number>(lotMin);
  const [announce, setAnnounce] = useState("");
  const touched = useRef(false);
  const timer = useRef<number>(0);

  useEffect(() => {
    const on = (e: Event) => {
      if (touched.current) return;
      const v = Number((e as CustomEvent<number>).detail);
      if (v >= lotMin && v <= lotMax) setArea(Math.round(v));
    };
    window.addEventListener(CALC_EVENT, on);
    return () => window.removeEventListener(CALC_EVENT, on);
  }, []);

  const price = area * pricePerM2;
  const sqft = Math.round((area * 10.7639) / 5) * 5;
  const fmt = (n: number) => formatMXN(n, locale);

  function change(v: number) {
    touched.current = true;
    setArea(v);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAnnounce(`${v} m², ${fmt(v * pricePerM2)} MXN`), 400);
  }

  return (
    <div data-calc className="mt-12 border-t border-tinta-900/12 pt-8">
      <h3 className="display t-h3">{t("calcTitle")}</h3>

      <div className="mt-4 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label htmlFor={id} className="sr-only">
            {t("calcSlider")}
          </label>
          <div className="flex items-baseline justify-between">
            <span className="num display text-[2rem] leading-none">{area} m²</span>
            <span className="t-small num text-tinta-600">{t("calcSqft", { n: sqft.toLocaleString(locale === "en" ? "en-US" : "es-MX") })}</span>
          </div>
          <input
            id={id}
            data-calc-slider
            type="range"
            className="slider mt-2"
            min={lotMin}
            max={lotMax}
            step={1}
            value={area}
            onChange={(e) => change(Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "PageUp") {
                e.preventDefault();
                change(Math.min(lotMax, area + 10));
              }
              if (e.key === "PageDown") {
                e.preventDefault();
                change(Math.max(lotMin, area - 10));
              }
            }}
            aria-valuetext={`${area} m²`}
          />
          <div className="t-small num flex justify-between text-tinta-600" aria-hidden>
            <span>{lotMin} m²</span>
            <span>{lotMax} m²</span>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="t-small font-semibold text-tinta-900">{t("calcResult")}</p>
          <p data-calc-price className="display num text-[2.25rem] leading-tight text-tierra-600 sm:text-[2.75rem]">
            {fmt(price)} <span className="text-[1.125rem]">MXN</span>
          </p>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
      <noscript>
        <ul className="t-small mt-3">
          <li>{t("calcStatic1")}</li>
          <li>{t("calcStatic2")}</li>
        </ul>
      </noscript>

      <p className="t-small prose-measure mt-4 text-tinta-900">{t("calcNote")}</p>

      <Link
        href={{ pathname: "/", hash: "cotiza" }}
        onClick={() => window.dispatchEvent(new CustomEvent(SURFACE_EVENT, { detail: area }))}
        className="btn btn-primary mt-6"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
