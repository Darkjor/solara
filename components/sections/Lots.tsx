import Image from "next/image";
import { useTranslations } from "next-intl";
import { LotCalculator } from "@/components/LotCalculator";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/**
 * Lotes, dos columnas: tarjeta del lote con la calculadora y render ilustrativo.
 * Ganchos para M2: `[data-scene="lots"]`, `.lots-frame` (marco del render, se
 * revela con la losa) y `.lots-img`; en la calculadora, `[data-calc-slider]`,
 * `[data-calc-price]` y el evento "solara:calc" (detail = m2).
 */
export function Lots() {
  const t = useTranslations("lots");

  return (
    <section id="lotes" data-scene="lots" className="section bg-hueso">
      <div className="wrap grid gap-6 lg:grid-cols-12 lg:gap-8">
        <article className="reveal rounded-lg border border-tinta-900/12 bg-white p-6 shadow-[var(--e1)] sm:p-8 lg:col-span-7">
          <h2 className="t-h2 display max-w-[20ch]">{t("title")}</h2>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-[1.3fr_1fr_1fr]">
            <div className="col-span-2 sm:col-span-1">
              <dt className="t-small text-tinta-600">{t("stat4Label")}</dt>
              <dd className="display num mt-1 text-[1.75rem] leading-tight text-tierra-600 sm:text-[2rem]">{t("stat4Value")}</dd>
            </div>
            <div>
              <dt className="t-small text-tinta-600">{t("stat2Label")}</dt>
              <dd className="display num mt-1 text-[1.375rem] leading-tight text-tinta-900">{t("stat2Value")}</dd>
            </div>
            <div>
              <dt className="t-small text-tinta-600">{t("stat3Label")}</dt>
              <dd className="display num mt-1 text-[1.375rem] leading-tight text-tinta-900">{t("stat3Value")}</dd>
            </div>
          </dl>

          <LotCalculator />
        </article>

        <figure className="reveal flex flex-col lg:col-span-5" style={delay(80)}>
          <div className="lots-frame relative isolate min-h-[300px] flex-1 lg:min-h-[360px] overflow-hidden rounded-lg bg-arena-200">
            <Image
              src="/img/render-fachada-5-vertical.webp"
              alt={t("renderAlt")}
              fill
              sizes="(min-width:1024px) 40vw, 92vw"
              className="lots-img -z-10 object-cover object-[50%_40%]"
            />
            <div className="scrim-text absolute inset-0 -z-10" />
            <div className="on-dark absolute inset-x-0 bottom-0 p-6 text-hueso sm:p-8">
              <p className="display t-h3">{t("renderTitle")}</p>
            </div>
          </div>
          <figcaption className="t-small mt-3 text-tinta-600">{t("renderCaption")}</figcaption>
        </figure>
      </div>
    </section>
  );
}
