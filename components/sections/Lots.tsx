import Image from "next/image";
import { useTranslations } from "next-intl";
import { LotCalculator } from "@/components/LotCalculator";
import { BandaCifras } from "@/components/BandaCifras";
import { Link } from "@/i18n/navigation";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/**
 * Lotes: banda de cifras (S3) con las tres cifras ya publicadas y, debajo, sobre
 * hueso con textura de palma, la calculadora sin tarjeta (izquierda) y el render
 * ilustrativo que sale a sangre por la derecha. Ganchos para M2:
 * `[data-scene="lots"]`, `.lots-frame` (marco del render, se revela con la losa) y
 * `.lots-img`; en la calculadora, `[data-calc-slider]`, `[data-calc-price]` y el
 * evento "solara:calc" (detail = m2).
 */
export function Lots() {
  const t = useTranslations("lots");
  const tg = useTranslations("gallery");

  return (
    <section id="lotes" data-scene="lots" className="overflow-x-clip bg-hueso">
      <BandaCifras
        src="/img/render-fachada-2.webp"
        position="50% 45%"
        compact
        title={t("title")}
        figures={[
          { value: t("stat4Value"), label: t("stat4Label") },
          { value: t("stat2Value"), label: t("stat2Label") },
          { value: t("stat3Value"), label: t("stat3Label") },
        ]}
        cta={
          <Link href={{ pathname: "/", hash: "cotiza" }} className="btn btn-primary">
            {t("cta")}
          </Link>
        }
        caption={tg("caption")}
      />

      <div className="tx-palma section">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-stretch lg:gap-8">
          <div className="reveal lg:col-span-6">
            <LotCalculator />
          </div>

          <figure className="reveal flex flex-col lg:col-span-6 lg:col-start-7 lg:-mr-6 xl:-mr-[calc(max(0px,(100vw-1280px)/2)+40px)]" style={delay(80)}>
            <div className="lots-frame relative isolate aspect-[4/5] overflow-hidden max-lg:-mx-5 max-lg:aspect-[4/3] lg:aspect-auto lg:min-h-[420px] lg:flex-1">
              <Image
                src="/img/render-fachada-5-vertical.webp"
                alt={t("renderAlt")}
                fill
                sizes="(min-width:1024px) 50vw, 100vw"
                className="lots-img -z-10 object-cover object-[50%_40%]"
              />
              <div className="scrim-text absolute inset-0 -z-10" />
              <div className="on-dark absolute inset-x-0 bottom-0 p-6 text-hueso sm:p-8 max-lg:px-5">
                <p className="display t-h3">{t("renderTitle")}</p>
              </div>
            </div>
            <figcaption className="t-small mt-3 max-w-[56ch] text-tinta-600 lg:pr-6 xl:pr-[calc(max(0px,(100vw-1280px)/2)+40px)]">{t("renderCaption")}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
