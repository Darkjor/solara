// Verificacion del brief 2 (menos cajas, fondos, bandas) por DOM y consola, sin capturas.
// Uso: app en puerto 3301 y `node tools/check-brief2.mjs [base] [--full]`.
import { chromium } from "playwright-core";
import { exe } from "./exe.mjs";

const base = process.argv[2]?.startsWith("http") ? process.argv[2] : "http://localhost:3301";
const full = process.argv.includes("--full");
const runs = full
  ? [["es", 1440, 900], ["en", 1440, 900], ["es", 390, 844], ["en", 390, 844], ["es", 360, 740], ["en", 360, 740]]
  : [["es", 1440, 900], ["es", 390, 844]];
const browser = await chromium.launch({ executablePath: exe });
for (const [lang, w, h] of runs) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errors = [];
  p.on("console", (m) => (m.type() === "error" || m.type() === "warning") && !m.text().includes("preloaded using link preload") && errors.push(`${m.type()}: ${m.text().slice(0, 200)}`));
  p.on("pageerror", (e) => errors.push(`pageerror: ${String(e).slice(0, 200)}`));
  await p.goto(`${base}/${lang}`, { waitUntil: "load", timeout: 180000 });
  await p.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  await p.waitForTimeout(2500);
  // recorrido para que carguen imagenes y se armen las escenas
  await p.evaluate(async () => {
    const H = document.documentElement.scrollHeight;
    for (let y = 0; y < H; y += innerHeight * 0.6) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    scrollTo(0, 0);
  });
  await p.waitForTimeout(1500);
  const data = await p.evaluate(() => {
    const vh = innerHeight;
    const secs = [...document.querySelectorAll("main > section, body > section, section[data-scene], section[id]")].filter((s, i, a) => a.indexOf(s) === i);
    const rgba = (c) => { const m = c.match(/[\d.]+/g) || []; return { r: +m[0], g: +m[1], b: +m[2], a: m[3] === undefined ? 1 : +m[3] }; };
    const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (rgba(c).a > 0.5) return c; } return "rgb(255,255,255)"; };
    const skip = (e) => e.closest("form, header, footer, dialog, [aria-hidden=true], noscript") || /^(INPUT|TEXTAREA|SELECT|BUTTON|IMG|VIDEO|IFRAME|SVG|PATH|SUMMARY|SCRIPT|STYLE|A)$/i.test(e.tagName) && !(e.tagName === "A" && false);
    const out = secs.map((s) => {
      let boxes = 0, radius = 0; const names = [];
      for (const e of s.querySelectorAll("*")) {
        if (skip(e) || e.closest("details > summary")) continue;
        const cs = getComputedStyle(e);
        const sides = ["Top", "Right", "Bottom", "Left"].filter((k) => parseFloat(cs[`border${k}Width`]) > 0 && cs[`border${k}Style`] !== "none").length;
        const fill = rgba(cs.backgroundColor).a > 0.05 && cs.backgroundColor !== bgOf(e.parentElement) && !(e.className?.toString?.().includes("inset-0"));
        const hasShadow = cs.boxShadow !== "none";
        const isFig = e.tagName === "FIGURE" || e.tagName === "LI" && false;
        const bleed = e.getBoundingClientRect().width >= innerWidth * 0.98 || e.querySelector(":scope > img, :scope > iframe");
        if (!bleed && (sides >= 2 || hasShadow || fill) && !isFig && e.getBoundingClientRect().width > 40 && e.getBoundingClientRect().height > 20) { boxes++; names.push(`${e.tagName.toLowerCase()}.${String(e.className).split(" ").slice(0, 2).join(".")}`); }
        const r = parseFloat(cs.borderTopLeftRadius);
        if (r > 2 && !/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/i.test(e.tagName) && !e.closest("button, .btn")) radius++;
      }
      return { id: s.id || s.dataset.scene || "?", screens: +(s.offsetHeight / vh).toFixed(2), boxes, radius, names: names.slice(0, 4) };
    });
    return { secs: out, total: +(document.documentElement.scrollHeight / vh).toFixed(2), hscroll: document.documentElement.scrollWidth > innerWidth, dashes: /[–—]/.test(document.body.innerText) };
  });
  console.log(`\n== ${lang} ${w}x${h} total=${data.total} hscroll=${data.hscroll} dashes=${data.dashes} errors=${JSON.stringify(errors)}`);
  for (const s of data.secs) console.log(`${s.id.padEnd(14)} ${String(s.screens).padStart(5)} boxes=${s.boxes} radius=${s.radius} ${s.names.join(" | ")}`);
  await ctx.close();
}
await browser.close();
