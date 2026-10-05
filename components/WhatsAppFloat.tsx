"use client";
// "use client": aparece tras el hero (IntersectionObserver). Desktop: botón
// circular. Móvil: barra inferior pegajosa con "Cotiza tu lote" + WhatsApp,
// oculta mientras el formulario del hero está en pantalla. Nunca coexisten.

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { WhatsappLogo } from "@phosphor-icons/react";
import { Link, usePathname } from "@/i18n/navigation";
import { whatsappLink } from "@/lib/whatsapp";

export function WhatsAppIcon({ className }: { className?: string }) {
  return <WhatsappLogo weight="fill" className={className} aria-hidden />;
}

export function WhatsAppFloat() {
  const t = useTranslations("whatsapp");
  const tn = useTranslations("nav");
  const tb = useTranslations("mobileBar");
  const onHome = usePathname() === "/";
  const [pastHero, setPastHero] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    const form = document.getElementById("cotiza");
    if (!hero) return;
    const ioHero = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0.4 });
    ioHero.observe(hero);
    const ioForm = new IntersectionObserver(([e]) => setFormVisible(e.isIntersecting), { threshold: 0.15 });
    if (form) ioForm.observe(form);
    return () => {
      ioHero.disconnect();
      ioForm.disconnect();
    };
  }, []);

  const href = whatsappLink(t("general"));
  const show = !onHome || pastHero; // paginas sin hero (gracias, aviso)

  return (
    <>
      {/* Desktop: botón circular (excepción documentada del radio único). */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("label")}
        title={t("tooltip")}
        className={`fixed right-6 bottom-6 z-40 hidden size-14 items-center justify-center rounded-full bg-tierra-600 text-hueso shadow-[var(--e2)] transition-[opacity,transform,background-color] duration-200 hover:bg-tierra-700 active:scale-95 md:inline-flex ${
          show ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <WhatsAppIcon className="size-7" />
      </a>

      {/* Móvil: barra inferior. */}
      <div
        role="group"
        aria-label={tb("label")}
        className={`fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-tinta-900/12 bg-hueso px-4 pt-3 shadow-[var(--e2)] transition-transform duration-240 md:hidden ${
          show && !formVisible ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
        aria-hidden={!(show && !formVisible)}
      >
        <Link href={{ pathname: "/", hash: "cotiza" }} className="btn btn-primary flex-1" tabIndex={show && !formVisible ? 0 : -1}>
          {tn("cta")}
        </Link>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("label")}
          tabIndex={show && !formVisible ? 0 : -1}
          className="inline-flex size-[52px] shrink-0 items-center justify-center rounded-full bg-tierra-600 text-hueso hover:bg-tierra-700"
        >
          <WhatsAppIcon className="size-7" />
        </a>
      </div>
    </>
  );
}
