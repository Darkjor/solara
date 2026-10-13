// Verificacion de la estructura ZAMA (partes 1 y 2) por DOM y consola, sin capturas.
// Uso: correr `npx next dev -p 3100` y luego `node tools/check-estructura.mjs [base=http://localhost:3100]`.
// Ignora el aviso de desarrollo "preloaded using link preload" (CSS precargado, propio de next dev).
import { chromium } from "playwright-core";
import { exe } from "./exe.mjs";

const base = process.argv[2] ?? "http://localhost:3100";
// [idioma, ancho, alto, movimiento]
const runs = [
  ["es", 1440, 900, "no-preference"],
  ["en", 1440, 900, "no-preference"],
  ["es", 375, 812, "no-preference"],
  ["en", 375, 812, "no-preference"],
  ["es", 1366, 768, "no-preference"],
  ["es", 1440, 900, "reduce"],
  ["es", 375, 812, "reduce"],
];

const browser = await chromium.launch({ executablePath: exe });
const fails = [];

for (const [lang, w, h, motion] of runs) {
  const tag = `${lang}-${w}x${h}${motion === "reduce" ? "-reducido" : ""}`;
  const ok = (cond, msg) => cond || fails.push(`${tag}: ${msg}`);
  const wide = w >= 1024;
  const reduced = motion === "reduce";
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: motion });
  const p = await ctx.newPage();
  const errors = [];
  const keep = (type, text) => (type === "error" || type === "warning") && !text.includes("preloaded using link preload");
  p.on("console", (m) => keep(m.type(), m.text()) && errors.push(`${m.type()}: ${m.text().slice(0, 220)}`));
  p.on("pageerror", (e) => errors.push(`pageerror: ${String(e).slice(0, 220)}`));
  await p.goto(`${base}/${lang}`, { waitUntil: "load", timeout: 180000 });
  await p.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  await p.waitForTimeout(1500);
  await p.mouse.wheel(0, 40); // la primera interaccion arma GSAP
  await p.waitForTimeout(3500);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(400);

  const m = await p.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const vh = innerHeight;
    const r = {};
    r.screens = +(document.documentElement.scrollHeight / vh).toFixed(2);
    r.hscroll = document.documentElement.scrollWidth > innerWidth + 1;
    r.sections = [...document.querySelectorAll("section[id]")].map((s) => `${s.id}:${(s.offsetHeight / vh).toFixed(2)}`).join(" ");
    r.vivirH = +(q("#vivir").offsetHeight / vh).toFixed(2);
    r.galH = +(q("#galeria").offsetHeight / vh).toFixed(2);
    r.eyebrows = [...document.querySelectorAll(".t-label")].filter((e) => !e.closest("footer")).length;
    r.dashes = /[–—]/.test(document.body.innerText);
    r.vivirCards = document.querySelectorAll(".vivir-card").length;
    r.galCells = document.querySelectorAll(".gal-cell").length;
    r.invLive = q("#inversion").classList.contains("scene-live");
    r.invTrack = +(q(".inv-track").offsetHeight / vh).toFixed(2);
    r.invSticky = [...document.querySelectorAll("#inversion, #inversion *")].filter((e) => getComputedStyle(e).position === "sticky").length;
    r.conceptTrackDisplay = getComputedStyle(q(".concept-track")).display;
    r.conceptLive = q("[data-scene=concept]").classList.contains("scene-live");
    r.locSticky = [...document.querySelectorAll("[data-scene=location], [data-scene=location] *")].filter((e) => getComputedStyle(e).position === "sticky").length;
    r.quintanaImg = !!q('img[src*="quintana"]') || !!q('img[srcset*="quintana"]') || !!q(".location-regional");
    // FAQ visible contra JSON-LD
    const details = [...document.querySelectorAll("#faq details")];
    r.faqCount = details.length;
    const ld = JSON.parse(q('#faq script[type="application/ld+json"]').textContent);
    r.ldCount = ld.mainEntity.length;
    r.faqMatch = ld.mainEntity.every((e, i) => details[i] && details[i].querySelector("summary span").textContent.trim() === e.name && details[i].querySelector("p").textContent.trim() === e.acceptedAnswer.text);
    return r;
  });
  ok(!errors.length, `consola: ${errors.slice(0, 3).join(" | ")}`);
  ok(!m.hscroll, "scroll horizontal");
  ok(!m.dashes, "rayas largas en el texto visible");
  ok(m.eyebrows <= 3, `eyebrows ${m.eyebrows}`);
  ok(m.vivirCards === 4 && m.galCells === 6, `tarjetas ${m.vivirCards} / celdas ${m.galCells}`);
  ok(m.faqCount === 6 && m.ldCount === 6 && m.faqMatch, `FAQ ${m.faqCount} visibles, ${m.ldCount} en JSON-LD, coinciden=${m.faqMatch}`);
  ok(!m.quintanaImg, "el mapa regional sigue en la pagina");
  ok(m.locSticky === 0, "Destino tiene elementos fijos");
  if (w === 1440 && h === 900) {
    ok(m.vivirH <= 0.9, `Vivir ${m.vivirH} pantallas (> 0.9)`);
    ok(m.galH <= 0.9, `Galeria ${m.galH} pantallas (> 0.9)`);
  }
  if (reduced) {
    ok(!m.invLive && m.invSticky === 0, `M3 reducido: scene-live=${m.invLive}, sticky=${m.invSticky}`);
    ok(m.invTrack < 1.3, `M3 reducido reserva ${m.invTrack} pantallas`);
    ok(m.conceptTrackDisplay === "none" && !m.conceptLive, "M1 reducido no es estatico");
  } else if (wide) {
    ok(m.invLive && Math.abs(m.invTrack - 1.6) < 0.03, `M3 con movimiento: scene-live=${m.invLive}, pista ${m.invTrack}`);
    ok(m.conceptLive, "M1 no se armo");
  } else {
    ok(!m.invLive && m.invSticky === 0, "M3 movil no debe estar fijo");
  }

  const steps = {};

  // ---- Vivir: entrada con la losa, flechas y arrastre ----
  await p.evaluate(() => document.querySelector("#vivir").scrollIntoView({ block: "center", behavior: "instant" }));
  await p.waitForTimeout(2200);
  steps.vivir = await p.evaluate(() => {
    const row = document.querySelector("#vivir-row");
    const fig = [...document.querySelectorAll(".vivir-photo")];
    const btns = [...document.querySelectorAll(".vivir-btn")];
    return {
      clip: fig.map((f) => (getComputedStyle(f).clipPath === "none" ? "none" : getComputedStyle(f).clipPath.includes("100% 100%") ? "abierto" : "recortado")).join(","),
      scrollable: row.scrollWidth > row.clientWidth + 2,
      snap: getComputedStyle(row).scrollSnapType,
      btnVisible: btns.map((b) => getComputedStyle(b).display !== "none" && b.offsetWidth > 0).join(","),
      btnLabels: btns.map((b) => b.getAttribute("aria-label")).join("|"),
      disabled: btns.map((b) => b.getAttribute("aria-disabled")).join(","),
      firstLeft: Math.round(fig[0].getBoundingClientRect().left),
      startPad: Math.round(parseFloat(getComputedStyle(row).paddingLeft)),
    };
  });
  ok(steps.vivir.scrollable, "la fila de Vivir no se desplaza");
  ok(steps.vivir.snap.includes("x"), `scroll-snap de Vivir: ${steps.vivir.snap}`);
  ok(steps.vivir.btnVisible === "true,true", "flechas de Vivir no visibles");
  ok(steps.vivir.disabled === "true,false", `estado inicial de flechas ${steps.vivir.disabled}`);
  const allOpen = steps.vivir.clip.split(",").every((c) => c === (reduced ? "none" : "abierto") || c === "none");
  ok(allOpen || w < 768, `recorte de la losa en Vivir: ${steps.vivir.clip}`);
  if (reduced) ok(steps.vivir.clip.split(",").every((c) => c === "none"), "Vivir reducido aun recorta");
  const sl0 = await p.evaluate(() => document.querySelector("#vivir-row").scrollLeft);
  await p.click('.vivir-btn[aria-label="' + (lang === "es" ? "Siguiente" : "Next") + '"]');
  await p.waitForTimeout(900);
  const sl1 = await p.evaluate(() => document.querySelector("#vivir-row").scrollLeft);
  ok(sl1 > sl0 + 100, `flecha siguiente no avanza (${sl0} a ${sl1})`);
  const box = await p.locator("#vivir-row").boundingBox();
  const cy = box.y + 120;
  await p.mouse.move(box.x + box.width * 0.6, cy);
  await p.mouse.down();
  await p.mouse.move(box.x + box.width * 0.6 + 120, cy, { steps: 6 });
  const dragging = await p.evaluate(() => document.querySelector("#vivir-row").hasAttribute("data-dragging"));
  const slMid = await p.evaluate(() => document.querySelector("#vivir-row").scrollLeft);
  await p.mouse.up();
  await p.waitForTimeout(700);
  const sl2 = await p.evaluate(() => document.querySelector("#vivir-row").scrollLeft);
  ok(dragging, "el arrastre no activa data-dragging");
  ok(slMid !== sl1, `el arrastre no desplaza (${sl1} a ${slMid})`);
  steps.vivir.scroll = [Math.round(sl0), Math.round(sl1), Math.round(sl2)];

  // ---- Galeria: celdas exactas y visor ----
  await p.evaluate(() => document.querySelector("#galeria").scrollIntoView({ block: "center", behavior: "instant" }));
  await p.waitForTimeout(1500);
  steps.gal = await p.evaluate(() => {
    const grid = document.querySelector(".gal-grid");
    const g = grid.getBoundingClientRect();
    const cells = [...document.querySelectorAll(".gal-cell")].map((c) => {
      const b = c.getBoundingClientRect();
      const im = c.querySelector("img");
      return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height, ar: b.width / b.height, nat: im ? im.naturalWidth / im.naturalHeight : 0 };
    });
    return { grid: { l: g.left, t: g.top, r: g.right, b: g.bottom }, cells, display: getComputedStyle(grid).display, scrollW: grid.scrollWidth, clientW: grid.clientWidth, snap: getComputedStyle(grid).scrollSnapType };
  });
  if (w >= 768) {
    const rows = {};
    for (const c of steps.gal.cells) (rows[Math.round(c.t)] ??= []).push(c);
    const rs = Object.values(rows).map((r) => r.sort((a, b) => a.l - b.l));
    ok(rs.length === 2, `el mosaico tiene ${rs.length} filas`);
    const g = steps.gal.grid;
    rs.forEach((r, i) => {
      ok(Math.abs(r[0].l - g.l) < 1.5 && Math.abs(r[r.length - 1].r - g.r) < 1.5, `fila ${i + 1} no llena el ancho`);
      for (let k = 1; k < r.length; k++) ok(Math.abs(r[k].l - r[k - 1].r - 12) < 1.5, `hueco horizontal ${(r[k].l - r[k - 1].r).toFixed(1)} en fila ${i + 1}`);
      ok(r.every((c) => Math.abs(c.h - r[0].h) < 1.5), `alturas distintas en fila ${i + 1}`);
    });
    if (rs.length === 2) {
      ok(Math.abs(rs[1][0].t - rs[0][0].b - 12) < 1.5, "hueco vertical entre filas");
      ok(Math.abs(rs[1][0].b - g.b) < 1.5, "la ultima fila no llega al borde del mosaico");
    }
    steps.gal.maxCropPct = Math.round(Math.max(...steps.gal.cells.map((c) => (c.nat ? Math.abs(c.ar / c.nat - 1) : 0))) * 100);
    ok(steps.gal.maxCropPct <= 12, `recorte maximo ${steps.gal.maxCropPct}%`);
  } else {
    ok(steps.gal.scrollW > steps.gal.clientW + 2 && steps.gal.snap.includes("x"), "la galeria movil no es una tira con snap");
  }
  delete steps.gal.cells;

  // Visor: foco, flechas, tab atrapado, Esc y foco devuelto.
  const trig = '.gal-cell:first-child .gal-open';
  await p.click(trig);
  await p.waitForTimeout(700);
  const inDlg = () => p.evaluate(() => !!document.activeElement?.closest("dialog.gal-viewer"));
  steps.viewer = { open: await p.evaluate(() => !!document.querySelector("dialog.gal-viewer[open]")), focusIn: await inDlg(), c1: await p.evaluate(() => document.querySelector(".gal-top p").textContent.trim()) };
  ok(steps.viewer.open && steps.viewer.focusIn, "el visor no abre con el foco dentro");
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(300);
  steps.viewer.c2 = await p.evaluate(() => document.querySelector(".gal-top p").textContent.trim());
  await p.keyboard.press("ArrowLeft");
  await p.waitForTimeout(300);
  steps.viewer.c3 = await p.evaluate(() => document.querySelector(".gal-top p").textContent.trim());
  ok(steps.viewer.c2 !== steps.viewer.c1 && steps.viewer.c3 === steps.viewer.c1, `flechas del visor: ${steps.viewer.c1} / ${steps.viewer.c2} / ${steps.viewer.c3}`);
  let trapped = true;
  for (let i = 0; i < 8; i++) {
    await p.keyboard.press("Tab");
    trapped = trapped && (await inDlg());
  }
  ok(trapped, "el foco se sale del visor con Tab");
  // Deslizar con el dedo (evento de puntero tactil sintetico).
  await p.evaluate(() => {
    const s = document.querySelector(".gal-stage");
    const ev = (type, x) => s.dispatchEvent(new PointerEvent(type, { pointerType: "touch", clientX: x, bubbles: true }));
    ev("pointerdown", 300);
    ev("pointerup", 100);
  });
  await p.waitForTimeout(300);
  steps.viewer.swipe = await p.evaluate(() => document.querySelector(".gal-top p").textContent.trim());
  ok(steps.viewer.swipe !== steps.viewer.c1, "el deslizamiento tactil no cambia de imagen");
  steps.viewer.imgAlt = await p.evaluate(() => document.querySelector(".gal-img")?.getAttribute("alt")?.slice(0, 50));
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);
  steps.viewer.closed = await p.evaluate(() => !document.querySelector("dialog.gal-viewer[open]"));
  steps.viewer.focusBack = await p.evaluate((s) => document.activeElement === document.querySelector(s), trig);
  ok(steps.viewer.closed && steps.viewer.focusBack, `Esc cierra=${steps.viewer.closed}, foco devuelto=${steps.viewer.focusBack}`);

  // ---- M4: acercamiento 1.35 a 1 una sola vez + cascada ----
  await p.evaluate(() => document.querySelector(".location-map").scrollIntoView({ block: "center", behavior: "instant" }));
  await p.waitForTimeout(3300);
  steps.m4 = await p.evaluate(() => {
    const t = getComputedStyle(document.querySelector(".location-local")).transform;
    const sc = t === "none" ? 1 : +t.match(/matrix\(([^,]+)/)[1];
    return {
      scale: +sc.toFixed(2),
      spots: [...document.querySelectorAll("[data-hotspot]")].map((e) => +getComputedStyle(e).opacity).join(","),
      rows: [...document.querySelectorAll("[data-time-row]")].map((e) => +getComputedStyle(e).opacity).join(","),
    };
  });
  ok(steps.m4.scale === 1 && steps.m4.spots === "1,1,1" && steps.m4.rows === "1,1,1", `M4 final: ${JSON.stringify(steps.m4)}`);

  // ---- M1 y M3 (escritorio con movimiento) ----
  if (wide && !reduced) {
    const scrollTrack = async (sel, fr) => {
      await p.evaluate(([s, f]) => {
        const t = document.querySelector(s);
        window.scrollTo(0, t.getBoundingClientRect().top + scrollY + (t.offsetHeight - innerHeight) * f);
      }, [sel, fr]);
      await p.waitForTimeout(1000);
    };
    steps.m1 = [];
    for (const f of [0.04, 0.45, 0.92]) {
      await scrollTrack(".concept-track", f);
      steps.m1.push(await p.evaluate(() => document.querySelector(".concept-stage").dataset.step));
    }
    ok(steps.m1.join("") === "123", `M1 fases ${steps.m1}`);
    steps.m3 = [];
    for (const f of [0, 0.5, 1]) {
      await scrollTrack(".inv-track", f);
      steps.m3.push(await p.evaluate(() => document.querySelector(".inv-img").style.clipPath.slice(0, 34)));
    }
    steps.m3fit = await p.evaluate(() => ({ photoBottom: Math.round(document.querySelector(".investment-photo").getBoundingClientRect().bottom), vh: innerHeight }));
    ok(steps.m3fit.photoBottom <= steps.m3fit.vh, `M3: la foto se sale de la ventana (${steps.m3fit.photoBottom} > ${steps.m3fit.vh})`);
  }

  console.log(JSON.stringify({ run: tag, screens: m.screens, vivir: m.vivirH, galeria: m.galH, sections: m.sections, steps, errors }));
  await ctx.close();
}
await browser.close();
console.log(fails.length ? `FALLAS (${fails.length}):\n- ${fails.join("\n- ")}` : "TODO OK: consola limpia, sin desborde, Vivir, Galeria, FAQ, M3 y M4 verificados");
