import Image from "next/image";
import { useTranslations } from "next-intl";
import { LotCalculator } from "@/components/LotCalculator";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/**
 * Lotes + calculadora. Ganchos para M2 (fase 2): `[data-scene="lots"]`,
 * `.lots-photo` (parallax) y, en la calculadora, `[data-calc-slider]`,
 * `[data-calc-price]` y el evento "solara:calc" (detail = m2).
 */
export function Lots() {
  const t = useTranslations("lots");

  return (
    <section id="lotes" data-scene="lots" className="section bg-hueso">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-10">
        <figure className="lots-photo reveal lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-lg">
              <Image
                src="/img/render-fachada-5-vertical.webp"
                alt={t("renderAlt")}
                width={1478}
                height={2170}
                sizes="(min-width:1024px) 40vw, 92vw"
                className="lots-img aspect-[16/10] w-full object-cover object-[50%_40%] lg:aspect-[4/5]"
              />
            </div>
            <figcaption className="t-small mt-3 text-tinta-600">{t("renderCaption")}</figcaption>
          </div>
        </figure>

        <div className="lg:col-span-7 lg:pl-6">
          <p className="t-label reveal text-tierra-600">{t("eyebrow")}</p>
          <h2 className="t-h2 display reveal mt-4" style={delay(60)}>
            {t("title")}
          </h2>
          <p className="t-lead reveal prose-measure mt-5 text-tinta-900" style={delay(120)}>
            {t("lead")}
          </p>

          <dl className="reveal mt-10 grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:divide-x sm:divide-tinta-900/12">
            {([1, 2, 3, 4] as const).map((n) => (
              <div key={n} className="sm:px-5 sm:first:pl-0">
                <dt className="sr-only">{t(`stat${n}Label` as "stat1Label")}</dt>
                <dd>
                  <p className="display num text-[1.5rem] leading-tight text-tierra-600 sm:text-[1.625rem]">{t(`stat${n}Value` as "stat1Value")}</p>
                  <p className="t-small mt-1 text-tinta-900">{t(`stat${n}Label` as "stat1Label")}</p>
                </dd>
              </div>
            ))}
          </dl>

          <LotCalculator />

          <div className="mt-14">
            <h3 className="display t-h3">{t("uses")}</h3>
            <ul className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
              {([1, 2, 3, 4] as const).map((n) => (
                <li key={n} className="reveal border-t border-tinta-900/12 pt-4">
                  <p className="font-semibold">{t(`use${n}Title` as "use1Title")}</p>
                  <p className="mt-1 text-tinta-900">{t(`use${n}Text` as "use1Text")}</p>
                </li>
              ))}
            </ul>
            <p className="t-small mt-6 max-w-[62ch] text-tinta-600">{t("usesNote")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
