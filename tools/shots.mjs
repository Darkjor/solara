// Capturas con Playwright (home ES/EN a 1440 y 375). Uso: node tools/shots.mjs [outDir] [base]
import { chromium } from "playwright-core";
import sharp from "sharp";
import fs from "fs";
import { exe } from "./exe.mjs";

const out = process.argv[2] ?? ".materiales/capturas/fase1";
const base = process.argv[3] ?? "http://localhost:3100";
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: exe });
const jobs = [
  ["es", 1440, 900, "/es"],
  ["en", 1440, 900, "/en"],
  ["es", 375, 812, "/es"],
  ["en", 375, 812, "/en"],
];
for (const [lang, w, h, path] of jobs) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
  const p = await ctx.newPage();
  const errors = [];
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(base + path, { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}/${lang}-${w}-hero.png` });
  // recorre la pagina para disparar los revelados
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += h * 0.6) {
    await p.evaluate((yy) => window.scrollTo(0, yy), y);
    await p.waitForTimeout(120);
  }
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(600);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await p.addStyleTag({ content: "[aria-label=\"Acciones rápidas\"],[aria-label=\"Quick actions\"]{display:none!important}" });
  const full = await p.screenshot({ fullPage: true });
  fs.writeFileSync(`${out}/${lang}-${w}-full.png`, full);
  const meta = await sharp(full).metadata();
  // composites para revision: tiras de la pagina
  const chunk = w > 600 ? 1800 : 1900;
  const scale = w > 600 ? 0.5 : 0.5;
  const n = Math.ceil(meta.height / chunk);
  const per = w > 600 ? 3 : 6;
  const tiles = [];
  for (let i = 0; i < n; i++) {
    const hh = Math.min(chunk, meta.height - i * chunk);
    tiles.push(await sharp(full).extract({ left: 0, top: i * chunk, width: w, height: hh }).resize({ width: Math.round(w * scale) }).png().toBuffer());
  }
  const tw = Math.round(w * scale);
  const th = Math.ceil((chunk * tw) / w) + 2;
  for (let g = 0; g * per < n; g++) {
    const slice = tiles.slice(g * per, g * per + per);
    await sharp({ create: { width: tw * slice.length + 8 * (slice.length - 1), height: th, channels: 3, background: "#ff00ff" } })
      .composite(slice.map((t, i) => ({ input: t, left: i * (tw + 8), top: 0 })))
      .png()
      .toFile(`${out}/${lang}-${w}-sheet${g + 1}.png`);
  }
  console.log(lang, w, "height", meta.height, "overflowX", overflow, "errors", JSON.stringify(errors.slice(0, 5)));
  await ctx.close();
}
await b.close();
