"use client";
// "use client": controlador de los momentos de scroll (spec 4.2, M1 a M5). GSAP y
// ScrollTrigger entran con import() dinámico cuando el navegador queda libre,
// nunca en el JS inicial. Todo vive en un gsap.matchMedia(): al cambiar el
// tamaño o la preferencia de movimiento reducido se revierte y se vuelve a armar.
//
// Regla de oro: ningún contenido queda oculto por defecto. Los estados ocultos
// los pone este archivo, ya con GSAP cargado; si no carga, la página está completa.
// El intro del hero (M0) es CSS puro y lo activa el script del <head>.

import { useEffect } from "react";
import { loadGsap } from "@/lib/gsap";
import { CALC_EVENT } from "@/components/LotCalculator";
import { lotCount, lotMax, lotMin } from "@/lib/site";

const q = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector<T>(s);
const qa = <T extends HTMLElement = HTMLElement>(s: string) => Array.from(document.querySelectorAll<T>(s));

export function Scenes() {
  useEffect(() => {
    let cancelled = false;
    let revert = () => {};

    async function arm() {
      const { gsap, ScrollTrigger } = await loadGsap();
      if (cancelled) return;
      ScrollTrigger.config({ ignoreMobileResize: true });
      const mm = gsap.matchMedia();

      mm.add({ motion: "(prefers-reduced-motion: no-preference)", wide: "(min-width: 1024px) and (min-height: 640px)" }, (ctx) => {
        const { motion, wide } = ctx.conditions as { motion: boolean; wide: boolean };
        if (!motion) return;
        const undo: Array<() => void> = [];

        /* M1. Concepto en tres tiempos (solo desktop). */
        const concept = q("[data-scene=concept]");
        const track = q("[data-concept-track]");
        const stage = q(".concept-stage");
        if (wide && concept && track && stage) {
          concept.classList.add("scene-live");
          stage.dataset.step = "1";
          const photos = qa("[data-photo]");
          const segs = qa(".concept-seg-fill");
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: track, start: "top top", end: "bottom bottom", scrub: 0.5 },
          });
          segs.forEach((seg, i) => tl.fromTo(seg, { scaleX: 0 }, { scaleX: 1, duration: 1 / 3 }, i / 3));
          [1, 2].forEach((i) => {
            const at = i / 3 - 0.05;
            tl.fromTo(photos[i], { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.12, ease: "power2.inOut" }, at);
            tl.fromTo(photos[i].querySelector("img"), { scale: 1.14 }, { scale: 1, duration: 0.16, ease: "power2.out" }, at);
          });
          ScrollTrigger.create({
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
              const n = self.progress < 0.29 ? 1 : self.progress < 0.62 ? 2 : 3;
              if (stage.dataset.step !== String(n)) stage.dataset.step = String(n);
            },
          });
          undo.push(() => {
            concept.classList.remove("scene-live");
            delete stage.dataset.step;
          });
        }

        /* M2. Lotes: barrido del medidor 180 a 255 y vuelta a 180 (solo desktop) y render revelado con la losa. */
        const calc = q("[data-calc]");
        if (wide && calc) {
          const up = gsap.parseEase("power1.inOut");
          const back = gsap.parseEase("power2.out");
          let last = lotMin;
          ScrollTrigger.create({
            trigger: calc,
            start: "top 92%",
            end: "top 38%",
            scrub: true,
            onUpdate: (self) => {
              const p = self.progress;
              const v = p < 0.7 ? lotMin + (lotMax - lotMin) * up(p / 0.7) : lotMax - (lotMax - lotMin) * back((p - 0.7) / 0.3);
              const r = Math.round(v);
              if (r === last) return;
              last = r;
              window.dispatchEvent(new CustomEvent(CALC_EVENT, { detail: r }));
            },
          });
        }
        const lotsFrame = q(".lots-frame");
        const lotsImg = q(".lots-img");
        if (lotsFrame && lotsImg) {
          const slabFrom = "polygon(8% 12%, 30% 9%, 70% 9%, 92% 12%, 94% 50%, 92% 88%, 70% 91%, 30% 91%, 8% 88%, 6% 50%)";
          const slabTo = "polygon(0% 0%, 30% 0%, 70% 0%, 100% 0%, 100% 50%, 100% 100%, 70% 100%, 30% 100%, 0% 100%, 0% 50%)";
          gsap.set(lotsFrame, { clipPath: slabFrom });
          gsap.set(lotsImg, { scale: 1.08 });
          ScrollTrigger.create({
            trigger: lotsFrame,
            start: "top 82%",
            once: true,
            onEnter: () => {
              gsap.to(lotsFrame, { clipPath: slabTo, duration: 1.1, ease: "power3.out", onComplete: () => gsap.set(lotsFrame, { clearProps: "clipPath" }) });
              gsap.to(lotsImg, { scale: 1, duration: 1.8, ease: "power3.out" });
            },
          });
        }

        /* M3. Apertura del isotipo: un rombo recorta la foto y se abre hasta llenar el marco. */
        const inv = q(".inv-img");
        const iso = q(".inv-iso");
        const invTrack = q(".inv-track");
        const invFig = q(".investment-photo");
        const invSection = q("[data-scene=investment]");
        if (inv && iso && invTrack && invFig) {
          // La pista de 160vh y el sticky solo existen con la escena armada (escritorio con movimiento).
          if (wide && invSection) {
            invSection.classList.add("scene-live");
            undo.push(() => invSection.classList.remove("scene-live"));
          }
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: wide
              ? { trigger: invTrack, start: "top top", end: "bottom bottom", scrub: 0.6 }
              : { trigger: invFig, start: "top 88%", end: "top 28%", scrub: 0.6 },
          });
          tl.fromTo(inv, { clipPath: "polygon(50% 36.5%, 69% 50%, 50% 63.5%, 31% 50%)" }, { clipPath: "polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)", duration: 1, ease: "power2.in" }, 0);
          tl.fromTo(iso, { opacity: 1, scale: 1 }, { opacity: 0, scale: 1.45, duration: 0.7, ease: "power1.in" }, 0.08);
          if (wide) tl.to({}, { duration: 0.25 });
        }

        /* M4. Mapa de Mahahual, una sola vez al entrar: acercamiento de 1.35 a 1 y hotspots y filas en cascada. */
        const loc = q("[data-scene=location]");
        const local = q(".location-local");
        const locMap = q(".location-map");
        if (loc && local && locMap) {
          const rows = qa("[data-time-row]");
          const spots = qa("[data-hotspot]");
          gsap.set(local, { scale: 1.35, transformOrigin: "53% 60%" });
          gsap.set(spots, { opacity: 0, scale: 0.4 });
          gsap.set(rows, { opacity: 0, y: 14 });
          const order = [...rows].sort((a, b) => Number(a.dataset.min) - Number(b.dataset.min));
          const tl = gsap.timeline({ paused: true });
          tl.to(local, { scale: 1, duration: 1.2, ease: "power2.out" }, 0);
          order.forEach((row, i) => {
            const at = 1.05 + i * 0.16;
            const spot = spots.find((sp) => sp.dataset.hotspot === row.dataset.timeRow);
            if (spot) tl.to(spot, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, at);
            tl.to(row, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, at);
          });
          ScrollTrigger.create({ trigger: locMap, start: "top 75%", once: true, onEnter: () => tl.play() });
        }

        /* M5. Barrido del plano, una vez, al 35% de visibilidad. */
        const viewer = q("[data-plan-viewer]");
        const layer = q("[data-plan-layer]");
        const controls = q("[data-plan-controls]");
        const counts = qa("[data-count]");
        if (viewer && layer) {
          gsap.set(layer, { clipPath: "inset(0% 100% 0% 0%)" });
          if (controls) controls.inert = true;
          counts.forEach((c) => (c.textContent = "0"));
          ScrollTrigger.create({
            trigger: viewer,
            start: "top 65%",
            once: true,
            onEnter: () => {
              gsap.to(layer, {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.4,
                ease: "power2.inOut",
                onComplete: () => {
                  gsap.set(layer, { clearProps: "clipPath" });
                  if (controls) controls.inert = false;
                },
              });
              const o = { v: 0 };
              gsap.to(o, { v: lotCount, duration: 0.9, ease: "power2.out", onUpdate: () => counts.forEach((c) => (c.textContent = String(Math.round(o.v)))) });
            },
          });
          undo.push(() => {
            if (controls) controls.inert = false;
            counts.forEach((c) => (c.textContent = String(lotCount)));
          });
        }

        return () => undo.forEach((fn) => fn());
      });

      // Posiciones nuevas tras fuentes e imágenes de escena.
      void document.fonts?.ready.then(() => !cancelled && ScrollTrigger.refresh());
      revert = () => mm.revert();
    }

    // Se arma ante la primera interacción o a los 4.5 s: el audit de carga (TBT) y
    // la primera pintura no pagan el costo de GSAP. Las escenas están abajo del pliegue.
    const events = ["scroll", "pointerdown", "keydown", "touchstart"] as const;
    let armed = false;
    let timeoutId = 0;
    const kick = () => {
      if (armed) return;
      armed = true;
      events.forEach((e) => window.removeEventListener(e, kick));
      window.clearTimeout(timeoutId);
      void arm();
    };
    const start = () => {
      events.forEach((e) => window.addEventListener(e, kick, { passive: true, once: true }));
      timeoutId = window.setTimeout(kick, 4500);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
      events.forEach((e) => window.removeEventListener(e, kick));
      window.clearTimeout(timeoutId);
      revert();
    };
  }, []);

  return null;
}
