import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Isotipo } from "@/components/brand/Logo";
import { whatsappLink } from "@/lib/whatsapp";

/** Cierre: única banda de terracota sólida, con isotipo decorativo y una hoja. */
export function FinalCta() {
  const t = useTranslations("finalCta");
  const tw = useTranslations("whatsapp");
  return (
    <section data-scene="final" className="on-dark relative isolate overflow-hidden bg-tierra-600 text-white">
      <Isotipo className="pointer-events-none absolute -right-24 top-1/2 -z-10 h-[140%] -translate-y-1/2 text-hueso opacity-[0.12]" />
      <Image
        src="/img/hoja-monstera.webp"
        alt=""
        width={552}
        height={514}
        sizes="360px"
        className="pointer-events-none absolute -right-2 -bottom-4 -z-10 hidden h-auto w-[300px] xl:w-[360px] lg:block"
      />
      <div className="wrap py-16 lg:py-24">
        <h2 className="t-h2 display reveal max-w-[18ch]">{t("title")}</h2>
        <p className="t-lead reveal mt-4 max-w-[52ch] text-white" style={{ ["--d" as string]: "80ms" }}>
          {t("text")}
        </p>
        <p className="t-small mt-2 text-white">{t("priceNote")}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link href={{ pathname: "/", hash: "cotiza" }} className="btn btn-light max-sm:w-full">
            {t("primary")}
          </Link>
          <a href={whatsappLink(tw("general"))} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline decoration-[1.5px] underline-offset-4 hover:text-hueso">
            {t("secondary")}
          </a>
        </div>
      </div>
    </section>
  );
}
