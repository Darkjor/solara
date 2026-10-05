import Image from "next/image";
import { useTranslations } from "next-intl";
import { whatsappLink } from "@/lib/whatsapp";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/**
 * Inversión. Ganchos para M3 (fase 2): `[data-scene="investment"]`,
 * `.investment-photo` (foto del atardecer, ya a sangre) y `.investment-stats`.
 * La capa-agujero del isotipo se monta encima de `.investment-photo`.
 * Toda cifra lleva fuente y año visibles.
 */
export function Investment() {
  const t = useTranslations("investment");
  const tw = useTranslations("whatsapp");

  return (
    <section id="inversion" data-scene="investment" className="bg-hueso">
      <div className="investment-photo relative h-[64dvh] min-h-[360px] w-full overflow-hidden lg:h-[78dvh]">
        <Image
          src="/img/letrero-mahahual-atardecer.webp"
          alt={t("imageAlt")}
          fill
          sizes="100vw"
          quality={75}
          className="object-cover object-[50%_72%]"
        />
      </div>

      <div className="section wrap">
        <h2 className="t-h2 display reveal max-w-[22ch]">{t("title")}</h2>
        <p className="t-lead reveal prose-measure mt-5 text-tinta-900" style={delay(80)}>
          {t("lead")}
        </p>

        <div className="investment-stats mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <div className="reveal lg:col-span-7">
            <p className="display t-display-1 num leading-none text-tierra-600">{t("stat1Value")}</p>
            <p className="t-lead mt-3 max-w-[30ch] text-tinta-900">{t("stat1Label")}</p>
            <p className="t-small mt-3 text-tinta-600">{t("stat1Source")}</p>
          </div>
          <div className="grid gap-10 lg:col-span-4 lg:col-start-9 lg:translate-y-12">
            {([2, 3] as const).map((n) => (
              <div key={n} className="reveal border-t border-tinta-900/12 pt-6" style={delay(n * 60)}>
                <p className="display t-h2 num leading-tight text-tierra-600">{t(`stat${n}Value` as "stat2Value")}</p>
                <p className="mt-2 text-tinta-900">{t(`stat${n}Label` as "stat2Label")}</p>
                <p className="t-small mt-2 text-tinta-600">{t(`stat${n}Source` as "stat2Source")}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 grid gap-10 border-t border-tinta-900/12 pt-10 lg:mt-28 lg:grid-cols-2 lg:gap-16">
          <div className="reveal">
            <h3 className="display t-h3">{t("chinchorroTitle")}</h3>
            <p className="prose-measure mt-3 text-tinta-900">{t("chinchorroText")}</p>
          </div>
          <div className="reveal" style={delay(80)}>
            <p className="prose-measure text-tinta-900">{t("malecon")}</p>
            <p className="t-small mt-3 text-tinta-600">{t("maleconSource")}</p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a href={whatsappLink(tw("general"))} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            {t("cta")}
          </a>
          <p className="t-small max-w-[52ch] text-tinta-600">{t("disclaimer")}</p>
        </div>
      </div>
    </section>
  );
}
