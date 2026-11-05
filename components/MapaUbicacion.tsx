"use client";
// "use client": monta los iframes de Google Maps solo cuando la seccion esta a
// 600 px del viewport (0 peticiones a maps.google.com antes), alterna Mapa y
// Satelite en movil (un solo mapa cargado) y evita secuestrar el scroll: el mapa
// no recibe gestos hasta pulsar "Activar mapa" (se suelta al salir el puntero,
// con Esc o al tocar fuera). La ilustracion estatica es la fachada de carga y el
// respaldo si el iframe no emite `load` en 8 s.

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { geo } from "@/lib/site";

type Kind = "m" | "k";
const src = (k: Kind) => `https://maps.google.com/maps?q=${geo.lat},${geo.lng}&z=16&t=${k}&output=embed`;
const HEIGHT = "h-[380px] lg:h-[clamp(420px,40vw,600px)]";

function Panel({ kind, live, title, activate }: { kind: Kind; live: boolean; title: string; activate: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Si el iframe no responde en 8 s se queda la ilustracion.
  useEffect(() => {
    if (!live || loaded) return;
    const t = window.setTimeout(() => setFailed(true), 8000);
    return () => window.clearTimeout(t);
  }, [live, loaded]);

  const release = useCallback(() => setActive(false), []);
  useEffect(() => {
    if (!active) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && release();
    const outside = (e: Event) => !box.current?.contains(e.target as Node) && release();
    window.addEventListener("keydown", esc);
    document.addEventListener("touchstart", outside, { passive: true });
    return () => {
      window.removeEventListener("keydown", esc);
      document.removeEventListener("touchstart", outside);
    };
  }, [active, release]);

  const showFrame = live && !failed;
  return (
    <div ref={box} onMouseLeave={release} className={`relative w-full overflow-hidden bg-selva-900 ${HEIGHT}`}>
      <Image
        src="/img/mapa-ubicacion.webp"
        alt=""
        aria-hidden
        fill
        sizes="(min-width:1024px) 50vw, 100vw"
        className="object-cover"
      />
      {showFrame && (
        <iframe
          src={src(kind)}
          title={title}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 size-full border-0 transition-opacity duration-[400ms] ${loaded ? "opacity-100" : "opacity-0"} ${active ? "" : "pointer-events-none"}`}
        />
      )}
      {showFrame && loaded && !active && (
        <button type="button" onClick={() => setActive(true)} aria-label={activate} className="absolute inset-0 cursor-pointer focus-visible:outline-offset-[-4px]" />
      )}
    </div>
  );
}

export function MapaUbicacion() {
  const t = useTranslations("location");
  const root = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [wide, setWide] = useState(false);
  const [tab, setTab] = useState<Kind>("m");

  useEffect(() => {
    const mq = window.matchMedia("(min-width:1024px)");
    const upd = () => setWide(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const tabs: { k: Kind; label: string }[] = [
    { k: "m", label: t("tabMap") },
    { k: "k", label: t("tabSat") },
  ];
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next: Kind = tab === "m" ? "k" : "m";
    setTab(next);
    document.getElementById(`mapa-tab-${next}`)?.focus();
  };

  return (
    <div ref={root}>
      {/* Escritorio: dos paneles a sangre, 6 px de superficie entre ellos. */}
      <div className="hidden gap-[6px] lg:grid lg:grid-cols-2">
        {tabs.map(({ k, label }) => (
          <div key={k}>
            <Panel kind={k} live={near && wide} title={k === "m" ? t("mapTitle") : t("satTitle")} activate={t("activate")} />
            <p className="wrap !max-w-none pt-2 text-[0.8125rem] text-tinta-900/80">{label}</p>
          </div>
        ))}
      </div>

      {/* Movil: un solo mapa, con selector Mapa | Satelite. */}
      <div className="lg:hidden">
        <div role="tablist" aria-label={t("tabs")} onKeyDown={onKey} className="wrap flex gap-2 pb-4">
          {tabs.map(({ k, label }) => (
            <button
              key={k}
              id={`mapa-tab-${k}`}
              role="tab"
              type="button"
              aria-selected={tab === k}
              aria-controls="mapa-panel"
              tabIndex={tab === k ? 0 : -1}
              onClick={() => setTab(k)}
              className={`min-h-11 flex-1 rounded-lg border px-4 text-[0.9375rem] font-semibold transition-colors ${
                tab === k ? "border-tierra-600 bg-tierra-600 text-white" : "border-tinta-900/40 text-tinta-900 hover:bg-tinta-900/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div id="mapa-panel" role="tabpanel" aria-labelledby={`mapa-tab-${tab}`}>
          <Panel key={tab} kind={tab} live={near && !wide} title={tab === "m" ? t("mapTitle") : t("satTitle")} activate={t("activate")} />
        </div>
      </div>
    </div>
  );
}
