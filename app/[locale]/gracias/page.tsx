import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight, CheckCircle } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import { ConversionEvent } from "@/components/ConversionEvent";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";
import { site } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";

const TIPOS = ["cotizacion", "broker"] as const;
type Tipo = (typeof TIPOS)[number];

export async function generateMetadata({ params }: PageProps<"/[locale]/gracias">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  // Pagina de confirmacion: no debe aparecer en buscadores.
  return { title: `${t("thanksTitle")} | ${site.shortName}`, robots: { index: false, follow: false } };
}

export default async function GraciasPage({ params, searchParams }: PageProps<"/[locale]/gracias">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("thanks");
  const tw = await getTranslations("whatsapp");
  const raw = (await searchParams).tipo;
  const tipo: Tipo = TIPOS.includes(raw as Tipo) ? (raw as Tipo) : "cotizacion";

  return (
    <section className="on-dark relative isolate flex min-h-[100dvh] items-center overflow-hidden bg-selva-950 pt-20 text-hueso">
      <ConversionEvent tipo={tipo} />
      <Image src="/img/render-fachada-3.webp" alt={t("imageAlt")} fill priority sizes="100vw" className="-z-10 object-cover object-[50%_60%]" />
      <div className="absolute inset-0 -z-10 bg-selva-950/70" />

      <div className="wrap w-full py-16">
        <div className="max-w-2xl">
          <CheckCircle weight="regular" size={56} className="hero-in text-tierra-300" aria-hidden />
          <h1 className="hero-in t-h1 display mt-6" style={{ ["--d" as string]: "100ms" }}>
            {t("title")}
          </h1>
          <p className="hero-in t-lead mt-5 max-w-[48ch]" style={{ ["--d" as string]: "200ms" }}>
            {tipo === "broker" ? t("broker") : t("text")}
          </p>

          <div className="hero-in mt-10" style={{ ["--d" as string]: "300ms" }}>
            <p className="font-semibold">{t("nextTitle")}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={whatsappLink(tw("general"))} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <WhatsAppIcon className="size-5" />
                {t("whatsapp")}
              </a>
              <Link href={{ pathname: "/", hash: "disponibilidad" }} className="btn btn-secondary-dark">
                {t("availability")}
              </Link>
              <a href={site.brochureUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary-dark">
                {t("brochure")}
                <ArrowUpRight size={18} aria-hidden />
              </a>
            </div>
            <p className="num mt-6 font-semibold">{site.whatsappDisplay}</p>
            <Link href="/" className="link-action mt-6">
              {t("home")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
