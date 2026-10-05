import Image from "next/image";
import { useTranslations } from "next-intl";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/**
 * Concepto. M1 (desktop con movimiento): `.concept-track` alto + `.concept-stage`
 * sticky; el controlador de escenas (components/motion/Scenes.tsx) lo muestra
 * con la clase `scene-live` y reparte el progreso en tres tiempos (consigna).
 * Móvil, sin JS y movimiento reducido: `.concept-stack`, tres bloques apilados
 * con la consigna completa. Los dos modos comparten datos, no marcado.
 */
export function Concept() {
  const t = useTranslations("concept");
  const steps = [
    { n: 1, src: "/img/logo-muro-piedra.webp", alt: t("alt1"), w: 912, h: 1168, caption: "" },
    { n: 2, src: "/img/lifestyle-terraza.webp", alt: t("alt2"), w: 1401, h: 2100, caption: "" },
    { n: 3, src: "/img/render-fachada-4-vertical.webp", alt: t("alt3"), w: 1478, h: 2170, caption: t("caption3") },
  ] as const;
  const title = (n: number) => t(`pillar${n}Title` as "pillar1Title");
  const text = (n: number) => t(`pillar${n}Text` as "pillar1Text");

  return (
    <section id="concepto" data-scene="concept" className="section bg-hueso">
      <div className="wrap">
        <h2 className="t-h2 display reveal max-w-[20ch]">{t("title")}</h2>
        <p className="t-lead reveal prose-measure mt-6 text-tinta-900" style={delay(80)}>
          {t("lead")}
        </p>
      </div>

      {/* Versión apilada (móvil, sin JS, movimiento reducido). */}
      <div className="concept-stack wrap mt-14 grid gap-14 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-10">
        {steps.map((s) => (
          <article
            key={s.n}
            data-step={s.n}
            className={`concept-step reveal ${s.n === 2 ? "lg:mt-20" : ""} ${s.n === 3 ? "sm:col-span-2 sm:mx-auto sm:max-w-[420px] lg:col-span-1 lg:mx-0 lg:max-w-none" : ""}`}
          >
            <figure className="concept-photo">
              <div className="overflow-hidden rounded-lg bg-arena-200">
                <Image
                  src={s.src}
                  alt={s.alt}
                  width={s.w}
                  height={s.h}
                  sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              {s.caption && <figcaption className="t-small mt-2 text-tinta-600">{s.caption}</figcaption>}
            </figure>
            <h3 className="concept-line t-h3 display mt-6 text-tinta-900">{title(s.n)}</h3>
            <p className="mt-3 max-w-[34ch] text-tinta-900">{text(s.n)}</p>
          </article>
        ))}
      </div>

      {/* Escena fija (desktop). Oculta hasta que GSAP está listo. */}
      <div className="concept-track" data-concept-track>
        <div className="concept-stage" data-step="1">
          <div className="wrap grid h-full items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <ol className="concept-lines grid gap-3">
                {steps.map((s) => (
                  <li key={s.n} data-line={s.n}>
                    <h3 className="t-h2 display text-tinta-900">{title(s.n)}</h3>
                  </li>
                ))}
              </ol>
              <div className="concept-guides mt-8">
                {steps.map((s) => (
                  <p key={s.n} data-guide={s.n} className="t-lead max-w-[36ch] text-tinta-900">
                    {text(s.n)}
                  </p>
                ))}
              </div>
              <div className="concept-bar mt-10" aria-hidden>
                {steps.map((s) => (
                  <span key={s.n} className="concept-seg">
                    <i className="concept-seg-fill" />
                  </span>
                ))}
              </div>
            </div>
            <div className="lg:col-span-6 lg:col-start-6 lg:justify-self-center">
              <div className="concept-window relative aspect-[4/5] h-[min(68dvh,680px)] overflow-hidden rounded-lg bg-arena-200">
                {steps.map((s) => (
                  <div key={s.n} data-photo={s.n} className="absolute inset-0">
                    <Image src={s.src} alt={s.alt} fill sizes="560px" className="object-cover" />
                  </div>
                ))}
              </div>
              <p data-caption="3" className="concept-caption t-small mt-2 text-tinta-600">
                {t("caption3")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap mt-16 grid gap-6 lg:mt-24 lg:grid-cols-12 lg:gap-8">
        <p className="reveal prose-measure lg:col-span-5">{t("body1")}</p>
        <div className="reveal lg:col-span-6 lg:col-start-7" style={delay(80)}>
          <p className="prose-measure">{t("body2")}</p>
          <p className="t-small mt-6 max-w-[44ch] border-t border-tinta-900/12 pt-4 text-tinta-600">{t("name")}</p>
        </div>
      </div>
    </section>
  );
}
