import Image from "next/image";
import { useTranslations } from "next-intl";
import { LeadForm } from "@/components/LeadForm";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/** Aliados / brokers: titulo, una linea y el formulario (tipo broker), sobre arena. */
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
          <h2 className="t-h2 display reveal">{t("title")}</h2>
          <p className="t-lead reveal prose-measure mt-5 text-tinta-900" style={delay(80)}>
            {t("lead")}
          </p>
        </div>
        <div className="reveal lg:col-span-5 lg:col-start-8" style={delay(100)}>
          <LeadForm variant="broker" id="aliados-form" />
        </div>
      </div>
    </section>
  );
}
