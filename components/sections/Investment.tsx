import Image from "next/image";
import { useTranslations } from "next-intl";
import { Isotipo } from "@/components/brand/Logo";
import { whatsappLink } from "@/lib/whatsapp";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/**
 * Inversión. M3 (apertura del isotipo): escena `.inv-track` (200vh en desktop)
 * con `.inv-stage` sticky. La foto va en su marco vertical a resolución nativa
 * (993 px de ancho): nunca se estira a ancho completo. El controlador recorta
 * la foto con un rombo (la forma del isotipo) que se abre hasta llenar el marco
 * mientras el trazo terracota se desvanece. Sin movimiento: foto completa.
 * Toda cifra lleva fuente y año visibles.
 */
export function Investment() {
  const t = useTranslations("investment");
  const tw = useTranslations("whatsapp");

  return (
    <section id="inversion" data-scene="investment" className="bg-hueso">
      <div className="inv-track lg:h-[200vh]">
        <div className="inv-stage lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:items-center">
          <div className="wrap grid items-center gap-10 pt-16 lg:grid-cols-12 lg:gap-8 lg:pt-[var(--header-h)]">
            <div className="lg:col-span-5">
              <h2 className="t-h2 display reveal max-w-[16ch]">{t("title")}</h2>
              <p className="t-lead reveal prose-measure mt-5 text-tinta-900" style={delay(80)}>
                {t("lead")}
              </p>
            </div>
            <figure className="investment-photo relative mx-auto w-full max-w-[460px] lg:col-span-6 lg:col-start-7 lg:mx-0 lg:aspect-[993/1284] lg:h-[min(78dvh,760px)] lg:w-auto lg:max-w-none lg:justify-self-end">
              <div className="inv-frame aspect-[993/1284] h-full w-full overflow-hidden rounded-lg">
                <Image
                  src="/img/letrero-mahahual-atardecer.webp"
                  alt={t("imageAlt")}
                  width={993}
                  height={1284}
                  sizes="(min-width:1024px) 40vw, 90vw"
                  quality={80}
                  className="inv-img h-full w-full object-cover"
                />
              </div>
              <Isotipo className="inv-iso pointer-events-none absolute inset-0 m-auto h-auto w-full text-tierra-600" />
            </figure>
          </div>
        </div>
      </div>

      <div className="section wrap !pt-16 lg:!pt-24">
        <div className="investment-stats grid gap-12 lg:grid-cols-[1.35fr_1fr_1fr] lg:items-start lg:gap-10">
          <div className="reveal">
            <p className="display t-display-1 num leading-none text-tierra-600">{t("stat1Value")}</p>
            <p className="t-lead mt-4 max-w-[30ch] text-tinta-900">{t("stat1Label")}</p>
            <p className="t-small mt-3 text-tinta-600">{t("stat1Source")}</p>
          </div>
          {([2, 3] as const).map((n) => (
            <div key={n} className="reveal border-t border-tinta-900/12 pt-6" style={delay(n * 60)}>
              <p className="display t-h2 num leading-tight text-tierra-600">{t(`stat${n}Value` as "stat2Value")}</p>
              <p className="mt-2 text-tinta-900">{t(`stat${n}Label` as "stat2Label")}</p>
              <p className="t-small mt-2 text-tinta-600">{t(`stat${n}Source` as "stat2Source")}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-10 border-t border-tinta-900/12 pt-10 lg:mt-20 lg:grid-cols-2 lg:gap-16">
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
