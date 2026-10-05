import { setRequestLocale } from "next-intl/server";
import { Hero, TrustStrip } from "@/components/sections/Hero";
import { Concept } from "@/components/sections/Concept";
import { Lots } from "@/components/sections/Lots";
import { Investment } from "@/components/sections/Investment";
import { Advantages } from "@/components/sections/Advantages";
import { Location } from "@/components/sections/Location";
import { Availability } from "@/components/sections/Availability";
import { Brokers } from "@/components/sections/Brokers";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Scenes } from "@/components/motion/Scenes";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Hero />
      <TrustStrip />
      <Concept />
      <Lots />
      <Investment />
      <Advantages />
      <Location />
      <Availability />
      <Brokers />
      <Faq />
      <FinalCta />
      <Scenes />
    </>
  );
}
