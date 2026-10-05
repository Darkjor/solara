import Image from "next/image";
import { useTranslations } from "next-intl";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/**
 * Concepto. Ganchos para M1 (fase 2): `[data-scene="concept"]`,
 * `.concept-sticky` (columna fija), `.concept-step[data-step="1|2|3"]` con su
 * `.concept-photo` y `.concept-line`. Hoy ya es una pila de tres bloques con la
 * consigna completa en el DOM (también para móvil y movimiento reducido).
 */
export function Concept() {
  const t = useTranslations("concept");
  const steps = [
    { n: 1, src: "/img/logo-muro-piedra.webp", alt: t("alt1"), w: 912, h: 1168, caption: "" },
    { n: 2, src: "/img/lifestyle-terraza.webp", alt: t("alt2"), w: 1401, h: 2100, caption: "" },
    { n: 3, src: "/img/render-fachada-4-vertical.webp", alt: t("alt3"), w: 1478, h: 2170, caption: t("caption3") },
  ] as const;

  return (
    <section id="concepto" data-scene="concept" className="section bg-hueso">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="concept-sticky lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <h2 className="t-h2 display reveal">{t("title")}</h2>
            <p className="t-lead reveal prose-measure mt-6 text-tinta-900" style={delay(80)}>
              {t("lead")}
            </p>
            <p className="reveal prose-measure mt-6" style={delay(140)}>
              {t("body1")}
            </p>
            <p className="reveal prose-measure mt-4" style={delay(200)}>
              {t("body2")}
            </p>
            <p className="reveal t-small mt-8 max-w-[44ch] border-t border-tinta-900/12 pt-4 text-tinta-600">{t("name")}</p>
          </div>
        </div>

        <div className="grid gap-16 lg:col-span-7 lg:gap-24">
          {steps.map((s) => (
            <article
              key={s.n}
              data-step={s.n}
              className={`concept-step reveal grid items-end gap-6 sm:grid-cols-[1.1fr_1fr] ${s.n === 2 ? "lg:ml-14" : ""}`}
            >
              <figure className="concept-photo">
                <div className="stone overflow-hidden bg-arena-200">
                  <Image
                    src={s.src}
                    alt={s.alt}
                    width={s.w}
                    height={s.h}
                    sizes="(min-width:1024px) 34vw, (min-width:640px) 55vw, 90vw"
                    className="aspect-[4/5] w-full object-cover"
                  />
                </div>
                {s.caption && <figcaption className="t-small mt-2 text-tinta-600">{s.caption}</figcaption>}
              </figure>
              <div className="pb-4">
                <h3 className="concept-line t-h3 display text-tinta-900">{t(`pillar${s.n}Title` as "pillar1Title")}</h3>
                <p className="mt-3 max-w-[34ch] text-tinta-900">{t(`pillar${s.n}Text` as "pillar1Text")}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
