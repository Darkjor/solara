import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/aviso-de-privacidad">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: `${t("title")} | ${site.shortName}`, alternates: { canonical: locale === "en" ? "/en/privacy" : "/aviso-de-privacidad" } };
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/aviso-de-privacidad">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");
  const sections = [
    ["h2", "p2"],
    ["h3", "p3"],
    ["h4", "p4"],
    ["h5", "p5"],
  ] as const;

  return (
    <article className="bg-hueso pt-16 lg:pt-18">
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6 lg:py-28">
        <h1 className="t-h1 display">{t("title")}</h1>
        <p className="t-small mt-4 text-tinta-600">{t("updated")}</p>
        <p className="mt-10 text-lg leading-relaxed">{t("p1", { developer: site.developer, name: site.name })}</p>
        {sections.map(([h, p]) => (
          <section key={h} className="mt-10">
            <h2 className="t-h3 display text-tierra-600">{t(h)}</h2>
            <p className="mt-3 text-lg leading-relaxed">{t(p, { whatsapp: site.whatsappDisplay })}</p>
          </section>
        ))}
        <Link href="/" className="link-action mt-14">
          {t("back")}
        </Link>
      </div>
    </article>
  );
}
