import { useTranslations } from "next-intl";
import { PlanViewer } from "@/components/PlanViewer";
import { whatsappLink } from "@/lib/whatsapp";
import { lotCount } from "@/lib/site";

/**
 * Disponibilidad. Ganchos para M5 (fase 2): `[data-scene="availability"]`,
 * `[data-plan-viewer]` (el visor; hoy ya funciona con zoom/arrastre) y
 * `[data-count]` (cifra 235 con su valor final en `data-count`).
 * El plano NO muestra estatus por lote: el cliente no lo ha entregado.
 */
export function Availability() {
  const t = useTranslations("availability");
  /** Cifra, texto y CTA: sobre el vacío del plano (desktop) o debajo (móvil). */
  const panel = (className: string) => {
    return (
      <aside className={className}>
        <p data-count={lotCount} className="display t-display-1 num leading-none text-tierra-300">
          {lotCount}
        </p>
        <p className="mt-3 text-hueso">{t("text")}</p>
        <p className="mt-2 text-hueso">{t("water")}</p>
        <a href={whatsappLink(t("wa"))} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-5 w-full lg:w-auto">
          {t("cta")}
        </a>
      </aside>
    );
  };
  return (
    <section id="disponibilidad" data-scene="availability" className="on-dark section bg-selva-900 text-hueso">
      <div className="wrap">
        <h2 className="t-h2 display reveal">{t("title")}</h2>
        <p className="t-lead reveal prose-measure mt-4 text-hueso" style={{ ["--d" as string]: "80ms" }}>
          {t("lead")}
        </p>

        <div className="mt-10">
          <PlanViewer>
            {panel("max-lg:hidden absolute right-[3%] bottom-[4%] w-[36%] max-w-[420px]")}
          </PlanViewer>
          <p className="t-small mt-3 text-hueso/90">{t("hint")}</p>
          {panel("mt-8 max-w-[52ch] lg:hidden")}
        </div>
        <p className="t-small mt-6 max-w-[70ch] text-hueso/90">{t("disclaimer")}</p>
      </div>
    </section>
  );
}
