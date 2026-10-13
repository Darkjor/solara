import { getImageProps } from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LeadForm } from "@/components/LeadForm";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/**
 * Hero. Ganchos para M0 (fase 2): `[data-scene="hero"]`, `.hero-media` (foto),
 * `.hero-line` (cada linea del H1), `.hero-card` (tarjeta de cotizacion).
 * El H1 es la consigna oficial. En escritorio va en dos lineas (las dos primeras
 * oraciones juntas, la ultima sola) y su escala sigue el ancho de la columna de
 * texto (cqw, ver globals.css); en movil y tablet, una oracion por linea.
 */
export function Hero() {
  const t = useTranslations("hero");
  // Direccion de arte: render horizontal en escritorio, render vertical en movil
  // (un horizontal en un marco vertical oculta ~85 % de la foto y se ve borroso).
  const base = { alt: t("imageAlt"), fill: true, priority: true, fetchPriority: "high" as const, quality: 75 };
  const { props: wide } = getImageProps({ ...base, src: "/img/render-fachada-1.webp", sizes: "100vw" });
  const { props: tall } = getImageProps({ ...base, src: "/img/hero-movil-fachada.webp", sizes: "160vw" });
  const sentences = t("title")
    .split(". ")
    .map((l, i, a) => (i < a.length - 1 ? `${l}.` : l));
  const lines = [sentences.slice(0, 2), sentences.slice(2)].filter((l) => l.length > 0);

  return (
    <section id="inicio" data-scene="hero" className="on-dark relative isolate overflow-hidden bg-selva-950 text-hueso">
      <div className="hero-media absolute inset-0 -z-10 max-md:bottom-auto max-md:h-[100dvh]">
        <picture>
          <source media="(min-width:768px)" srcSet={wide.srcSet} sizes="100vw" />
          <source srcSet={tall.srcSet} sizes="160vw" />
          <img {...tall} alt={t("imageAlt")} className="object-cover object-[50%_42%] md:object-center" />
        </picture>
        <div className="scrim-left absolute inset-0 max-md:hidden" />
        <div className="absolute inset-0 bg-selva-950/30 md:hidden" />
        <div className="scrim-bottom absolute inset-0 md:opacity-60" />
        <div className="scrim-top absolute inset-0" />
      </div>

      <div className="wrap grid min-h-[100dvh] items-center gap-10 pt-24 pb-12 md:grid-cols-12 md:gap-6 lg:pb-14">
        <div className="hero-copy md:col-span-7 lg:col-span-8">
          <h1 className="hero-title display max-md:mt-[26dvh]">
            {lines.map((line, i) => (
              <span key={i} className="hero-line block">
                <span className="hero-line-in block" style={delay(i * 90)}>
                  {line.map((s, j) => (
                    <span key={j} className="hero-sent">
                      {s}
                      {j < line.length - 1 ? " " : ""}
                    </span>
                  ))}
                  {i < lines.length - 1 ? " " : ""}
                </span>
              </span>
            ))}
          </h1>
          <p className="hero-in t-lead mt-5 max-w-[34ch] text-hueso md:max-w-[40ch]" style={delay(320)}>
            {t("subtitle")}
          </p>
          <div className="hero-in mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1" style={delay(420)}>
            <p className="text-[0.9375rem] font-semibold">{t("priceLabel")}</p>
            <p className="display num text-3xl text-tierra-300">{t("price")}</p>
          </div>
          <p className="hero-in t-small mt-1 text-hueso" style={delay(460)}>
            {t("priceNote")}
          </p>
          <div className="hero-in mt-7 flex flex-wrap gap-3" style={delay(520)}>
            <Link href={{ pathname: "/", hash: "cotiza" }} className="btn btn-primary md:hidden">
              {t("ctaPrimary")}
            </Link>
            <Link href={{ pathname: "/", hash: "disponibilidad" }} className="btn btn-secondary-dark">
              {t("ctaSecondary")}
            </Link>
          </div>
        </div>

        <div className="hero-card hero-in md:col-span-5 md:justify-self-end lg:col-span-4 lg:col-start-9" style={delay(420)}>
          <LeadForm variant="quote" id="cotiza" className="w-full scroll-mt-24 md:max-w-[420px]" />
        </div>
      </div>

      <p className="wrap t-small pb-4 text-hueso md:absolute md:inset-x-0 md:bottom-0 md:pb-3">{t("imageNote")}</p>
    </section>
  );
}
