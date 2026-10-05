"use client";

import { useSyncExternalStore } from "react";

/**
 * Carga GSAP + ScrollTrigger bajo demanda (import dinámico): no entra al
 * JavaScript inicial de la página, así no afecta el LCP.
 */
let watching = false;

export async function loadGsap() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
  gsap.registerPlugin(ScrollTrigger);
  // ScrollTrigger mide posiciones una vez; si después cambia el alto de la
  // página (p. ej. el carrusel horizontal calcula su altura), las posiciones
  // quedan viejas y los efectos arrancan tarde. Se re-mide al cambiar el alto.
  if (!watching) {
    watching = true;
    let last = document.body.scrollHeight;
    let t = 0;
    new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (h === last) return;
      last = h;
      window.clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    }).observe(document.body);
  }
  return { gsap, ScrollTrigger };
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * true en el navegador si se permiten animaciones; false en el servidor (el
 * HTML inicial trae la versión estática) y con movimiento reducido.
 */
export function useAnimationsEnabled() {
  return useSyncExternalStore(subscribe, () => !window.matchMedia(REDUCE).matches, () => false);
}
