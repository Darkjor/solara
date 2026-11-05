import Image from "next/image";
import { showFinancingBand } from "@/lib/site";

export type Cifra = { value: string; label: string };

/**
 * BandaCifras (S3): foto a sangre con velo de selva-950 al 70 % (>= 0.66 bajo el
 * texto), tres cifras en una fila con filete de 1 px entre ellas (en movil,
 * apiladas con filete de 28 px), y un CTA. Sin tarjetas. Solo cifras ya
 * publicadas en el sitio; la variante `financiamiento` no se pinta mientras
 * `showFinancingBand` sea false. Foto con leyenda en HTML al pie.
 * `title` (opcional) es el h2 de la seccion cuando la banda abre el bloque.
 */
export function BandaCifras({
  variant = "cifras",
  src,
  alt = "",
  position = "50% 50%",
  title,
  figures,
  cta,
  caption,
  compact = false,
}: {
  variant?: "cifras" | "financiamiento";
  src: string;
  alt?: string;
  position?: string;
  title?: string;
  figures: [Cifra, Cifra, Cifra] | [Cifra, Cifra];
  /** Un solo CTA (el mismo del sitio), como elemento listo: <Link className="btn btn-primary">. */
  cta?: React.ReactNode;
  caption?: string;
  /** Banda mas baja (clamp 400 a 520 px) para bloques que ya son largos. */
  compact?: boolean;
}) {
  if (variant === "financiamiento" && !showFinancingBand) return null;
  // Tamano decreciente: la primera cifra manda.
  const sizes = ["text-[clamp(2.25rem,1.5rem+3.4vw,4.75rem)]", "text-[clamp(2rem,1.3rem+2.8vw,3.75rem)]", "text-[clamp(1.75rem,1.2rem+2.2vw,3rem)]"];
  return (
    <div className={`on-dark relative isolate flex ${compact ? "min-h-[clamp(400px,36vw,520px)]" : "min-h-[clamp(480px,48vw,640px)]"} flex-col justify-center overflow-hidden bg-selva-950 text-hueso`}>
      <Image src={src} alt={alt} fill sizes="100vw" className="-z-20 object-cover" style={{ objectPosition: position }} />
      <div aria-hidden className="absolute inset-0 -z-10 bg-selva-950/70" />
      <div className={`wrap ${compact ? "py-12" : "py-16"}`}>
        {title && <h2 className={`t-h2 display reveal ${compact ? "mb-8" : "mb-10"} max-w-[20ch]`}>{title}</h2>}
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
        {cta && <div className="mt-10">{cta}</div>}
      </div>
      {caption && <p className="wrap t-small pb-4 text-hueso/95">{caption}</p>}
    </div>
  );
}
