"use client";
// "use client": visor del plano maestro con zoom y arrastre. La rueda solo hace
// zoom con Ctrl/Cmd (no secuestra el scroll de la página). El arrastre y el
// zoom mutan `style.transform` por ref (sin re-render por cada movimiento).
// Zoom 1 a 4 con botones, teclado (flechas, + y -, 0) y pantalla completa.

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowsOutSimple, ArrowsInSimple, CornersOut, MagnifyingGlassMinus, MagnifyingGlassPlus, WarningCircle } from "@phosphor-icons/react";
import { whatsappLink } from "@/lib/whatsapp";

const MIN = 1;
const MAX = 4;

export function PlanViewer({ children }: { children?: React.ReactNode }) {
  const t = useTranslations("availability");
  const wrap = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const st = useRef({ s: 1, x: 0, y: 0 });
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [full, setFull] = useState(false);

  const apply = useCallback(() => {
    const el = layer.current;
    const box = wrap.current;
    if (!el || !box) return;
    const s = st.current;
    const maxX = ((s.s - 1) * box.clientWidth) / 2;
    const maxY = ((s.s - 1) * box.clientHeight) / 2;
    s.x = Math.max(-maxX, Math.min(maxX, s.x));
    s.y = Math.max(-maxY, Math.min(maxY, s.y));
    el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) scale(${s.s})`;
    setZoom(s.s);
  }, []);

  const zoomBy = useCallback(
    (factor: number, px = 0, py = 0) => {
      const s = st.current;
      const next = Math.max(MIN, Math.min(MAX, s.s * factor));
      const k = next / s.s;
      s.x = px - (px - s.x) * k;
      s.y = py - (py - s.y) * k;
      s.s = next;
      if (next === MIN) {
        s.x = 0;
        s.y = 0;
      }
      apply();
    },
    [apply],
  );

  const fit = useCallback(() => {
    st.current = { s: 1, x: 0, y: 0 };
    apply();
  }, [apply]);

  // Rueda: solo con Ctrl/Cmd (listener no pasivo para poder cancelar el zoom del navegador).
  useEffect(() => {
    const box = wrap.current;
    if (!box) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = box.getBoundingClientRect();
      zoomBy(e.deltaY < 0 ? 1.2 : 1 / 1.2, e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2);
    };
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => box.removeEventListener("wheel", onWheel);
  }, [zoomBy]);

  useEffect(() => {
    const on = () => {
      setFull(document.fullscreenElement === wrap.current);
      requestAnimationFrame(fit);
    };
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, [fit]);

  function toggleFull() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void wrap.current?.requestFullscreen?.();
  }

  const btn =
    "inline-flex size-11 items-center justify-center rounded-full bg-hueso text-selva-900 shadow-[var(--e1)] transition-colors hover:bg-white disabled:opacity-40 aria-disabled:opacity-40";

  return (
    <div
      ref={wrap}
      data-plan-viewer
      data-zoomed={zoom > 1}
      role="group"
      aria-roledescription={t("viewerLabel")}
      aria-label={t("mapAlt")}
      tabIndex={0}
      onKeyDown={(e) => {
        const step = 48;
        if (e.key === "+" || e.key === "=") zoomBy(1.25);
        else if (e.key === "-") zoomBy(1 / 1.25);
        else if (e.key === "0") fit();
        else if (e.key.startsWith("Arrow")) {
          if (e.key === "ArrowLeft") st.current.x += step;
          if (e.key === "ArrowRight") st.current.x -= step;
          if (e.key === "ArrowUp") st.current.y += step;
          if (e.key === "ArrowDown") st.current.y -= step;
          apply();
        }
        else return;
        e.preventDefault();
      }}
      onDoubleClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        if (st.current.s >= 2) fit();
        else zoomBy(2, e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2);
      }}
      onPointerDown={(e) => {
        if (st.current.s <= 1 && e.pointerType !== "mouse") return;
        drag.current = { px: e.clientX, py: e.clientY, x: st.current.x, y: st.current.y };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        st.current.x = drag.current.x + e.clientX - drag.current.px;
        st.current.y = drag.current.y + e.clientY - drag.current.py;
        apply();
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      className={`plan-viewer group relative aspect-[1694/1165] w-full select-none max-sm:aspect-[4/3] lg:aspect-[1.62] overflow-hidden rounded-lg bg-selva-950 ${zoom > 1 ? "cursor-grab touch-none active:cursor-grabbing" : "touch-pan-y"} ${full ? "!aspect-auto h-dvh rounded-none" : ""}`}
    >
      {!loaded && !failed && (
        <div role="status" aria-label={t("loading")} className="absolute inset-0 animate-pulse bg-selva-900" />
      )}
      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-hueso">
          <WarningCircle size={32} aria-hidden />
          <p>{t("error")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="btn btn-secondary-dark"
              onClick={() => {
                setFailed(false);
                setLoaded(false);
                setAttempt((a) => a + 1);
              }}
            >
              {t("retry")}
            </button>
            <a className="link-action" href={whatsappLink(t("wa"))} target="_blank" rel="noopener noreferrer">
              {t("cta")}
            </a>
          </div>
        </div>
      )}

      <div ref={layer} data-plan-layer className="absolute inset-0 origin-center bg-selva-950 will-change-transform">
        {!failed && (
          <Image
            key={attempt}
            src="/img/plano-maestro-recorte.webp"
            alt=""
            fill
            unoptimized
            sizes="(min-width:1024px) 70vw, 100vw"
            draggable={false}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className="pointer-events-none object-cover object-[50%_58%] mix-blend-lighten max-sm:object-contain"
          />
        )}
      </div>

      <div className="transition-opacity duration-300 group-data-[zoomed=true]:pointer-events-none group-data-[zoomed=true]:opacity-0">{children}</div>

      <div data-plan-controls className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button type="button" className={btn} onClick={() => zoomBy(1.4)} aria-label={t("zoomIn")} aria-disabled={zoom >= MAX}>
          <MagnifyingGlassPlus size={22} aria-hidden />
        </button>
        <button type="button" className={btn} onClick={() => zoomBy(1 / 1.4)} aria-label={t("zoomOut")} aria-disabled={zoom <= MIN}>
          <MagnifyingGlassMinus size={22} aria-hidden />
        </button>
        <button type="button" className={btn} onClick={fit} aria-label={t("fit")}>
          <CornersOut size={22} aria-hidden />
        </button>
        <button type="button" className={btn} onClick={toggleFull} aria-label={t("full")}>
          {full ? <ArrowsInSimple size={22} aria-hidden /> : <ArrowsOutSimple size={22} aria-hidden />}
        </button>
      </div>
    </div>
  );
}
