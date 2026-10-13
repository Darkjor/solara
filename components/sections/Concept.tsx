import Image from "next/image";
import { useTranslations } from "next-intl";
import { site } from "@/lib/site";

/**
 * Concepto, intro en tres fases: elegir el lugar, que significa SOLARA, quien la
 * desarrolla. M1 (escritorio con movimiento): `.concept-track` de 200vh con
 * `.concept-stage` sticky; el controlador (components/motion/Scenes.tsx) lo muestra
 * con la clase `scene-live`, cambia `data-step` (1 a 3) y barre la foto con un
 * recorte vertical entre fases. Movil, sin JS y movimiento reducido:
 * `.concept-stack`, tres bloques apilados. Los dos modos comparten datos, no marcado.
 */
export function Concept() {
  const t = useTranslations("concept");
  const phases = [
    { n: 1, src: "/img/lifestyle-terraza.webp", alt: t("alt1"), w: 1401, h: 2100, title: t("title"), text: t("lead") },
    { n: 2, src: "/img/logo-muro-piedra.webp", alt: t("alt2"), w: 912, h: 1168, title: t("meaningTitle"), text: t("meaningText") },
    { n: 3, src: "/img/render-fachada-4-vertical.webp", alt: t("alt3"), w: 1478, h: 2170, title: t("byTitle"), text: null },
  ] as const;
  const brochure = (
    <a href={site.brochureUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mt-7">
      {t("brochure")}
    </a>
  );

  return (
    <section id="concepto" data-scene="concept" className="concept-section section bg-hueso">
      {/* Version apilada (movil, sin JS, movimiento reducido). */}
      <div className="concept-stack wrap grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        {phases.map((p) => (
          <article
            key={p.n}
            className={`concept-step reveal ${p.n === 2 ? "lg:mt-16" : ""} ${p.n === 3 ? "sm:col-span-2 sm:mx-auto sm:max-w-[420px] lg:col-span-1 lg:mx-0 lg:max-w-none" : ""}`}
          >
            <figure>
              <div className="overflow-hidden rounded-lg bg-arena-200">
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={p.w}
                  height={p.h}
                  sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              {p.n === 3 && <figcaption className="t-small mt-2 text-tinta-600">{t("caption3")}</figcaption>}
            </figure>
            {p.n === 1 ? (
              <h2 className="t-h2 display mt-6 text-tinta-900">{p.title}</h2>
            ) : (
              <h3 className="t-h3 display mt-6 text-tinta-900">{p.title}</h3>
            )}
            {p.text && <p className="mt-3 max-w-[34ch] text-tinta-900">{p.text}</p>}
            {p.n === 3 && brochure}
          </article>
        ))}
      </div>

      {/* Escena fija (escritorio). Oculta hasta que GSAP esta listo. */}
      <div className="concept-track" data-concept-track>
        <div className="concept-stage" data-step="1">
          <div className="wrap grid h-full items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="concept-phases">
                {phases.map((p) => (
                  <div key={p.n} data-phase={p.n} className="concept-phase">
                    {p.n === 1 ? (
                      <h2 className="t-h2 display max-w-[14ch] text-tinta-900">{p.title}</h2>
                    ) : (
                      <h3 className="t-h2 display max-w-[14ch] text-tinta-900">{p.title}</h3>
                    )}
                    {p.text && <p className="t-lead mt-5 max-w-[36ch] text-tinta-900">{p.text}</p>}
                    {p.n === 3 && brochure}
                  </div>
                ))}
              </div>
              <div className="concept-bar mt-10" aria-hidden>
                {phases.map((p) => (
                  <span key={p.n} className="concept-seg">
                    <i className="concept-seg-fill" />
                  </span>
                ))}
              </div>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 lg:justify-self-center">
              <div className="concept-window relative aspect-[4/5] h-[min(68dvh,680px)] overflow-hidden rounded-lg bg-arena-200">
                {phases.map((p) => (
                  <div key={p.n} data-photo={p.n} className="absolute inset-0">
                    <Image src={p.src} alt={p.alt} fill sizes="560px" className="object-cover" />
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
    </section>
  );
}
