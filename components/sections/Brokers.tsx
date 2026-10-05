import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { LeadForm } from "@/components/LeadForm";
import { site } from "@/lib/site";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/** Aliados / brokers: arena, texto en tinta, formulario aparte (tipo broker). */
export function Brokers() {
  const t = useTranslations("brokers");
  return (
    <section id="aliados" data-scene="brokers" className="section relative isolate overflow-hidden bg-arena-200">
      <Image
        src="/img/textura-sombra-palma.webp"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover object-[50%_40%] opacity-70 [mask-image:linear-gradient(90deg,#000_25%,transparent_95%)] max-lg:opacity-55 max-lg:[mask-image:linear-gradient(180deg,#000_30%,transparent_95%)]"
      />
      <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:col-span-6">
          <p className="t-label reveal text-tinta-900">{t("eyebrow")}</p>
          <h2 className="t-h2 display reveal mt-4" style={delay(60)}>
            {t("title")}
          </h2>
          <p className="t-lead reveal prose-measure mt-5 text-tinta-900" style={delay(120)}>
            {t("lead")}
          </p>
          <ul className="reveal mt-8 grid max-w-[52ch] gap-3" style={delay(160)}>
            {(["point1", "point2", "point3"] as const).map((k) => (
              <li key={k} className="border-t border-tinta-900/25 pt-3 text-tinta-900">
                {t(k)}
              </li>
            ))}
          </ul>
          <p className="t-small mt-4 text-tinta-900">{t("note")}</p>
          <a href={site.brochureUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mt-8">
            {t("brochure")}
            <ArrowUpRight size={18} aria-hidden />
          </a>
        </div>
        <div className="reveal lg:col-span-5 lg:col-start-8" style={delay(100)}>
          <LeadForm variant="broker" id="aliados-form" />
        </div>
      </div>
    </section>
  );
}
