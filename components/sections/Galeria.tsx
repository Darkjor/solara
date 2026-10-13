"use client";
// "use client": mosaico con visor. El visor es un <dialog> modal nativo: el
// navegador atrapa el foco dentro, cierra con Esc y lo devuelve al cerrar; aqui se
// suman flechas, deslizamiento tactil y el regreso explicito del foco al boton que
// lo abrio. Sin addEventListener("scroll"). Movil: el mismo marcado es una tira con
// scroll-snap (carrusel con swipe); desde 768 px es un mosaico de celdas exactas.

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/**
 * Mosaico: dos filas "justificadas" sobre una rejilla de 33 columnas. Cada fila reparte
 * su ancho en proporcion al formato de sus fotos (vertical 0.68, horizontal 1.89,
 * interior 0.77): las celdas llenan el ancho sin huecos y casi sin recorte. Fila 1:
 * 5 + 14 + 14 = 33. Fila 2: 18 + 7 + 8 = 33. La altura de cada fila sale de la suma de
 * formatos de la fila (4.46 y 3.34), ver `.gal-grid` en globals.css. `n` es el numero
 * de la foto en `gallery.alt{n}`.
 */
const CELLS = [
  { n: 5, src: "/img/render-fachada-5-vertical.webp", w: 1478, h: 2170, col: "1 / span 5", row: 1 },
  { n: 1, src: "/img/render-fachada-1.webp", w: 1920, h: 1016, col: "6 / span 14", row: 1 },
  { n: 3, src: "/img/render-fachada-3.webp", w: 1920, h: 1016, col: "20 / span 14", row: 1 },
  { n: 2, src: "/img/render-fachada-2.webp", w: 1920, h: 1016, col: "1 / span 18", row: 2 },
  { n: 4, src: "/img/render-fachada-4-vertical.webp", w: 1478, h: 2170, col: "19 / span 7", row: 2 },
  { n: 6, src: "/img/interior-ilustrativo.webp", w: 993, h: 1284, col: "26 / span 8", row: 2 },
] as const;

export function Galeria() {
  const t = useTranslations("gallery");
  const ta = useTranslations("a11y");
  const dlg = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const swipe = useRef<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const d = dlg.current;
    if (open !== null && d && !d.open) d.showModal();
  }, [open]);

  const alt = (n: number) => t(`alt${n}` as "alt1");
  const step = (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + CELLS.length) % CELLS.length));
  const cur = open === null ? null : CELLS[open];

  function onKeyDown(e: KeyboardEvent<HTMLDialogElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    step(e.key === "ArrowRight" ? 1 : -1);
  }
  // Deslizar con el dedo cambia de foto (solo tactil).
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === "touch") swipe.current = e.clientX;
  };
  const onUp = (e: PointerEvent) => {
    const x = swipe.current;
    swipe.current = null;
    if (x === null) return;
    const dx = e.clientX - x;
    if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
  };

  return (
    <section id="galeria" data-scene="gallery" className="on-dark bg-selva-950 py-[clamp(40px,5.5vw,80px)] text-hueso">
      <div className="wrap grid gap-8 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-6">
        <h2 className="t-h2 display reveal lg:col-span-3 lg:col-start-1 lg:row-start-1">{t("title")}</h2>
        <div className="gal-wrap lg:col-span-9 lg:col-start-4 lg:row-span-2 lg:row-start-1">
          <ul className="gal-grid">
            {CELLS.map((c, i) => (
              <li
                key={c.n}
                className="gal-cell reveal"
                style={{ ...delay(i * 70), ["--ar" as string]: `${c.w}/${c.h}`, gridColumn: c.col, gridRow: c.row } as CSSProperties}
              >
                <button
                  type="button"
                  className="gal-open"
                  aria-haspopup="dialog"
                  aria-label={`${t("open")}: ${alt(c.n)}`}
                  onClick={(e) => {
                    trigger.current = e.currentTarget;
                    setOpen(i);
                  }}
                >
                  <Image src={c.src} alt="" fill sizes="(min-width:1024px) 40vw, (min-width:768px) 60vw, 460px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <p className="t-small reveal max-w-[34ch] text-hueso/80 lg:col-span-3 lg:col-start-1 lg:row-start-2 lg:self-end" style={delay(120)}>
          {t("caption")}
        </p>
      </div>

      <dialog
        ref={dlg}
        className="gal-viewer on-dark"
        aria-label={t("title")}
        onKeyDown={onKeyDown}
        onClose={() => {
          setOpen(null);
          trigger.current?.focus();
        }}
      >
        {cur && open !== null && (
          <div className="gal-view">
            <div className="gal-top">
              <button type="button" className="gal-btn" aria-label={ta("close")} onClick={() => dlg.current?.close()}>
                <X size={22} aria-hidden />
              </button>
              <p className="t-small" aria-live="polite">
                {t("counter", { n: open + 1, total: CELLS.length })}
              </p>
            </div>
            <div
              className="gal-stage"
              onPointerDown={onDown}
              onPointerUp={onUp}
              onClick={(e) => {
                if (e.target === e.currentTarget) dlg.current?.close();
              }}
            >
              <Image key={open} src={cur.src} alt={alt(cur.n)} width={cur.w} height={cur.h} sizes="96vw" draggable={false} className="gal-img" />
              <button type="button" className="gal-btn gal-prev" aria-label={t("prev")} onClick={() => step(-1)}>
                <CaretLeft size={22} aria-hidden />
              </button>
              <button type="button" className="gal-btn gal-next" aria-label={t("next")} onClick={() => step(1)}>
                <CaretRight size={22} aria-hidden />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
