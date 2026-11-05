import Image from "next/image";
import { showFinancingBand } from "@/lib/site";

export type Cifra = { value: string; label: string };

/**
 * BandaCifras (S3): foto a sangre con velo de selva-950 al 70 % (>= 0.66 bajo el
 * texto), tres cifras en una fila con filete de 1 px entre ellas (en movil,
 * apiladas con filete de 28 px), y un CTA. Sin tarjetas. Solo cifras ya
 * publicadas en el sitio; la variante `financiamiento` no se pinta mientras
 * `showFinancingBand` sea false. Foto con leyenda en HTML al pie.
 */
export function BandaCifras({
  variant = "cifras",
  src,
  alt = "",
  figures,
  cta,
  caption,
}: {
  variant?: "cifras" | "financiamiento";
  src: string;
  alt?: string;
  figures: [Cifra, Cifra, Cifra] | [Cifra, Cifra];
  /** Un solo CTA (el mismo del sitio), como elemento listo: <Link className="btn btn-primary">. */
  cta: React.ReactNode;
  caption?: string;
}) {
  if (variant === "financiamiento" && !showFinancingBand) return null;
  // Tamano decreciente: la primera cifra manda.
  const sizes = ["text-[clamp(2.75rem,1.8rem+4vw,5.5rem)]", "text-[clamp(2.25rem,1.5rem+3.2vw,4.5rem)]", "text-[clamp(2rem,1.3rem+2.6vw,3.75rem)]"];
  return (
    <div className="on-dark relative isolate flex min-h-[clamp(480px,48vw,640px)] flex-col justify-center overflow-hidden bg-selva-950 text-hueso">
      <Image src={src} alt={alt} fill sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-selva-950/70" />
      <div className="wrap py-16">
        <ul className="flex flex-col gap-6 md:flex-row md:items-end md:gap-0">
          {figures.map((f, i) => (
            <li key={f.value} className={`flex flex-col gap-6 md:block ${i > 0 ? "md:border-l md:border-hueso/30 md:pl-10" : ""} ${i < figures.length - 1 ? "md:pr-10" : ""}`}>
              {i > 0 && <span aria-hidden className="block h-px w-7 bg-hueso/30 md:hidden" />}
              <p className="flex flex-wrap items-baseline gap-x-3">
                <span className={`display num leading-none ${sizes[i]}`}>{f.value}</span>
                <span className="text-[1.0625rem] text-tierra-300">{f.label}</span>
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-10">{cta}</div>
      </div>
      {caption && <p className="wrap t-small pb-4 text-hueso/95">{caption}</p>}
    </div>
  );
}
