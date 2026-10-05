import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import { whatsappLink } from "@/lib/whatsapp";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/**
 * Ventajas: bento de 4 celdas exactas con variación real (A blanca con texto,
 * B foto, C superficie tierra-100, D mapa). Sin tarjetas iguales.
 */
export function Advantages() {
  const t = useTranslations("advantages");
  const groups = [
    { title: t("group1"), items: ["item2", "item3", "item4"] },
    { title: t("group2"), items: ["item5", "item6"] },
    { title: t("group3"), items: ["item1"] },
  ] as const;

  return (
    <section id="ventajas" data-scene="advantages" className="section bg-arena-100">
      <div className="wrap">
        <h2 className="t-h2 display reveal max-w-[24ch]">{t("title")}</h2>
        <p className="t-lead reveal prose-measure mt-5 text-tinta-900" style={delay(80)}>
          {t("lead")}
        </p>

        <div className="mt-12 grid gap-4 lg:grid-cols-12 lg:grid-rows-[auto_auto_220px] lg:gap-5">
          {/* A: documentación legal */}
          <article className="reveal rounded-lg border border-tinta-900/12 bg-white p-6 shadow-[var(--e1)] sm:p-8 lg:col-span-7 lg:row-span-2">
            <h3 className="display t-h3">{t("legalTitle")}</h3>
            <p className="prose-measure mt-3 text-tinta-900">{t("legalText")}</p>
            <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
              {(["seal1", "seal2", "seal3"] as const).map((k) => (
                <li key={k} className="display text-[1.25rem] text-tierra-600">
                  {t(k)}
                </li>
              ))}
            </ul>
            <h4 className="mt-8 font-semibold">{t("packTitle")}</h4>
            <div className="mt-3 grid gap-x-8 gap-y-5 sm:grid-cols-3">
              {groups.map((g) => (
                <div key={g.title}>
                  <p className="t-small font-semibold text-tinta-900">{g.title}</p>
                  <ul className="mt-2 grid gap-2 text-[0.9375rem]">
                    {g.items.map((k) => (
                      <li key={k} className="border-t border-tinta-900/12 pt-2">
                        {t(k)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <a href={whatsappLink(t("packWa"))} target="_blank" rel="noopener noreferrer" className="link-action mt-8">
              {t("packCta")}
              <ArrowUpRight size={18} aria-hidden />
            </a>
          </article>

          {/* B: esquemas flexibles, foto */}
          <article className="reveal relative isolate min-h-[360px] overflow-hidden rounded-lg lg:col-span-5" style={delay(60)}>
            <Image src="/img/lifestyle-playa-pareja.webp" alt={t("flexAlt")} fill sizes="(min-width:1024px) 40vw, 92vw" className="-z-10 object-cover object-[50%_40%]" />
            <div className="scrim-text absolute inset-0 -z-10" />
            <div className="on-dark flex h-full min-h-[360px] flex-col justify-end p-6 text-hueso">
              <h3 className="display t-h3">{t("flexTitle")}</h3>
              <p className="mt-2 max-w-[40ch]">{t("flexText")}</p>
            </div>
          </article>

          {/* C: urbanización */}
          <article className="reveal rounded-lg bg-tierra-100 p-6 sm:p-8 lg:col-span-5" style={delay(100)}>
            <h3 className="display t-h3">{t("urbanTitle")}</h3>
            <p className="mt-3 text-tinta-900">{t("urbanText")}</p>
            <p className="t-small mt-4 text-tinta-900">{t("streets")}</p>
          </article>

          {/* D: ubicación */}
          <article className="reveal relative grid overflow-hidden rounded-lg bg-white shadow-[var(--e1)] sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:col-span-12" style={delay(60)}>
            <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
              <h3 className="display t-h3">{t("locationTitle")}</h3>
              <p className="max-w-[48ch] text-tinta-900">{t("locationText")}</p>
              <Link href={{ pathname: "/", hash: "ubicacion" }} className="link-action">
                {t("locationCta")}
                <ArrowUpRight size={18} aria-hidden />
              </Link>
            </div>
            <div className="relative min-h-[200px]">
              <Image src="/img/mapa-quintana-roo.webp" alt={t("mapAlt")} fill sizes="(min-width:1024px) 40vw, 92vw" className="object-cover object-[50%_58%]" />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
