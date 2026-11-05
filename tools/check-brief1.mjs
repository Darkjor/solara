// Verificacion del brief 1 (Google Maps, menu de 5, ubicacion sin cajas) por DOM, red y consola, sin capturas.
// Uso: `npx next dev -p 3301` y `node tools/check-brief1.mjs [base=http://localhost:3301]`.
import { chromium } from "playwright-core";
import { exe } from "./exe.mjs";

const base = process.argv[2] ?? "http://localhost:3301";
const runs = [["es", 1440, 900], ["en", 1440, 900], ["es", 390, 844], ["en", 390, 844], ["es", 360, 740]];
const browser = await chromium.launch({ executablePath: exe });
const isMaps = (u) => /maps\.google|google\.com\/maps/.test(u);
for (const [lang, w, h] of runs) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errors = [], reqs = [];
  p.on("console", (m) => (m.type() === "error" || m.type() === "warning") && !m.text().includes("preloaded using link preload") && errors.push(`${m.type()}: ${m.text().slice(0, 200)}`));
  p.on("pageerror", (e) => errors.push(`pageerror: ${String(e).slice(0, 200)}`));
  p.on("request", (r) => reqs.push(r.url()));
  await p.goto(`${base}/${lang}`, { waitUntil: "load", timeout: 180000 });
  await p.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  await p.waitForTimeout(3000);
  const top = await p.evaluate(() => ({
    nav: [...document.querySelectorAll("header nav a")].map((a) => a.textContent.trim()),
    footerLinks: document.querySelectorAll("footer nav a").length,
    hscroll: document.documentElement.scrollWidth > innerWidth,
    dashes: /[–—]/.test(document.body.innerText),
    headerShadow: getComputedStyle(document.querySelector("header")).boxShadow,
  }));
  const before = reqs.filter(isMaps).length;
  await p.evaluate(() => document.querySelector("#ubicacion").scrollIntoView({ block: "start", behavior: "instant" }));
  await p.waitForTimeout(6000);
  const map = await p.evaluate(() => {
    const f = [...document.querySelectorAll("#ubicacion iframe")];
    const sec = document.querySelector("#ubicacion");
    return {
      iframes: f.map((x) => `${x.title} ${Math.round(x.getBoundingClientRect().width)}x${Math.round(x.getBoundingClientRect().height)} op=${getComputedStyle(x).opacity} ${new URL(x.src).searchParams.get("t")}`),
      srcOk: f.every((x) => x.src.includes("q=18.7686875,-87.6901875")),
      attrs: f.every((x) => x.loading === "lazy" && x.referrerPolicy === "no-referrer-when-downgrade" && x.hasAttribute("allowfullscreen")),
      activate: sec.querySelectorAll("button[aria-label]").length,
      link: [...sec.querySelectorAll("a")].map((a) => `${a.href} ${a.target} ${a.rel}`),
      sectionScreens: +(sec.offsetHeight / innerHeight).toFixed(2),
      shadows: [...sec.querySelectorAll("*")].filter((e) => getComputedStyle(e).boxShadow !== "none").length,
      scrollW: document.documentElement.scrollWidth,
    };
  });
  let tab = null;
  if (w < 1024) {
    await p.click("#mapa-tab-k");
    await p.waitForTimeout(3500);
    tab = await p.evaluate(() => [...document.querySelectorAll("#ubicacion iframe")].map((f) => f.title));
  }
  const total = await p.evaluate(() => +(document.documentElement.scrollHeight / innerHeight).toFixed(2));
  console.log(JSON.stringify({ run: `${lang}-${w}x${h}`, errors, mapsBefore: before, top, map, tab, total }));
  await ctx.close();
}
await browser.close();
