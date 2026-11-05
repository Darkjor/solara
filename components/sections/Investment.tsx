import Image from "next/image";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "@phosphor-icons/react/ssr";
import { Isotipo } from "@/components/brand/Logo";
import { BandaCifras } from "@/components/BandaCifras";
import { whatsappLink } from "@/lib/whatsapp";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/**
 * Inversion: certeza juridica, banda de cifras del destino y esquemas flexibles, sin tarjetas. M3 (apertura del isotipo):
 * escena `.inv-track` (160vh) con `.inv-stage` sticky, solo con la clase `scene-live` (escritorio con movimiento). La foto va en
 * su marco vertical a resolucion nativa (993 px de ancho): nunca se estira a ancho
 * completo. El controlador recorta la foto con un rombo (la forma del isotipo) que
 * se abre hasta llenar el marco mientras el trazo terracota se desvanece. Sin
 * movimiento: foto completa. Toda cifra lleva fuente y ano visibles.
 */
export function Investment() {
  const t = useTranslations("investment");
  const tw = useTranslations("whatsapp");
  const tf = useTranslations("finalCta");

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
              <div className="inv-frame aspect-[993/1284] h-full w-full overflow-hidden">
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

      {/* Destino: cifras de Sectur con fuente y ano, sobre foto a sangre. */}
      <BandaCifras
        src="/img/lifestyle-playa-pareja.webp"
        position="50% 30%"
        compact
        strongVeil
        title={t("destinoTitle")}
        figures={[
          { value: t("stat1Value"), label: t("stat1Label") },
          { value: t("stat2Value"), label: t("stat2Label") },
        ]}
        caption={t("source")}
      />

      {/* Esquemas de adquisicion flexibles: parrafo y enlace de accion, sin tarjeta. */}
      <div className="wrap grid gap-6 py-12 lg:grid-cols-12 lg:gap-8 lg:py-14">
        <div className="reveal lg:col-span-5">
          <span aria-hidden className="block h-px w-10 bg-tierra-600" />
          <h3 className="display t-h3 mt-4">{t("flexTitle")}</h3>
        </div>
        <div className="reveal lg:col-span-6 lg:col-start-7" style={delay(80)}>
          <p className="max-w-[44ch] text-tinta-900">{t("flexText")}</p>
          <a href={whatsappLink(tw("general"))} target="_blank" rel="noopener noreferrer" className="link-action mt-5">
            {tf("secondary")}
          </a>
        </div>
        <p className="t-small max-w-[62ch] text-tinta-600 lg:col-span-12">{t("disclaimer")}</p>
      </div>
    </section>
  );
}
