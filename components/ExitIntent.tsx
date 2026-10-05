"use client";
// "use client": detecta la intención de salida y abre un <dialog>. Reglas del
// spec: una vez por sesión, nunca si ya dejó datos, nunca en /gracias, nunca en
// los primeros 20 s ni con el formulario del hero a la vista. Desktop: el cursor
// sale por arriba. Móvil: scroll rápido hacia arriba tras pasar el 50% de la
// página (único uso de un listener de scroll del sitio, pasivo).

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { LeadForm, LEAD_SENT_KEY } from "./LeadForm";

const SEEN_KEY = "solara-exit-visto";
const MIN_TIME_MS = 20000;

function store(kind: "local" | "session") {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function blocked() {
  return store("session")?.getItem(SEEN_KEY) === "1" || store("local")?.getItem(LEAD_SENT_KEY) === "1";
}

function heroFormVisible() {
  const el = document.getElementById("cotiza");
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
}

export function ExitIntent() {
  const t = useTranslations("exit");
  const dialog = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const onGracias = pathname === "/gracias";

  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  const open = useCallback(() => {
    const d = dialog.current;
    if (!d || d.open || onGracias || blocked() || heroFormVisible()) return;
    store("session")?.setItem(SEEN_KEY, "1");
    setMounted(true);
    d.showModal();
  }, [onGracias]);

  // Vista previa para el equipo: `?popup=1` limpia las marcas y lo abre.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("popup") !== "1") return;
    store("session")?.removeItem(SEEN_KEY);
    store("local")?.removeItem(LEAD_SENT_KEY);
    const id = window.setTimeout(() => {
      setMounted(true);
      dialog.current?.showModal();
    }, 1000);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (blocked() || onGracias) return;
    const start = Date.now();
    const ready = () => Date.now() - start > MIN_TIME_MS;

    const onMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0 && ready()) open();
    };

    let lastY = window.scrollY;
    let upStart: { y: number; t: number } | null = null;
    const onScroll = () => {
      const y = window.scrollY;
      const now = performance.now();
      const pastHalf = y > (document.documentElement.scrollHeight - window.innerHeight) * 0.5 || lastY > (document.documentElement.scrollHeight - window.innerHeight) * 0.5;
      if (y >= lastY) {
        upStart = null;
      } else {
        upStart ??= { y: lastY, t: now - 16 };
        const up = upStart.y - y;
        const speed = up / Math.max(1, now - upStart.t);
        if (up > 250 && speed > 1 && pastHalf && ready()) open();
      }
      lastY = y;
    };

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse) window.addEventListener("scroll", onScroll, { passive: true });
    else document.addEventListener("mouseout", onMouseOut);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, [open, onGracias]);

  const close = () => dialog.current?.close();

  return (
    <dialog
      ref={dialog}
      aria-labelledby="exit-title"
      onClick={(e) => e.target === dialog.current && close()}
      className="m-auto w-[min(30rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overflow-auto rounded-lg bg-hueso p-0 text-tinta-900 shadow-[var(--e3)] backdrop:bg-selva-950/55"
    >
      {mounted && (
        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={close}
            aria-label={t("close")}
            className="absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-full text-tinta-600 hover:bg-arena-200 hover:text-tinta-900"
          >
            <X size={22} aria-hidden />
          </button>
          <h2 id="exit-title" className="display t-h3 pr-10">
            {t("title")}
          </h2>
          <p className="mt-3 text-tinta-900">{t("text")}</p>
          <LeadForm variant="exit" className="mt-5 !p-0 !shadow-none" />
          <button type="button" onClick={close} className="link-action mt-4 w-full justify-center !font-normal">
            {t("dismiss")}
          </button>
        </div>
      )}
    </dialog>
  );
}
