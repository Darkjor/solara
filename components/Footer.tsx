import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LogoFull } from "@/components/brand/Logo";
import { SECTIONS } from "@/lib/sections";
import { site } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";

export function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const tw = useTranslations("whatsapp");
  return (
    <footer className="on-dark bg-selva-900 text-hueso">
      <div className="wrap grid gap-10 py-14 md:grid-cols-12 md:gap-8 lg:py-16">
        <div className="md:col-span-5">
          <LogoFull className="h-28 w-auto text-hueso" />
          <p className="mt-5 text-[0.9375rem]">{t("by")}</p>
          <p className="display mt-4 max-w-[26ch] text-[1.25rem] leading-snug">{t("tagline")}</p>
        </div>
        <nav aria-label={t("linksTitle")} className="md:col-span-3">
          <p className="t-label text-tierra-300">{t("linksTitle")}</p>
          <ul className="mt-4 grid gap-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <Link href={{ pathname: "/", hash: s.id }} className="inline-flex min-h-9 items-center hover:underline">
                  {tn(s.key)}
                </Link>
              </li>
            ))}
            <li>
              <Link href={{ pathname: "/", hash: "faq" }} className="inline-flex min-h-9 items-center hover:underline">
                {tn("faq")}
              </Link>
            </li>
          </ul>
        </nav>
        <div className="md:col-span-4">
          <p className="t-label text-tierra-300">{t("contactTitle")}</p>
          <ul className="mt-4 grid gap-1">
            <li>
              <a href={whatsappLink(tw("general"))} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center hover:underline">
                {t("whatsappLabel")}: <span className="num ml-1">{site.whatsappDisplay}</span>
              </a>
            </li>
            <li className="inline-flex min-h-9 items-center">{t("address")}</li>
            <li>
              <Link href="/aviso-de-privacidad" className="inline-flex min-h-9 items-center hover:underline">
                {t("privacy")}
              </Link>
            </li>
            <li>
              <a href={site.brochureUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center hover:underline">
                {t("brochure")}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-hueso/20">
        <div className="wrap py-6 pb-24 md:pb-6">
          <p className="t-small max-w-[110ch] text-hueso/90">{t("disclaimer")}</p>
          <p className="t-small mt-3 text-hueso/90">{t("copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
