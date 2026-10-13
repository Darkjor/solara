import Image from "next/image";
import { useTranslations } from "next-intl";
import { VivirRow } from "@/components/VivirRow";

const delay = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

/** Fotos de las 4 tarjetas y su foco. Tres se repiten en Inversion: aqui el recorte es cuadrado y distinto. */
const CARDS = [
  { n: 1, src: "/img/lifestyle-playa-mujer.webp", pos: "50% 22%" },
  { n: 2, src: "/img/letrero-mahahual-atardecer.webp", pos: "50% 58%" },
  { n: 3, src: "/img/lifestyle-playa-pareja.webp", pos: "50% 50%" },
  { n: 4, src: "/img/textura-sombra-palma.webp", pos: "50% 40%" },
] as const;

/**
 * Vivir en SOLARA (bloque 3): fila horizontal libre, sin fijar (scroll-snap,
 * arrastre y flechas en VivirRow). Cada foto entra una vez con el recorte poligonal
 * de la losa (`.slab-reveal`, el mismo de M0); con movimiento reducido o sin JS se ve
 * completa. Tarjeta: foto, titulo y una linea, sin texto sobre la imagen.
 */
export function Vivir() {
  const t = useTranslations("vivir");
  return (
    <section id="vivir" data-scene="vivir" className="vivir-section bg-arena-100 py-[clamp(40px,5.5vw,80px)]">
      <VivirRow title={t("title")} prev={t("prev")} next={t("next")}>
        {CARDS.map((c, i) => (
          <li key={c.n} className="vivir-card">
            <figure className="vivir-photo reveal slab-reveal" style={delay(i * 90)}>
              <Image
                src={c.src}
                alt={t(`card${c.n}Alt` as "card1Alt")}
                fill
                sizes="(min-width:1280px) 380px, (min-width:768px) 29vw, 260px"
                draggable={false}
                className="object-cover"
                style={{ objectPosition: c.pos }}
              />
            </figure>
            <div className="reveal" style={delay(i * 90 + 140)}>
              <h3 className="display mt-4 text-[1.375rem] leading-[1.2] text-tinta-900">{t(`card${c.n}Title` as "card1Title")}</h3>
              <p className="mt-2 max-w-[34ch] text-[0.9375rem] leading-[1.5] text-tinta-900">{t(`card${c.n}Text` as "card1Text")}</p>
            </div>
          </li>
        ))}
      </VivirRow>
    </section>
  );
}
