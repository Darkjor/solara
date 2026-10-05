"use client";
// "use client": IntersectionObserver para disparar la animación de entrada
// de cada `.reveal` cuando aparece en pantalla (una sola vez).
//
// Un script del <head> (layout) marca <html> con `reveal-ready` antes del
// primer render; si este componente no llega a correr, ese mismo script
// muestra todo a los 3 s. Sin JS no se oculta nada.

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    (window as Window & { __solaraReveal?: boolean }).__solaraReveal = true;
    const items = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)"));
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );
    items.forEach((el) => io.observe(el));
    root.classList.add("reveal-ready");
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
