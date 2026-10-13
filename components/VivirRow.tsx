"use client";
// "use client": la fila de Vivir lleva el estado de las flechas (inicio y fin de
// la fila), el arrastre con mouse y el avance de una tarjeta por flecha. Sin JS
// queda una fila desplazable con scroll-snap nativo (las flechas se muestran solo
// con JS: `.vivir-nav` cuelga de `.reveal-ready`). Sin addEventListener("scroll"):
// los extremos se leen con IntersectionObserver sobre la primera y la ultima tarjeta.

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";

type Props = { title: string; prev: string; next: string; children: ReactNode };

export function VivirRow({ title, prev, next, children }: Props) {
  const row = useRef<HTMLUListElement>(null);
  const drag = useRef<{ x: number; left: number; id: number } | null>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = row.current;
    const first = el?.firstElementChild;
    const last = el?.lastElementChild;
    if (!el || !first || !last || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const full = e.intersectionRatio >= 0.98;
          if (e.target === first) setEdge((s) => (s.start === full ? s : { ...s, start: full }));
          if (e.target === last) setEdge((s) => (s.end === full ? s : { ...s, end: full }));
        }
      },
      { root: el, threshold: [0.98] },
    );
    io.observe(first);
    io.observe(last);
    return () => io.disconnect();
  }, []);

  /** Una tarjeta por clic; con movimiento reducido, sin desplazamiento suave. */
  function go(dir: 1 | -1) {
    const el = row.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card || (dir < 0 ? edge.start : edge.end)) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: smooth ? "smooth" : "auto" });
  }

  // Arrastre solo con mouse; en tactil manda el desplazamiento nativo. Mientras se
  // arrastra se apaga el snap (data-dragging) y al soltar el navegador reajusta.
  function onDown(e: PointerEvent<HTMLUListElement>) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, id: e.pointerId };
  }
  function onMove(e: PointerEvent<HTMLUListElement>) {
    const d = drag.current;
    if (!d) return;
    const el = e.currentTarget;
    const dx = e.clientX - d.x;
    if (!el.hasAttribute("data-dragging")) {
      if (Math.abs(dx) < 5) return;
      el.setPointerCapture(d.id);
      el.setAttribute("data-dragging", "");
    }
    el.scrollLeft = d.left - dx;
  }
  function onEnd(e: PointerEvent<HTMLUListElement>) {
    const el = e.currentTarget;
    const d = drag.current;
    drag.current = null;
    el.removeAttribute("data-dragging");
    if (d && el.hasPointerCapture(d.id)) el.releasePointerCapture(d.id);
  }

  return (
    <>
      <div className="wrap flex items-end justify-between gap-6">
        <h2 id="vivir-title" className="t-h2 display reveal">
          {title}
        </h2>
        <div className="vivir-nav">
          <button type="button" className="vivir-btn" aria-label={prev} aria-controls="vivir-row" aria-disabled={edge.start} onClick={() => go(-1)}>
            <ArrowLeft size={22} aria-hidden />
          </button>
          <button type="button" className="vivir-btn" aria-label={next} aria-controls="vivir-row" aria-disabled={edge.end} onClick={() => go(1)}>
            <ArrowRight size={22} aria-hidden />
          </button>
        </div>
      </div>
      <ul
        id="vivir-row"
        ref={row}
        tabIndex={0}
        aria-labelledby="vivir-title"
        className="vivir-row"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onEnd}
        onPointerCancel={onEnd}
      >
        {children}
      </ul>
    </>
  );
}
