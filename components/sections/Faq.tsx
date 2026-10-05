import { useTranslations } from "next-intl";
import { CaretDown } from "@phosphor-icons/react/ssr";
import { whatsappLink } from "@/lib/whatsapp";

const KEYS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/** FAQ: <details> nativo (una abierta a la vez con `name`) + JSON-LD FAQPage. */
export function Faq() {
  const t = useTranslations("faq");
  const tw = useTranslations("whatsapp");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: KEYS.map((n) => ({
      "@type": "Question",
      name: t(`q${n}` as "q1"),
      acceptedAnswer: { "@type": "Answer", text: t(`a${n}` as "a1") },
    })),
  };

  return (
    <section id="faq" data-scene="faq" className="section bg-hueso">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="wrap">
        <div className="mx-auto max-w-[56rem]">
          <h2 className="t-h2 display reveal">{t("title")}</h2>
          <p className="t-lead reveal prose-measure mt-4 text-tinta-900">{t("lead")}</p>
          <div className="mt-10">
            {KEYS.map((n) => (
              <details key={n} name="faq" className="group border-b border-tinta-900/12">
                <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-6 py-4 focus-visible:outline-offset-[-2px]">
                  <span className="display text-[1.25rem] leading-snug sm:text-[1.5rem]">{t(`q${n}` as "q1")}</span>
                  <CaretDown size={22} className="faq-caret shrink-0 text-tierra-600 transition-transform duration-200" aria-hidden />
                </summary>
                <p className="prose-measure pb-6 text-tinta-900">{t(`a${n}` as "a1")}</p>
              </details>
            ))}
          </div>
          <a href={whatsappLink(tw("general"))} target="_blank" rel="noopener noreferrer" className="link-action mt-8">
            {t("cta")}
          </a>
        </div>
      </div>
    </section>
  );
}
