"use client";
// "use client": monta los iframes de Google Maps solo cuando la seccion esta a
// 600 px del viewport (0 peticiones a maps.google.com antes), alterna Mapa y
// Satelite (un solo mapa) y evita secuestrar el scroll: el mapa
// no recibe gestos hasta pulsar "Activar mapa" (se suelta al salir el puntero,
// con Esc o al tocar fuera). La ilustracion estatica es la fachada de carga y el
// respaldo si el iframe no emite `load` en 8 s.

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { geo } from "@/lib/site";

type Kind = "m" | "k";
const src = (k: Kind) => `https://maps.google.com/maps?q=${geo.lat},${geo.lng}&z=16&t=${k}&output=embed`;
const HEIGHT = "h-[380px] lg:h-[clamp(420px,36vw,560px)]";

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
        sizes="(min-width:1024px) 66vw, 100vw"
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

/** Un solo mapa: la vista satelital de Google, montada al acercarse a la seccion. Ocupa el ancho de su contenedor. */
export function MapaUbicacion() {
  const t = useTranslations("location");
  const root = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

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

  return (
    <div ref={root}>
      <Panel kind="k" live={near} title={t("satTitle")} activate={t("activate")} />
    </div>
  );
}
