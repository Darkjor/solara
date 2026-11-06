// Verificacion del scrollytelling (hero en tres tiempos, ubicacion, galeria, cierre) por DOM y consola.
// Uso: `npx next start -p 3301` y `node tools/check-scrolly.mjs [base=http://localhost:3301] [--shot]`.
// Hace scroll programatico por pasos y mide capas, transforms y opacidad; no depende de capturas.
import { chromium } from "playwright-core";
import { exe } from "./exe.mjs";

const base = process.argv[2]?.startsWith("http") ? process.argv[2] : "http://localhost:3301";
const shot = process.argv.includes("--shot");
// [ruta, ancho, alto, movimiento]
const runs = [
  ["/", 1440, 900, "no-preference"],
  ["/en", 1440, 900, "no-preference"],
  ["/", 390, 844, "no-preference"],
  ["/en", 390, 844, "no-preference"],
  ["/", 360, 740, "no-preference"],
  ["/", 1440, 900, "reduce"],
  ["/", 390, 844, "reduce"],
];
const browser = await chromium.launch({ executablePath: exe });
const fails = [];
const out = [];
const ok = (c, m) => c || fails.push(m);
const at = async (p, y, wait = 1300) => {
  await p.evaluate((v) => window.scrollTo({ top: v, behavior: "instant" }), y);
  await p.waitForTimeout(wait);
};

for (const [path, w, h, motion] of runs) {
  const tag = `${path} ${w}x${h} ${motion}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: motion, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("response", (rs) => rs.status() >= 400 && errors.push(`${rs.status()} ${rs.url().slice(0, 120)}`));
  await p.goto(base + path, { waitUntil: "load" });
  await p.waitForTimeout(2500);
  const r = { tag };
  const reduced = motion === "reduce";
  const wide = w >= 1024 && h >= 640;

  r.initial = await p.evaluate(() => ({
    scrolly: document.documentElement.classList.contains("scrolly"),
    spacers: document.querySelectorAll(".pin-spacer").length,
    hscroll: document.documentElement.scrollWidth > innerWidth + 1,
    h1Sentences: document.querySelectorAll("h1 .hero-line").length,
    h1Text: document.querySelector("h1").textContent.trim(),
    formInHero: !!document.querySelector("#inicio form"),
    formInFinal: !!document.querySelector("[data-scene=final] form#cotiza"),
  }));
  ok(r.initial.h1Sentences === 3 && r.initial.h1Text.length > 40, `${tag}: H1 incompleto`);
  ok(!r.initial.formInHero && r.initial.formInFinal, `${tag}: formulario mal ubicado`);
  ok(!r.initial.hscroll, `${tag}: scroll horizontal en carga`);

  const heroState = () =>
    p.evaluate(() => {
      const g = (s) => document.querySelector(s);
      const clip = (n) => getComputedStyle(g(`[data-hero-layer="${n}"]`)).clipPath;
      const lines = [...document.querySelectorAll(".hero-line")].map((l) => +(+getComputedStyle(l).opacity).toFixed(2));
      const st = g("[data-hero-stage]").getBoundingClientRect();
      return {
        y: Math.round(scrollY),
        stageTop: Math.round(st.top),
        stageH: Math.round(st.height),
        c2: clip(2),
        c3: clip(3),
        lines,
        rest: getComputedStyle(g(".hero-rest")).visibility,
        restOp: +(+getComputedStyle(g(".hero-rest")).opacity).toFixed(2),
        note: +(+getComputedStyle(g(".hero-note")).opacity).toFixed(2),
        titleT: getComputedStyle(g(".hero-title")).transform,
        pos: getComputedStyle(g("[data-hero-stage]")).position,
      };
    });

  if (reduced) {
    r.static = await heroState();
    ok(!r.initial.scrolly && r.initial.spacers === 0, `${tag}: reducido arma pin`);
    ok(r.static.lines.every((o) => o === 1) && r.static.rest === "visible" && r.static.note === 1, `${tag}: estado final incompleto ${JSON.stringify(r.static)}`);
    const layers = await p.evaluate(() => [1, 2, 3].map((n) => getComputedStyle(document.querySelector(`[data-hero-layer="${n}"]`)).display));
    ok(layers.join() === "none,none,block", `${tag}: capas en estatico ${layers}`);
    r.locLive = await p.evaluate(() => document.querySelector("[data-scene=location]").classList.contains("loc-live") || document.querySelector("[data-scene=gallery]").classList.contains("gal-live"));
    ok(!r.locLive, `${tag}: escenas vivas con reducido`);
  } else {
    ok(r.initial.scrolly && r.initial.spacers >= 1, `${tag}: pin no armado ${JSON.stringify(r.initial)}`);
    const vh = h;
    const steps = [];
    for (const f of [0, 0.14, 0.3, 0.43, 0.6, 0.72, 0.86, 1]) {
      await at(p, Math.round(f * 2 * vh));
      steps.push({ f, ...(await heroState()) });
    }
    r.hero = steps;
    const s = (f) => steps.find((x) => x.f === f);
    ok(s(0).lines[0] === 1 && s(0).lines[1] === 0 && s(0).rest === "hidden", `${tag}: tiempo 1 ${JSON.stringify(s(0))}`);
    ok(steps.every((x) => x.f >= 1 || (x.stageTop === 0 && x.pos === "fixed") || x.f === 0), `${tag}: el hero no queda fijo`);
    ok(s(0.43).lines[1] > 0.9 && s(0.43).lines[0] < 0.1 && s(0.43).c2.includes("0%"), `${tag}: tiempo 2 ${JSON.stringify(s(0.43))}`);
    ok(s(0.72).lines[2] > 0.9 && s(0.72).c3 !== "inset(100% 0% 0% 0%)", `${tag}: tiempo 3 ${JSON.stringify(s(0.72))}`);
    ok(s(1).lines.every((o) => o === 1) && s(1).rest === "visible" && s(1).restOp === 1, `${tag}: estado final ${JSON.stringify(s(1))}`);
    await at(p, 2 * vh + vh * 0.6);
    const rel = await heroState();
    r.released = { stageTop: rel.stageTop, pos: rel.pos };
    ok(rel.stageTop < 0 && rel.pos !== "fixed", `${tag}: el pin no suelta ${JSON.stringify(rel)}`);

    if (wide) {
      // Ubicacion
      const loc = await p.evaluate(() => {
        const e = document.querySelector("[data-loc-stage]");
        const top = e.getBoundingClientRect().top + scrollY;
        return { top, h: e.offsetHeight, live: e.closest("section").classList.contains("loc-live") };
      });
      ok(loc.live, `${tag}: loc-live ausente`);
      const lm = [];
      for (const f of [-0.2, 0.1, 0.3, 0.5, 0.8, 1.1]) {
        await at(p, Math.round(loc.top + f * 1.5 * h));
        lm.push(
          await p.evaluate((ff) => {
            const op = (s) => +(+getComputedStyle(document.querySelector(s)).opacity).toFixed(2);
            const items = [...document.querySelectorAll("[data-loc-item]")].map((e) => +(+getComputedStyle(e).opacity).toFixed(2));
            const m = new DOMMatrixReadOnly(getComputedStyle(document.querySelector("[data-loc-state]")).transform);
            return { f: ff, scale: +m.a.toFixed(2), local: op("[data-loc-local]"), items, top: Math.round(document.querySelector("[data-loc-stage]").getBoundingClientRect().top) };
          }, f)
        );
      }
      r.loc = lm;
      ok(lm[1].scale > 1 && lm[3].scale > 2 && lm[3].local > 0.5 && lm[5].items.every((o) => o > 0.9), `${tag}: ubicacion ${JSON.stringify(lm)}`);
      // Galeria
      const gal = await p.evaluate(() => {
        const e = document.querySelector("[data-gal-pin]");
        const tr = document.querySelector("[data-gal-track]");
        return { top: e.getBoundingClientRect().top + scrollY, dist: tr.scrollWidth - document.documentElement.clientWidth, live: e.closest("section").classList.contains("gal-live"), h: e.offsetHeight, cells: [...document.querySelectorAll(".gal-cell")].map((c) => Math.round(c.offsetWidth)) };
      });
      ok(gal.live && gal.dist > 500, `${tag}: galeria viva ${JSON.stringify(gal)}`);
      const gm = [];
      for (const f of [0, 0.5, 1]) {
        await at(p, Math.round(gal.top + f * gal.dist), 1800);
        gm.push(await p.evaluate((ff) => ({ f: ff, x: Math.round(new DOMMatrixReadOnly(getComputedStyle(document.querySelector("[data-gal-track]")).transform).e), top: Math.round(document.querySelector("[data-gal-pin]").getBoundingClientRect().top), hs: document.documentElement.scrollWidth > innerWidth + 1 }), f));
      }
      r.gal = { ...gal, steps: gm };
      ok(gm[0].x === 0 && Math.abs(gm[2].x + gal.dist) <= 2 && gm[1].x < -gal.dist * 0.4 && gm.every((x) => x.top === 0 && !x.hs), `${tag}: paneo ${JSON.stringify(gm)}`);
    }
  }

  // Header: "Cotiza tu lote" lleva al formulario del cierre.
  await at(p, 0, 600);
  await p.click("header a[href*='cotiza']");
  await p.waitForTimeout(2500);
  r.cta = await p.evaluate(() => {
    const f = document.querySelector("#cotiza").getBoundingClientRect();
    return { top: Math.round(f.top), bottom: Math.round(f.bottom), vh: innerHeight, hash: location.hash };
  });
  ok(r.cta.hash === "#cotiza" && r.cta.bottom > 0 && r.cta.top < r.cta.vh, `${tag}: el CTA no llega al formulario ${JSON.stringify(r.cta)}`);
  // Final: sin scroll horizontal y formulario legible
  r.end = await p.evaluate(() => ({ hs: document.documentElement.scrollWidth > innerWidth + 1, dashes: /[–—]/.test(document.body.innerText) }));
  ok(!r.end.hs && !r.end.dashes, `${tag}: fin ${JSON.stringify(r.end)}`);
  ok(!errors.length, `${tag}: consola ${errors.slice(0, 3).join(" | ")}`);
  if (shot && tag.includes("1440x900 no-pref") && path === "/") {
    await at(p, 0, 800);
    await at(p, Math.round(2 * h * 0.43), 1500);
    await p.screenshot({ path: process.env.SHOT_DIR + "/t2.jpg", type: "jpeg", quality: 40 });
  }
  out.push(r);
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, process.argv.includes("--full") ? 1 : 0).slice(0, process.argv.includes("--full") ? 20000 : 3500));
console.log(fails.length ? "FALLAS:\n" + fails.join("\n") : "TODO OK");
process.exit(fails.length ? 1 : 0);
