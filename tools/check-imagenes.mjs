// Mide nitidez y recorte de cada <img>. Uso: npx next start -p 3100 y `node tools/check-imagenes.mjs [out.json] [base]`.
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";
import { exe } from "./exe.mjs";

const out = process.argv[2] ?? "imagenes.json";
const base = process.argv[3] ?? "http://localhost:3100";
const vps = [["1440x900", 1440, 900, 1], ["1024x768", 1024, 768, 1], ["390x844", 390, 844, 3], ["360x780", 360, 780, 3]];
const browser = await chromium.launch({ executablePath: exe });
const rows = [];
import sharp from "sharp";
const ORIG = {};
for (const f of (await import("node:fs")).readdirSync("public/img")) { const m = await sharp(`public/img/${f}`).metadata(); ORIG[f] = [m.width, m.height]; }
const issues = [];

const grab = (p, ctx) =>
  p.evaluate(({ ctx, ORIG }) => {
    const dpr = devicePixelRatio;
    return [...document.images].filter((i) => i.currentSrc && i.naturalWidth).map((i) => {
      const r = i.getBoundingClientRect();
      const cs = getComputedStyle(i);
      const vis = r.width > 2 && r.height > 2 && cs.visibility !== "hidden";
      const src = decodeURIComponent((i.currentSrc.match(/url=([^&]+)/) ?? [, i.currentSrc])[1]).split("/").pop();
      const wp = +(i.currentSrc.match(/[?&]w=(d+)/) ?? [])[1] || 0;
      const o = ORIG[src.split("?")[0]] ?? [i.naturalWidth, i.naturalHeight];
      const nw = wp ? Math.min(wp, o[0]) : o[0];
      const nh = Math.round((nw * o[1]) / o[0]);
      const fit = cs.objectFit;
      const w = i.offsetWidth || r.width, h = i.offsetHeight || r.height;
      const bw = Math.max(r.width, w), bh = Math.max(r.height, h);
      let scale, crop = 0;
      if (fit === "cover") {
        scale = Math.max(bw / nw, bh / nh) * dpr;
        const br = bw / bh, nr = nw / nh;
        crop = (1 - (br > nr ? nr / br : br / nr)) * 100;
      } else if (fit === "contain") scale = Math.min(bw / nw, bh / nh) * dpr;
      else scale = (bw / nw) * dpr;
      return { ctx, src: src.split("?")[0], vis, bw: Math.round(bw), bh: Math.round(bh), nw, nh, fit, pos: cs.objectPosition, scale: +scale.toFixed(2), crop: Math.round(crop), cls: (i.className || "").toString().slice(0, 40), alt: !!i.alt };
    });
  }, { ctx, ORIG });

for (const lang of ["es", "en"]) for (const [tag, w, h, dpr] of vps) {
  if (lang === "en" && tag !== "1440x900" && tag !== "390x844") continue;
  const c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  const p = await c.newPage();
  const errs = [];
  p.on("console", (m) => (m.type() === "error" || m.type() === "warning") && !m.text().includes("preload") && errs.push(m.text().slice(0, 200)));
  p.on("pageerror", (e) => errs.push(String(e).slice(0, 200)));
  await p.goto(`${base}/${lang}`, { waitUntil: "load", timeout: 120000 });
  await p.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  await p.waitForTimeout(1500);
  await p.mouse.wheel(0, 40);
  const seen = new Map();
  const keep = (list) => list.forEach((x) => { if (!x.vis) return; const k = x.ctx + "|" + x.src; const o = seen.get(k); if (!o || x.scale > o.scale) seen.set(k, x); });
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += Math.round(h * 0.4)) {
    await p.evaluate((y) => window.scrollTo(0, y), y);
    await p.waitForTimeout(250);
    keep(await grab(p, "pagina"));
  }
  await p.waitForTimeout(1200);
  keep(await grab(p, "pagina"));
  // lightbox galeria
  const cells = p.locator(".gal-open");
  const n = await cells.count();
  if (n) {
    await cells.first().scrollIntoViewIfNeeded();
    await cells.first().click();
    for (let i = 0; i < n; i++) {
      await p.waitForTimeout(700);
      keep(await grab(p, "lightbox").then((l) => l.filter((x) => x.cls.includes("gal-img"))));
      await p.keyboard.press("ArrowRight");
    }
    await p.keyboard.press("Escape");
  }
  // visor del plano
  const pv = p.locator("[data-plan-layer]").first();
  if (await pv.count()) {
    await pv.scrollIntoViewIfNeeded();
    await p.waitForTimeout(1500);
    keep(await grab(p, "plano"));
  }
  const hs = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  for (const x of seen.values()) rows.push({ lang, vp: tag, ...x });
  if (hs) issues.push(`${lang} ${tag}: scroll horizontal`);
  if (errs.length) issues.push(`${lang} ${tag}: consola ${errs.join(" | ")}`);
  await c.close();
}
await browser.close();
writeFileSync(out, JSON.stringify(rows, null, 1));
const bad = rows.filter((r) => r.scale > 1.15 || r.crop > 40);
console.log(`imgs medidas: ${rows.length}; marcadas: ${bad.length}; avisos: ${issues.length}`);
for (const r of bad) console.log(`${r.lang} ${r.vp} [${r.ctx}] ${r.src} box ${r.bw}x${r.bh} nat ${r.nw}x${r.nh} ${r.fit} scale ${r.scale} crop ${r.crop}%`);
issues.forEach((i) => console.log("AVISO", i));
