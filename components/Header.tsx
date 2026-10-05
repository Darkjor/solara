"use client";
// "use client": estado de scroll (IntersectionObserver), sección activa, menú
// móvil con <dialog> (foco atrapado y Esc gratis) y selector de idioma.

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { List, X } from "@phosphor-icons/react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { LogoLockup } from "@/components/brand/Logo";
import { SECTIONS } from "@/lib/sections";
import { whatsappLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";

export function Header() {
  const t = useTranslations("nav");
  const tw = useTranslations("whatsapp");
  const ta = useTranslations("a11y");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const home = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDialogElement>(null);

  // Fondo sólido al pasar los primeros 80 px (sin listener de scroll).
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // aria-current en la sección visible.
  useEffect(() => {
    if (!home) return;
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [home]);

  useEffect(() => {
    menu.current?.close();
  }, [pathname]);

  const solid = scrolled || !home;
  const other = locale === "es" ? "en" : "es";
  const close = () => menu.current?.close();

  return (
    <>
      <div ref={sentinel} aria-hidden className="pointer-events-none absolute top-0 left-0 h-20 w-px" />
      <a
        href="#contenido"
        className="btn btn-primary fixed top-2 left-2 z-[70] -translate-y-24 focus:translate-y-0"
      >
        {ta("skip")}
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 h-16 transition-[background-color,box-shadow] duration-200 lg:h-18 ${
          solid ? "bg-hueso/92 text-tinta-900 shadow-[var(--e1)] backdrop-blur-md [@media(prefers-reduced-transparency:reduce)]:bg-hueso [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none" : "scrim-top text-hueso"
        }`}
      >
        <div className="wrap flex h-full items-center justify-between gap-4">
          <Link href="/" aria-label={t("logoLabel")} className={`h-10 lg:h-11 ${solid ? "text-tierra-600" : "text-hueso"}`}>
            <LogoLockup className="h-full" />
          </Link>

          <nav aria-label={ta("mainNav")} className="hidden items-center gap-6 lg:flex xl:gap-8">
            {SECTIONS.map((s) => (
              <Link
                key={s.id}
                href={{ pathname: "/", hash: s.id }}
                aria-current={active === s.id ? "true" : undefined}
                className={`text-[0.9375rem] font-semibold whitespace-nowrap underline-offset-8 hover:underline aria-[current=true]:underline ${solid ? "decoration-tierra-600" : "decoration-hueso"}`}
              >
                {t(s.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => router.replace(pathname, { locale: other })}
              aria-label={t("langLabel")}
              lang={other}
              className="hidden min-h-11 min-w-11 items-center justify-center rounded-lg text-[0.9375rem] font-semibold hover:bg-current/10 sm:inline-flex"
            >
              {t("langSwitch")}
            </button>
            <Link href={{ pathname: "/", hash: "cotiza" }} className="btn btn-primary !min-h-11 !px-4 sm:!px-6">
              {t("cta")}
            </Link>
            <button
              type="button"
              onClick={() => menu.current?.showModal()}
              aria-label={t("menuOpen")}
              className="inline-flex size-11 items-center justify-center rounded-lg hover:bg-current/10 lg:hidden"
            >
              <List size={26} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <dialog
        ref={menu}
        aria-label={t("menuOpen")}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-hueso p-0 text-tinta-900 backdrop:bg-selva-950/50"
      >
        <div className="wrap flex h-full flex-col py-4">
          <div className="flex h-12 items-center justify-between">
            <span className="h-10 text-tierra-600">
              <LogoLockup className="h-full" />
            </span>
            <button type="button" onClick={close} aria-label={t("menuClose")} className="inline-flex size-11 items-center justify-center rounded-lg hover:bg-tinta-900/10">
              <X size={26} aria-hidden />
            </button>
          </div>
          <nav aria-label={ta("mainNav")} className="mt-8 flex flex-1 flex-col gap-1">
            {SECTIONS.map((s) => (
              <Link key={s.id} href={{ pathname: "/", hash: s.id }} onClick={close} className="display py-2 text-[2rem] leading-tight">
                {t(s.key)}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                close();
                router.replace(pathname, { locale: other });
              }}
              lang={other}
              className="display mt-2 py-2 text-left text-[2rem] leading-tight text-tierra-600"
            >
              {locale === "es" ? "English" : "Español"}
            </button>
          </nav>
          <a href={whatsappLink(tw("general"))} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mb-4 w-full">
            <WhatsAppIcon className="size-5" />
            {tw("tooltip")}
          </a>
        </div>
      </dialog>
    </>
  );
}
