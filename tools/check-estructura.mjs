// Verificacion de la reestructura ZAMA por DOM y consola (sin capturas).
// Uso: node tools/check-estructura.mjs [base=http://localhost:3100]
// Ignora el aviso de desarrollo "preloaded using link preload" (CSS precargado, propio de next dev).
import { chromium } from "playwright-core";
import { exe } from "./exe.mjs";

const base = process.argv[2] ?? "http://localhost:3100";
const runs = [
  ["es", 1440, 900],
  ["en", 1440, 900],
  ["es", 375, 812],
  ["en", 375, 812],
  ["es", 1366, 768],
];

const browser = await chromium.launch({ executablePath: exe });
const problems = [];

for (const [lang, w, h] of runs) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errors = [];
  const keep = (type, text) => (type === "error" || type === "warning") && !text.includes("preloaded using link preload");
  p.on("console", (m) => keep(m.type(), m.text()) && errors.push(`${m.type()}: ${m.text().slice(0, 220)}`));
  p.on("pageerror", (e) => errors.push(`pageerror: ${String(e).slice(0, 220)}`));
  await p.goto(`${base}/${lang}`, { waitUntil: "load", timeout: 180000 });
  await p.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  await p.waitForTimeout(1500);
  // Arma las escenas: la primera interaccion de scroll carga GSAP.
  await p.mouse.wheel(0, 40);
  await p.waitForTimeout(3500);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(500);

  const m = await p.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const rect = (e) => e.getBoundingClientRect();
    const vh = innerHeight;
    const r = {};
    r.screens = +(document.documentElement.scrollHeight / vh).toFixed(2);
    r.hscroll = document.documentElement.scrollWidth > innerWidth + 1;
    const h1 = q("h1");
    const lh = parseFloat(getComputedStyle(h1).lineHeight);
    r.h1 = { lines: Math.round(rect(h1).height / lh), font: Math.round(parseFloat(getComputedStyle(h1).fontSize)) };
    r.h1Clipped = [...document.querySelectorAll(".hero-line-in")].some((e) => e.scrollWidth > e.clientWidth + 1);
    const textRight = Math.max(...[...document.querySelectorAll(".hero-sent")].flatMap((s) => [...s.getClientRects()].map((x) => x.right)));
    r.h1RightVsCardLeft = [Math.round(textRight), Math.round(rect(q(".hero-card")).left)];
    r.heroScreens = +(q("[data-scene=hero]").offsetHeight / vh).toFixed(2);
    r.cardInHero = rect(q(".hero-card")).bottom <= rect(q("[data-scene=hero]")).bottom + 1;
    const nav = q("header nav");
    const navOn = nav && getComputedStyle(nav).display !== "none";
    if (navOn) {
      r.navLines = new Set([...nav.querySelectorAll("a")].map((a) => Math.round(rect(a).top))).size;
      const hw = q("header .wrap");
      r.headerOverflow = hw.scrollWidth > hw.clientWidth + 1;
    }
    r.menu = [...document.querySelectorAll(navOn ? "header nav a" : "dialog nav a")].map((a) => a.textContent.trim()).filter(Boolean).join("|");
    r.sections = [...document.querySelectorAll("section[id]")].map((s) => `${s.id}:${(s.offsetHeight / vh).toFixed(2)}`).join(" ");
    r.eyebrows = [...document.querySelectorAll(".t-label")].filter((e) => !e.closest("footer")).length;
    r.dashes = /[–—]/.test(document.body.innerText);
    r.conceptTrack = +(q(".concept-track").offsetHeight / vh).toFixed(2);
    r.conceptStackDisplay = getComputedStyle(q(".concept-stack")).display;
    r.invTrack = +(q(".inv-track").offsetHeight / vh).toFixed(2);
    r.locSticky = [...document.querySelectorAll("[data-scene=location], [data-scene=location] *")].some((e) => getComputedStyle(e).position === "sticky");
    r.lots = { card: Math.round(rect(q("#lotes article")).height), frame: Math.round(rect(q(".lots-frame")).height) };
    r.loc = { map: [Math.round(rect(q(".location-map")).width), Math.round(rect(q(".location-map")).height)], text: Math.round(rect(q("#ubicacion ul").parentElement).height) };
    r.invCards = [...document.querySelectorAll("#inversion article")].map((a) => Math.round(rect(a).height));
    return r;
  });

  const wide = w >= 1024;
  const steps = [];
  if (wide) {
    // M1: fases del concepto y ajuste al alto de la ventana.
    for (const f of [0.04, 0.45, 0.92]) {
      await p.evaluate((fr) => {
        const t = document.querySelector(".concept-track");
        const top = t.getBoundingClientRect().top + scrollY;
        window.scrollTo(0, top + (t.offsetHeight - innerHeight) * fr);
      }, f);
      await p.waitForTimeout(1000);
      steps.push(
        await p.evaluate(() => {
          const rc = (s) => document.querySelector(s).getBoundingClientRect();
          const vis = [...document.querySelectorAll(".concept-phase")].filter((e) => getComputedStyle(e).visibility === "visible");
          return {
            m1step: document.querySelector(".concept-stage").dataset.step,
            m1visible: vis.map((e) => e.querySelector("h2,h3").textContent).join(","),
            m1fit: { barBottom: Math.round(rc(".concept-bar").bottom), winTop: Math.round(rc(".concept-window").top), winBottom: Math.round(rc(".concept-window").bottom), vh: innerHeight },
          };
        }),
      );
    }
    // M3: rombo y ajuste al alto de la ventana.
    const inv = [];
    for (const f of [0.0, 0.5, 1.0]) {
      await p.evaluate((fr) => {
        const t = document.querySelector(".inv-track");
        const top = t.getBoundingClientRect().top + scrollY;
        window.scrollTo(0, top + (t.offsetHeight - innerHeight) * fr);
      }, f);
      await p.waitForTimeout(1000);
      inv.push(await p.evaluate(() => document.querySelector(".inv-img").style.clipPath.slice(0, 40)));
    }
    steps.push({
      m3clip: inv,
      m3fit: await p.evaluate(() => ({
        textBottom: Math.round(document.querySelector("#inversion h2").closest("div").getBoundingClientRect().bottom),
        photoBottom: Math.round(document.querySelector(".investment-photo").getBoundingClientRect().bottom),
        vh: innerHeight,
      })),
    });
  }
  // M2: render revelado con la losa.
  await p.evaluate(() => document.querySelector(".lots-frame").scrollIntoView({ block: "center", behavior: "instant" }));
  await p.waitForTimeout(2600);
  steps.push(await p.evaluate(() => ({ m2clipAfter: document.querySelector(".lots-frame").style.clipPath || "(limpio)" })));
  // M4: zoom una sola vez + cascada.
  await p.evaluate(() => document.querySelector(".location-map").scrollIntoView({ block: "center", behavior: "instant" }));
  await p.waitForTimeout(3200);
  steps.push(
    await p.evaluate(() => ({
      m4: {
        live: document.querySelector("[data-scene=location]").classList.contains("scene-live"),
        regionalOpacity: +getComputedStyle(document.querySelector(".location-regional")).opacity,
        spots: [...document.querySelectorAll("[data-hotspot]")].map((e) => +getComputedStyle(e).opacity).join(","),
        rows: [...document.querySelectorAll("[data-time-row]")].map((e) => +getComputedStyle(e).opacity).join(","),
      },
    })),
  );

  console.log(JSON.stringify({ run: `${lang}-${w}x${h}`, ...m, steps, errors }));
  if (errors.length) problems.push(`${lang}-${w}: ${errors.length} mensajes de consola`);
  await ctx.close();
}
await browser.close();
console.log(problems.length ? `PROBLEMAS: ${problems.join(" | ")}` : "CONSOLA LIMPIA en todas las corridas");
