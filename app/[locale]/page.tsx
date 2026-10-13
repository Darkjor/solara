import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { Concept } from "@/components/sections/Concept";
import { Vivir } from "@/components/sections/Vivir";
import { Lots } from "@/components/sections/Lots";
import { Location } from "@/components/sections/Location";
import { Galeria } from "@/components/sections/Galeria";
import { Investment } from "@/components/sections/Investment";
import { Availability } from "@/components/sections/Availability";
import { Brokers } from "@/components/sections/Brokers";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Scenes } from "@/components/motion/Scenes";

/**
 * Orden de la estructura ZAMA (spec de Direccion, 2026-10-12):
 * inicio, concepto, vivir, lotes, ubicacion, galeria, inversion,
 * disponibilidad, aliados, faq, final.
 */
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <Concept />
      <Vivir />
      <Lots />
      <Location />
      <Galeria />
      <Investment />
      <Availability />
      <Brokers />
      <Faq />
      <FinalCta />
      <Scenes />
    </>
  );
}
