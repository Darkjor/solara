"use client";
// "use client": controlador de los momentos de scroll (spec 4.2, M1 a M5). GSAP y
// ScrollTrigger entran con import() dinámico cuando el navegador queda libre,
// nunca en el JS inicial. Todo vive en un gsap.matchMedia(): al cambiar el
// tamaño o la preferencia de movimiento reducido se revierte y se vuelve a armar.
//
// Regla de oro: ningún contenido queda oculto por defecto. Los estados ocultos
// los pone este archivo, ya con GSAP cargado; si no carga, la página está completa.
// El estado del tiempo 1 del hero (clase `scrolly` en <html>) lo pone el script del
// <head>; si GSAP no carga, este archivo la quita y el hero queda en su estado final.

import { useEffect } from "react";
import { loadGsap } from "@/lib/gsap";
import { CALC_EVENT } from "@/components/LotCalculator";
import { lotCount, lotMax, lotMin } from "@/lib/site";

const q = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector<T>(s);
const qa = <T extends HTMLElement = HTMLElement>(s: string) => Array.from(document.querySelectorAll<T>(s));

type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
type ST = Awaited<ReturnType<typeof loadGsap>>["ScrollTrigger"];

// Vivir: tope de velocidad (la fila recorre como mucho 1.5x lo que dura el cruce), % de profundidad
// de la foto (con escala 1.1 sobran 5 % por lado: 5 no deja hueco, 6 si) y espera del snap al soltarla.
const VIVIR_RATIO = 1.5;
const VIVIR_DEPTH = 5;
const VIVIR_IDLE_MS = 160;

export function Scenes() {
  useEffect(() => {
    let cancelled = false;
    let revert = () => {};

    async function arm() {
      let lib: Awaited<ReturnType<typeof loadGsap>>;
      try {
        lib = await loadGsap();
      } catch {
        document.documentElement.classList.remove("scrolly");
        return;
      }
      const { gsap, ScrollTrigger } = lib;
      if (cancelled) return;
      ScrollTrigger.config({ ignoreMobileResize: true });
      const mm = gsap.matchMedia();

      mm.add({ motion: "(prefers-reduced-motion: no-preference)", tall: "(min-height: 560px)", wide: "(min-width: 1024px) and (min-height: 640px)" }, (ctx) => {
        const { motion, tall, wide } = ctx.conditions as { motion: boolean; tall: boolean; wide: boolean };
        if (!motion) return;
        const undo: Array<() => void> = [];

        /* M0. Hero en tres tiempos: pin de 200 % con scrub. Mar, faro y fachada entran por
           clip-path; cada oracion del H1 sube y se desvanece; al final las tres se apilan
           (escala 0.8) y entran subtitulo, precio y CTAs. Solo transform, opacity y clip-path. */
        const hero = q("[data-hero-stage]");
        if (tall && hero) {
          const root = document.documentElement;
          root.classList.add("scrolly");
          const l2 = q("[data-hero-layer='2']")!;
          const l3 = q("[data-hero-layer='3']")!;
          const img1 = q("[data-hero-layer='1'] img")!;
          const img2 = l2.querySelector("img")!;
          const img3 = l3.querySelector("img")!;
          const lines = qa(".hero-line");
          const title = q(".hero-title")!;
          const rest = q(".hero-rest")!;
          const note = q(".hero-note")!;
          const shut = "inset(100% 0% 0% 0%)";
          const open = "inset(0% 0% 0% 0%)";
          gsap.set([l2, l3], { clipPath: shut });
          gsap.set([img2, img3], { scale: 1.12 });
          gsap.set(img1, { scale: 1.08 });
          gsap.set(lines.slice(1), { opacity: 0, y: 40 });
          gsap.set([rest, note], { autoAlpha: 0 });
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: hero, start: "top top", end: "+=200%", pin: true, scrub: 0.6, invalidateOnRefresh: true },
          });
          tl.to(img1, { scale: 1, duration: 1, ease: "power1.out" }, 0);
          [1, 2].forEach((i) => {
            tl.to(lines[i - 1], { y: -40, opacity: 0, duration: 0.25 }, i);
            tl.fromTo(lines[i], { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, i + 0.1);
            tl.to(i === 1 ? l2 : l3, { clipPath: open, duration: 0.4, ease: "power2.inOut" }, i);
            tl.to(i === 1 ? img2 : img3, { scale: 1, duration: 0.6, ease: "power2.out" }, i);
          });
          tl.to(note, { autoAlpha: 1, duration: 0.2 }, 2.3);
          tl.to(title, { scale: 0.8, duration: 0.45, ease: "power2.inOut" }, 2.65);
          tl.to(lines[0], { y: 0, yPercent: -200, opacity: 1, duration: 0.45, ease: "power2.inOut" }, 2.65);
          tl.to(lines[1], { y: 0, yPercent: -100, opacity: 1, duration: 0.45, ease: "power2.inOut" }, 2.65);
          tl.to(rest, { autoAlpha: 1, duration: 0.35 }, 2.9);
          tl.to({}, { duration: 0.25 }, 3.25);
          undo.push(() => root.classList.remove("scrolly"));
        }

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

        /* Ubicacion (solo desktop): pin de 150 %. El mapa estatal se acerca a SOLARA (origen en
           el medallon), hace fundido a la vista local y las tres distancias entran una por tiempo. */
        const loc = q("[data-scene=location]");
        const locStage = q("[data-loc-stage]");
        if (wide && loc && locStage) {
          loc.classList.add("loc-live");
          const state = q("[data-loc-state]")!;
          const local = q("[data-loc-local]")!;
          const items = qa("[data-loc-item]");
          gsap.set(state, { transformOrigin: "59.5% 56.7%" });
          gsap.set(items, { opacity: 0, y: 24 });
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: locStage, start: "top top", end: "+=150%", pin: true, scrub: 0.6, invalidateOnRefresh: true },
          });
          tl.to(state, { scale: 2.2, x: () => -0.095 * state.offsetWidth, y: () => -0.067 * state.offsetHeight, duration: 1.2, ease: "power1.inOut" }, 0);
          tl.to(items[0], { opacity: 1, y: 0, duration: 0.35 }, 0.6);
          tl.to(local, { opacity: 1, duration: 0.6 }, 1.1);
          tl.to(items[1], { opacity: 1, y: 0, duration: 0.35 }, 1.5);
          tl.to(items[2], { opacity: 1, y: 0, duration: 0.35 }, 2.1);
          tl.to({}, { duration: 0.4 }, 2.5);
          undo.push(() => loc.classList.remove("loc-live"));
        }

        /* Galeria (solo desktop): wrapper fijado, la pista se mueve en x (patron 5.B). */
        const gal = q("[data-scene=gallery]");
        const galPin = q("[data-gal-pin]");
        const galTrack = q("[data-gal-track]");
        if (wide && gal && galPin && galTrack) {
          gal.classList.add("gal-live");
          const dist = () => Math.max(0, galTrack.scrollWidth - document.documentElement.clientWidth);
          const tw = gsap.to(galTrack, {
            x: () => -dist(),
            ease: "none",
            scrollTrigger: { trigger: galPin, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true },
          });
          // Con teclado, la foto enfocada se trae a pantalla moviendo el scroll (la pista no se desplaza sola).
          const onFocus = (e: FocusEvent) => {
            const cell = (e.target as HTMLElement).closest<HTMLElement>(".gal-cell");
            const st = tw.scrollTrigger;
            const d = dist();
            if (!cell || !st || !d) return;
            const r = cell.getBoundingClientRect();
            const left = r.left - galTrack.getBoundingClientRect().left;
            const target = Math.min(d, Math.max(0, left - (document.documentElement.clientWidth - r.width) / 2));
            window.scrollTo({ top: st.start + (target / d) * (st.end - st.start), behavior: "instant" });
          };
          galTrack.addEventListener("focusin", onFocus);
          undo.push(() => {
            galTrack.removeEventListener("focusin", onFocus);
            gal.classList.remove("gal-live");
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

        /* M6. Vivir en SOLARA: la fila avanza sola con el scroll vertical hasta el primer gesto del usuario. */
        const vivir = q("#vivir-row");
        if (vivir) undo.push(linkVivir(gsap, ScrollTrigger, vivir));

        return () => undo.forEach((fn) => fn());
      });

      // Posiciones nuevas tras fuentes e imágenes de escena.
      void document.fonts?.ready.then(() => {
        if (cancelled) return;
        ScrollTrigger.refresh();
        // Un enlace con ancla (p. ej. /#disponibilidad) cargo antes de que existiera el pin: se recoloca.
        const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
        if (target && window.scrollY > 0) target.scrollIntoView({ behavior: "instant" });
      });
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
      // Con el hero en tres tiempos (clase scrolly) se arma casi de inmediato: es lo primero que se ve.
      timeoutId = window.setTimeout(kick, document.documentElement.classList.contains("scrolly") ? 120 : 4500);
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

/**
 * Fila de Vivir ligada al scroll: solo `scrollLeft` (fila) y `transform` (foto). Mientras va ligada
 * no hay snap; al primer gesto (arrastre horizontal, raton, rueda lateral, foco, flechas) se mata
 * su trigger y queda el desplazamiento nativo. Un toque que solo empuja el scroll vertical no la suelta.
 */
function linkVivir(gsap: Gsap, ScrollTrigger: ST, row: HTMLElement) {
  const overflow = () => row.scrollWidth - row.clientWidth;
  if (overflow() <= 4 || row.scrollLeft > 4) return () => {}; // sin desbordamiento o el usuario ya la movio
  const cards = Array.from(row.children) as HTMLElement[];
  const imgs = cards.map((c) => c.querySelector<HTMLElement>("[data-vivir-img]")).filter((i): i is HTMLElement => !!i);
  const setX = imgs.map((i) => gsap.quickSetter(i, "xPercent") as (v: number) => void);
  gsap.set(imgs, { scale: 1.1, willChange: "transform" });

  // Profundidad: solo depende de la posicion de la pieza en la fila (vale ligada o nativa).
  const depth = () => {
    const s = row.getBoundingClientRect();
    const mid = s.left + s.width / 2;
    cards.forEach((c, i) => {
      if (!setX[i]) return;
      const r = c.getBoundingClientRect();
      const rel = (r.left + r.width / 2 - mid) / (s.width / 2 + r.width / 2);
      setX[i](-Math.max(-1, Math.min(1, rel)) * VIVIR_DEPTH);
    });
  };
  depth();
  row.addEventListener("scroll", depth, { passive: true });
  ScrollTrigger.addEventListener("refresh", depth);

  row.style.scrollSnapType = "none";
  const tween = gsap.to(row, {
    scrollLeft: () => Math.max(0, Math.min(overflow(), VIVIR_RATIO * (window.innerHeight + row.offsetHeight))),
    ease: "none",
    scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true },
  });

  let released = false;
  let touching = false;
  let sx = 0;
  let sy = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const settle = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!touching) row.style.scrollSnapType = "";
    }, VIVIR_IDLE_MS);
  };
  const release = () => {
    if (released) return;
    released = true;
    const left = row.scrollLeft; // matar el trigger reinicia la animacion: se conserva donde estaba la fila
    tween.scrollTrigger?.kill();
    tween.kill();
    row.scrollLeft = left;
    row.addEventListener("scroll", settle, { passive: true });
    settle(); // el snap vuelve cuando el gesto termina y el scroll queda quieto (sin tiron bajo el dedo)
  };
  const onTouchStart = (e: TouchEvent) => {
    touching = true;
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  };
  const onTouchMove = (e: TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - sx);
    if (dx > 4 && dx > Math.abs(e.touches[0].clientY - sy)) release();
  };
  const onTouchEnd = () => {
    touching = false;
    if (released) settle();
  };
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "touch") release();
  };
  const onWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) release();
  };
  const nav = q(".vivir-nav");
  const on = { passive: true } as const;
  row.addEventListener("touchstart", onTouchStart, on);
  row.addEventListener("touchmove", onTouchMove, on);
  row.addEventListener("touchend", onTouchEnd, on);
  row.addEventListener("touchcancel", onTouchEnd, on);
  row.addEventListener("pointerdown", onPointerDown, on);
  row.addEventListener("wheel", onWheel, on);
  row.addEventListener("focusin", release);
  nav?.addEventListener("pointerdown", release, on);
  nav?.addEventListener("focusin", release);

  return () => {
    clearTimeout(timer);
    row.removeEventListener("scroll", depth);
    row.removeEventListener("scroll", settle);
    ScrollTrigger.removeEventListener("refresh", depth);
    row.removeEventListener("touchstart", onTouchStart);
    row.removeEventListener("touchmove", onTouchMove);
    row.removeEventListener("touchend", onTouchEnd);
    row.removeEventListener("touchcancel", onTouchEnd);
    row.removeEventListener("pointerdown", onPointerDown);
    row.removeEventListener("wheel", onWheel);
    row.removeEventListener("focusin", release);
    nav?.removeEventListener("pointerdown", release);
    nav?.removeEventListener("focusin", release);
    row.style.scrollSnapType = "";
    gsap.set(imgs, { clearProps: "transform,willChange" });
  };
}
