// Capturas de la fase 2: cuadros a mitad de cada animación. Uso: node tools/shots-fase2.mjs <outDir> <base> <w> <h> [lang]
import { chromium } from "playwright-core";
import fs from "fs";
import { exe } from "./exe.mjs";

const [out = ".materiales/capturas/fase2", base = "http://localhost:3100", W = "1440", H = "900", lang = "es"] = process.argv.slice(2);
const w = +W, h = +H, wide = w >= 1024;
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: exe });
const ctx = await b.newContext({ viewport: { width: w, height: h } });
const p = await ctx.newPage();
const errors = [];
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
p.on("pageerror", (e) => errors.push(String(e)));
const pre = `${out}/${lang}-${w}`;
await p.goto(`${base}/${lang}`, { waitUntil: "commit" });
// Hero: intro por fases
for (const t of [150, 450, 900]) {
  await p.waitForTimeout(t === 150 ? 150 : t === 450 ? 300 : 450);
  await p.screenshot({ path: `${pre}-hero-intro-${t}.png` });
}
await p.waitForLoadState("networkidle");
await p.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
await p.waitForTimeout(3500);
await p.screenshot({ path: `${pre}-hero-final.png` });
// util: scroll a fraccion de una escena alta
async function frame(sel, frac, name, extra = 0, wait = 1100) {
  await p.evaluate(([s, f, e]) => {
    const el = document.querySelector(s);
    const r = el.getBoundingClientRect();
    const top = r.top + window.scrollY;
    const span = Math.max(0, r.height - window.innerHeight);
    window.scrollTo(0, top + span * f + e);
  }, [sel, frac, extra]);
  await p.waitForTimeout(wait);
  await p.screenshot({ path: `${pre}-${name}.png` });
}
// recorre para disparar revelados y cargar imagenes
const total = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < total; y += h * 0.7) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(150); }
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(800);
if (wide) {
  for (const f of [0.02, 0.2, 0.34, 0.5, 0.85]) await frame(".concept-track", f, `m1-${Math.round(f * 100)}`);
  await frame("[data-calc]", 0, "m2-calc", -h * 0.45, 900);
  await frame("[data-calc]", 0, "m2-calc-b", -h * 0.15, 900);
  for (const f of [0, 0.25, 0.5, 0.75, 1]) await frame(".inv-track", f, `m3-${Math.round(f * 100)}`);
  for (const f of [0.1, 0.3, 0.45, 0.65, 0.85, 1]) await frame(".location-track", f, `m4-${Math.round(f * 100)}`);
} else {
  await frame(".concept-stack", 0, "concept-stack", 0, 600);
  await frame(".inv-track", 0, "m3-a", -h * 0.35, 900);
  await frame(".inv-track", 0, "m3-b", h * 0.05, 900);
  await frame("[data-scene=location]", 0, "m4-a", h * 0.5, 600);
  await frame("[data-scene=location]", 0, "m4-b", h * 0.5, 2500);
}
// M5
await p.evaluate(() => window.scrollTo(0, 0));
await p.evaluate(() => { const el = document.querySelector("[data-plan-viewer]"); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.55); });
await p.waitForTimeout(700);
await p.screenshot({ path: `${pre}-m5-mid.png` });
await p.waitForTimeout(1800);
await p.screenshot({ path: `${pre}-m5-final.png` });
for (const [sel, name] of [["#ventajas", "ventajas"], ["#aliados", "brokers"], ["[data-scene=final]", "final"], ["#inversion .investment-stats", "inv-stats"]]) {
  await p.evaluate((s) => document.querySelector(s).scrollIntoView({ block: "center" }), sel);
  await p.waitForTimeout(1300);
  await p.screenshot({ path: `${pre}-${name}.png` });
}
const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const culprits = overflow > 0 ? await p.evaluate(() => [...document.querySelectorAll("body *")].filter((e) => e.getBoundingClientRect().right > window.innerWidth + 0.5).slice(0, 6).map((e) => e.tagName + "." + String(e.className).slice(0, 60))) : [];
console.log(JSON.stringify({ overflow, culprits, errors: errors.filter((e) => !e.includes("hydrated")).map((e) => e.slice(0, 160)) }));
await b.close();
