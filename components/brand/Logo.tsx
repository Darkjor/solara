import { ISO, SUB, TRANSFORM, VIEWBOX, WORD } from "./paths";

// Logotipo del cliente (trazados de `logos/logo-principal.svg`, recortados por
// tools/gen-logos.mjs). Se dibuja con `currentColor`: terracota sobre hueso,
// hueso sobre foto o selva. No estirar ni deformar: solo se escala por altura.

function Paths({ d }: { d: string[][] }) {
  return (
    <g transform={TRANSFORM} fill="currentColor">
      {d.flat().map((p, i) => (
        <path key={i} d={p} />
      ))}
    </g>
  );
}

/** Isotipo (silueta orgánica inspirada en Banco Chinchorro). */
export function Isotipo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={VIEWBOX.iso} className={className} aria-hidden focusable="false">
      <Paths d={[ISO]} />
    </svg>
  );
}

/** Logotipo principal completo: isotipo, SOLARA y "Lotes de Inversión". */
export function LogoFull({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={VIEWBOX.all} className={className} aria-hidden focusable="false">
      <Paths d={[ISO, WORD, SUB]} />
    </svg>
  );
}

/** Isotipo + palabra SOLARA en horizontal (header). Alto = `className` en la raíz. */
export function LogoLockup({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`} aria-hidden>
      <Isotipo className="h-full w-auto" />
      <svg viewBox={VIEWBOX.word} className="h-[46%] w-auto" focusable="false">
        <Paths d={[WORD]} />
      </svg>
    </span>
  );
}
