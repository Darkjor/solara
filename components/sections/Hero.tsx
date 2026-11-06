import Image, { getImageProps } from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Capitulo 0: hero en tres tiempos. Tres capas apiladas (plano, faro, fachada) y
 * las tres oraciones del H1, cada una en su `span`. El HTML es el estado final
 * (render, H1 completo, subtitulo, precio y CTAs): asi se ve sin JS o con
 * movimiento reducido. Con movimiento, el script del <head> pone `scrolly` en
 * <html> (estado del tiempo 1, sin parpadeo) y Scenes.tsx fija el escenario con
 * pin + scrub. Ganchos: `[data-hero-stage]`, `[data-hero-layer=1|2|3]`,
 * `.hero-line`, `.hero-rest`, `.hero-note`.
 */
export function Hero() {
  const t = useTranslations("hero");
  const sentences = t("title")
    .split(". ")
    .map((l, i, a) => (i < a.length - 1 ? `${l}.` : l));
  // Tiempo 3: render horizontal en escritorio, vertical en movil (direccion de arte).
  const base = { alt: t("imageAlt"), fill: true, loading: "eager" as const, quality: 75 };
  const { props: wide } = getImageProps({ ...base, src: "/img/render-fachada-1.webp", sizes: "100vw" });
  const { props: tall } = getImageProps({ ...base, src: "/img/hero-movil-fachada.webp", sizes: "160vw" });

  return (
    <section id="inicio" data-scene="hero" className="hero on-dark relative bg-selva-950 text-hueso">
      <div data-hero-stage className="hero-stage relative isolate min-h-[100svh] overflow-hidden">
        {/* Tiempo 1: el plano (verde sobre negro) se funde con el selva con lighten. */}
        <div data-hero-layer="1" className="hero-layer absolute inset-0 -z-10 bg-selva-950">
          <div className="hero-plan absolute max-lg:inset-x-0 max-lg:top-[var(--header-h)] max-lg:h-[32%] lg:inset-y-0 lg:right-0 lg:w-[64%]">
            <Image
              src="/img/plano-maestro-recorte.webp"
              alt=""
              aria-hidden
              fill
              priority
              quality={85}
              sizes="(min-width:1024px) 70vw, 100vw"
              className="hero-plan-img object-contain"
            />
          </div>
        </div>
        {/* Tiempo 2: el faro al atardecer. */}
        <div data-hero-layer="2" className="hero-layer hero-layer-extra absolute inset-0 -z-10">
          <Image
            src="/img/letrero-mahahual-atardecer.webp"
            alt=""
            aria-hidden
            fill
            loading="eager"
            quality={75}
            sizes="100vw"
            className="hero-img object-cover object-[50%_20%]"
          />
        </div>
        {/* Tiempo 3 (y estado final): la fachada. */}
        <div data-hero-layer="3" className="hero-layer absolute inset-0 -z-10">
          <picture>
            <source media="(min-width:768px)" srcSet={wide.srcSet} sizes="100vw" />
            <source srcSet={tall.srcSet} sizes="160vw" />
            <img {...tall} alt={t("imageAlt")} className="hero-img object-cover object-[50%_42%] md:object-center" />
          </picture>
        </div>
        <div className="hero-scrim pointer-events-none absolute inset-0 -z-10">
          <div className="scrim-left absolute inset-0 max-md:hidden" />
          <div className="scrim-text absolute inset-0 md:hidden" />
          <div className="scrim-bottom absolute inset-0 max-md:hidden md:opacity-60" />
          <div className="scrim-top absolute inset-0" />
        </div>

        <div className="wrap relative flex min-h-[100svh] flex-col justify-end pt-24 pb-[4.5rem] lg:pb-16">
          <div className="hero-copy max-w-[34rem] lg:max-w-[44rem]">
            <h1 className="hero-title display">
              {sentences.map((s, i) => (
                <span key={i} className="hero-line block">
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
        </div>

        <p className="hero-note wrap t-small absolute inset-x-0 bottom-0 pb-3 text-hueso">{t("imageNote")}</p>
      </div>
    </section>
  );
}
