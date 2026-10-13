import Image from "next/image";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "@phosphor-icons/react/ssr";
import { Isotipo } from "@/components/brand/Logo";
import { whatsappLink } from "@/lib/whatsapp";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/**
 * Inversion: certeza juridica + dos tarjetas con foto. M3 (apertura del isotipo):
 * escena `.inv-track` (160vh) con `.inv-stage` sticky, solo con la clase `scene-live` (escritorio con movimiento). La foto va en
 * su marco vertical a resolucion nativa (993 px de ancho): nunca se estira a ancho
 * completo. El controlador recorta la foto con un rombo (la forma del isotipo) que
 * se abre hasta llenar el marco mientras el trazo terracota se desvanece. Sin
 * movimiento: foto completa. Toda cifra lleva fuente y ano visibles.
 */
export function Investment() {
  const t = useTranslations("investment");

  return (
    <section id="inversion" data-scene="investment" className="bg-hueso">
      <div className="inv-track">
        <div className="inv-stage">
          <div className="inv-grid wrap grid items-center gap-10 pt-16 lg:grid-cols-12 lg:gap-8 lg:pt-[var(--header-h)]">
            <div className="lg:col-span-5">
              <h2 className="display reveal max-w-[22ch] text-[clamp(1.75rem,1.2rem+1.9vw,2.5rem)] leading-[1.12]">{t("title")}</h2>
              <p className="t-lead reveal prose-measure mt-5 text-tinta-900" style={delay(80)}>
                {t("legalText")}
              </p>
              <ul aria-label={t("legalTitle")} className="reveal mt-6 grid gap-3" style={delay(120)}>
                {(["seal1", "seal2", "seal3"] as const).map((k) => (
                  <li key={k} className="flex items-center gap-3">
                    <ShieldCheck size={26} weight="light" className="shrink-0 text-tierra-600" aria-hidden />
                    <span className="display text-[1.25rem]">{t(k)}</span>
                  </li>
                ))}
              </ul>
              <div className="reveal mt-8" style={delay(160)}>
                <a href={whatsappLink(t("packWa"))} target="_blank" rel="noopener noreferrer" className="btn btn-secondary max-sm:w-full max-sm:whitespace-normal max-sm:py-2 max-sm:text-center">
                  {t("packCta")}
                </a>
              </div>
            </div>
            <figure className="investment-photo relative mx-auto w-full max-w-[460px] lg:col-span-6 lg:col-start-7 lg:mx-0 lg:aspect-[993/1284] lg:h-[min(78dvh,760px)] lg:w-auto lg:max-w-none lg:justify-self-end">
              <div className="inv-frame aspect-[993/1284] h-full w-full overflow-hidden rounded-lg">
                <Image
                  src="/img/letrero-mahahual-atardecer.webp"
                  alt={t("imageAlt")}
                  width={993}
                  height={1284}
                  sizes="(min-width:1024px) 40vw, 90vw"
                  quality={75}
                  className="inv-img h-full w-full object-cover"
                />
              </div>
              <Isotipo className="inv-iso pointer-events-none absolute inset-0 m-auto h-auto w-full text-tierra-600" />
            </figure>
          </div>
        </div>
      </div>

      <div className="section wrap !pt-12 lg:!pt-16">
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:gap-6">
          {/* Destino: cifras de Sectur con fuente y ano. */}
          <article className="reveal relative isolate flex min-h-[340px] flex-col lg:min-h-[420px] justify-end overflow-hidden rounded-lg">
            <Image src="/img/lifestyle-playa-mujer.webp" alt="" fill sizes="(min-width:1024px) 55vw, 92vw" className="-z-10 object-cover object-[50%_8%]" />
            <div className="absolute inset-0 -z-10 bg-selva-950/45" />
            <div className="scrim-text absolute inset-0 -z-10" />
            <div className="on-dark p-6 text-hueso sm:p-8">
              <h3 className="display t-h3">{t("destinoTitle")}</h3>
              <ul className="mt-6 grid gap-5 border-t border-hueso/25 pt-5 sm:grid-cols-[1.3fr_1fr]">
                {([1, 2] as const).map((n) => (
                  <li key={n}>
                    <p className="display num text-[2.25rem] leading-none text-tierra-300 sm:text-[2.75rem]">{t(`stat${n}Value` as "stat1Value")}</p>
                    <p className="mt-2 max-w-[30ch]">{t(`stat${n}Label` as "stat1Label")}</p>
                  </li>
                ))}
              </ul>
              <p className="t-small mt-4">{t("source")}</p>
            </div>
          </article>

          {/* Esquemas de adquisicion flexibles. */}
          <article className="reveal relative isolate flex min-h-[340px] flex-col lg:min-h-[420px] justify-end overflow-hidden rounded-lg" style={delay(80)}>
            <Image src="/img/lifestyle-playa-pareja.webp" alt={t("flexAlt")} fill sizes="(min-width:1024px) 40vw, 92vw" className="-z-10 object-cover object-[50%_40%]" />
            <div className="absolute inset-0 -z-10 bg-selva-950/45" />
            <div className="scrim-text absolute inset-0 -z-10" />
            <div className="on-dark p-6 text-hueso sm:p-8">
              <h3 className="display t-h3">{t("flexTitle")}</h3>
              <p className="mt-2 max-w-[40ch]">{t("flexText")}</p>
            </div>
          </article>
        </div>
        <p className="t-small mt-6 max-w-[62ch] text-tinta-600">{t("disclaimer")}</p>
      </div>
    </section>
  );
}
