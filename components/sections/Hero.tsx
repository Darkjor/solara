import { getImageProps } from "next/image";
import { useTranslations } from "next-intl";
import { LeadForm } from "@/components/LeadForm";
import { Link } from "@/i18n/navigation";

/**
 * Capitulo 0: hero. Render nocturno de la fachada a sangre, H1 de tres
 * oraciones, subtitulo, precio y CTAs a la izquierda y un formulario basico (nombre, telefono, correo y
 * comentario) a la derecha; en movil el formulario queda debajo del texto. Sin efecto de scroll ni pin:
 * al cargar, la imagen se asienta y el texto sube en cascada (solo CSS, solo con movimiento permitido).
 * Ganchos de estilo: `.hero-img`, `.hero-line`, `.hero-rest`, `.hero-form`.
 */
export function Hero() {
  const t = useTranslations("hero");
  const sentences = t("title")
    .split(". ")
    .map((l, i, a) => (i < a.length - 1 ? `${l}.` : l));
  // Render nocturno de la fachada (vertical, 1478x2170); en escritorio se recorta en banda. Es la imagen LCP.
  const { props: night } = getImageProps({ alt: t("imageAlt"), fill: true, priority: true, quality: 80, src: "/img/render-fachada-4-vertical.webp", sizes: "100vw" });

  // Escritorio: la foto vertical se ve completa al centro y los lados se rellenan con ella misma desenfocada (sin zoom).
  const { props: soft } = getImageProps({ alt: "", width: 480, height: 705, quality: 40, src: "/img/render-fachada-4-vertical.webp", sizes: "480px" });

  return (
    <section id="inicio" data-scene="hero" className="hero on-dark relative bg-selva-950 text-hueso">
      <div data-hero-stage className="hero-stage relative isolate min-h-[100svh] overflow-hidden">
        <div className="hero-layer absolute inset-0 -z-10 bg-selva-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={soft.src} alt="" aria-hidden loading="lazy" decoding="async" className="absolute inset-0 size-full scale-110 object-cover opacity-60 blur-2xl max-md:hidden" />
          <img {...night} alt={t("imageAlt")} className="hero-img object-cover object-[50%_42%] md:object-contain md:object-center" />
        </div>
        <div className="hero-scrim pointer-events-none absolute inset-0 -z-10">
          <div className="scrim-left absolute inset-0 max-md:hidden" />
          <div className="scrim-hero absolute inset-0 md:hidden" />
          <div className="scrim-bottom absolute inset-0 max-md:hidden md:opacity-60" />
          <div className="scrim-top absolute inset-0" />
        </div>

        <div className="wrap relative flex min-h-[100svh] flex-col justify-end gap-10 pt-24 pb-[4.5rem] lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-10 lg:pb-16">
          <div className="hero-copy max-w-[34rem] lg:col-span-7 lg:max-w-[44rem]">
            <h1 className="hero-title display">
              {sentences.map((s, i) => (
                <span key={i} className="hero-line block" style={{ ["--i" as string]: i }}>
                  {s}
                  {i < sentences.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>
            <div className="hero-rest">
              <p className="t-lead mt-5 max-w-[34ch] text-hueso md:max-w-[40ch]">{t("subtitle")}</p>
              <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <p className="text-[0.9375rem] font-semibold">{t("priceLabel")}</p>
                <p className="display num text-3xl text-tierra-300">{t("price")}</p>
              </div>
              <p className="t-small mt-1 text-hueso">{t("priceNote")}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={{ pathname: "/", hash: "cotiza" }} className="btn btn-primary">
                  {t("ctaPrimary")}
                </Link>
                <Link href={{ pathname: "/", hash: "disponibilidad" }} className="btn btn-secondary-dark">
                  {t("ctaSecondary")}
                </Link>
              </div>
            </div>
          </div>

          <div className="hero-form w-full max-w-[28rem] lg:col-span-5 lg:col-start-8 lg:justify-self-end">
            <LeadForm variant="hero" id="cotiza-rapido" className="w-full !p-5 sm:!p-6" />
          </div>
        </div>

        <p className="hero-note wrap t-small absolute inset-x-0 bottom-0 pb-3 text-hueso">{t("imageNote")}</p>
      </div>
    </section>
  );
}
