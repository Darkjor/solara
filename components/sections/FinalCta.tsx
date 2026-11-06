import { useTranslations } from "next-intl";
import { LeadForm } from "@/components/LeadForm";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Cierre: unica banda de terracota solida, con textura de piedra al 12 % (multiply).
 * Dos columnas desde 1024 px: texto a la izquierda, formulario (superficie blanca,
 * AA sobre la terracota) a la derecha. Movil: texto arriba, formulario abajo.
 */
export function FinalCta() {
  const t = useTranslations("finalCta");
  const tw = useTranslations("whatsapp");
  return (
    <section data-scene="final" className="on-dark tx-piedra relative isolate overflow-hidden bg-tierra-600 text-white">
      <div className="wrap grid items-center gap-10 py-16 lg:grid-cols-12 lg:gap-12 lg:py-24">
        <div className="lg:col-span-6">
          <h2 className="t-h2 display reveal max-w-[18ch]">{t("title")}</h2>
          <p className="t-lead reveal mt-4 max-w-[52ch] text-white" style={{ ["--d" as string]: "80ms" }}>
            {t("text")}
          </p>
          <p className="t-small mt-2 text-white">{t("priceNote")}</p>
          <div className="mt-8">
            <a href={whatsappLink(tw("general"))} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline decoration-[1.5px] underline-offset-4 hover:text-hueso">
              {t("secondary")}
            </a>
          </div>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <LeadForm variant="quote" id="cotiza" className="w-full scroll-mt-24" />
        </div>
      </div>
    </section>
  );
}
