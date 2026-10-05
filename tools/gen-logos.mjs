// Genera los SVG de marca recortados a partir de .materiales/web/logo-principal.svg
// (trazado negro, lienzo 8000x4500) y los datos para el componente <Logo>.
import fs from "fs";
const paths = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const T = "translate(0,4500) scale(0.1,-0.1)";
const group = (list) => list.map((p) => p.d.replace(/\s+/g, " ").trim());
const iso = group(paths.filter((p) => p.i <= 4));
const word = group(paths.filter((p) => p.i >= 5 && p.i <= 10));
const sub = group(paths.filter((p) => p.i >= 11));
const vb = { all: "2194 735 3612 3027", iso: "3101 735 1760 1715", word: "2194 2763 3612 617" };
const svg = (viewBox, groups, fill) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><g transform="${T}" fill="${fill}">${groups.flat().map((d) => `<path d="${d}"/>`).join("")}</g></svg>\n`;
const colors = { terracota: "#A65430", hueso: "#F5F3EF", tinta: "#1A1A1A" };
for (const [n, c] of Object.entries(colors)) {
  fs.writeFileSync(`public/brand/logo-${n}.svg`, svg(vb.all, [iso, word, sub], c));
  fs.writeFileSync(`public/brand/iso-${n}.svg`, svg(vb.iso, [iso], c));
}
fs.writeFileSync(
  "components/brand/paths.ts",
  `// Generado por tools/gen-logos.mjs desde el logo principal del cliente (no editar a mano).\nexport const TRANSFORM = ${JSON.stringify(T)};\nexport const VIEWBOX = ${JSON.stringify(vb)};\nexport const ISO = ${JSON.stringify(iso)};\nexport const WORD = ${JSON.stringify(word)};\nexport const SUB = ${JSON.stringify(sub)};\n`,
);
