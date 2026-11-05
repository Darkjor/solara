import Image from "next/image";
import { useTranslations } from "next-intl";
import { LeadForm } from "@/components/LeadForm";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/**
 * Aliados / brokers: foto a sangre en la mitad izquierda (escritorio 50/50; en movil,
 * 16:9 arriba) y, a la derecha, titulo, una linea y el formulario (tipo broker) sin
 * tarjeta, sobre arena.
 */
export function Brokers() {
  const t = useTranslations("brokers");
  return (
    <section id="aliados" data-scene="brokers" className="bg-arena-200 lg:grid lg:grid-cols-2">
      <div className="relative aspect-video lg:aspect-auto">
        <Image src="/img/interior-ilustrativo.webp" alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover object-[50%_40%]" />
      </div>
      <div className="section px-5 md:px-6 lg:pl-14 lg:pr-[max(40px,calc((100vw-1280px)/2+40px))]">
        <h2 className="t-h2 display reveal">{t("title")}</h2>
        <p className="t-lead reveal prose-measure mt-5 text-tinta-900" style={delay(80)}>
          {t("lead")}
        </p>
        <div className="reveal mt-8" style={delay(100)}>
          <LeadForm variant="broker" id="aliados-form" />
        </div>
      </div>
    </section>
  );
}
