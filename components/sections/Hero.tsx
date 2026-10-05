import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LeadForm } from "@/components/LeadForm";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/**
 * Hero. Ganchos para M0 (fase 2): `[data-scene="hero"]`, `.hero-media` (foto),
 * `.hero-line` (cada oración del H1), `.hero-card` (tarjeta de cotización).
 * El H1 es la consigna oficial en tres líneas (una por oración).
 */
export function Hero() {
  const t = useTranslations("hero");
  const lines = t("title")
    .split(". ")
    .map((l, i, a) => (i < a.length - 1 ? `${l}.` : l));

  return (
    <section id="inicio" data-scene="hero" className="on-dark relative isolate overflow-hidden bg-selva-950 text-hueso">
      <div className="hero-media absolute inset-0 -z-10">
        <Image
          src="/img/render-fachada-1.webp"
          alt={t("imageAlt")}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={75}
          className="object-cover object-[62%_50%] md:object-center"
        />
        <div className="scrim-left absolute inset-0 max-md:hidden" />
        <div className="absolute inset-0 bg-selva-950/30 md:hidden" />
        <div className="scrim-bottom absolute inset-0 md:opacity-60" />
        <div className="scrim-top absolute inset-0" />
      </div>

      <div className="wrap grid min-h-[100dvh] items-center gap-10 pt-24 pb-12 md:grid-cols-12 md:gap-6 lg:pb-14">
        <div className="md:col-span-7">
          <h1 className="hero-title display text-[clamp(2.25rem,1.1rem+4vw,3.5rem)] leading-[1.06] max-md:mt-[26dvh]">
            {lines.map((l, i) => (
              <span key={i} className="hero-line block">
                <span className="hero-line-in block" style={delay(i * 90)}>
                  {l}
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

/** Franja de respaldo bajo el pliegue: texto, sin logos inventados. */
export function TrustStrip() {
  const t = useTranslations("advantages");
  return (
    <section aria-label={t("legalTitle")} className="border-b border-tinta-900/12 bg-hueso">
      <ul className="wrap grid gap-y-2 py-6 sm:grid-cols-3 sm:divide-x sm:divide-tinta-900/12 sm:py-8">
        {(["seal1", "seal2", "seal3"] as const).map((k) => (
          <li key={k} className="display text-xl text-tinta-900 sm:px-8 sm:text-center sm:text-[1.375rem]">
            {t(k)}
          </li>
        ))}
      </ul>
    </section>
  );
}
