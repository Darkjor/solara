// Verifica "Vivir" ligado al scroll en el build de produccion: node tools/check-vivir.mjs [base]
import { chromium } from "playwright-core";
import { exe } from "./exe.mjs";
const base = process.argv[2] ?? "http://localhost:3302";
const shotDir = process.argv[3];
const browser = await chromium.launch({ executablePath: exe });
const out = [];
for (const [w, h, mobile] of [[390, 844, true], [360, 740, true], [1440, 900, false]]) {
  for (const reduced of [false, true]) {
    if (reduced && w !== 390) continue;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: mobile, isMobile: mobile, reducedMotion: reduced ? "reduce" : "no-preference" });
    const p = await ctx.newPage();
    const errs = [];
    p.on("console", (m) => ["error", "warning"].includes(m.type()) && errs.push(m.text().slice(0, 120)));
    p.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));
    await p.goto(base + "/es", { waitUntil: "load" });
    await p.waitForTimeout(800);
    await p.mouse.wheel(0, 50);
    await p.waitForTimeout(1500);
    const m = () => p.evaluate(() => {
      const row = document.querySelector("#vivir-row");
      const imgs = [...document.querySelectorAll("[data-vivir-img]")];
      return {
        y: Math.round(scrollY),
        left: Math.round(row.scrollLeft),
        max: row.scrollWidth - row.clientWidth,
        snap: getComputedStyle(row).scrollSnapType,
        tf: imgs.map((i) => (i.style.transform || "none").replace(/translate\(|\)|scale\(|px|, 0/g, "").slice(0, 22)).join(" | "),
        dis: [...document.querySelectorAll(".vivir-btn")].map((b) => b.getAttribute("aria-disabled")).join(","),
        pageOverflowX: document.documentElement.scrollWidth > innerWidth,
      };
    });
    const rng = await p.evaluate(() => { const s = document.querySelector("#vivir"); const t = s.getBoundingClientRect().top + scrollY; return [t - innerHeight, t + s.offsetHeight]; });
    const res = { vp: `${w}x${h}${reduced ? " reduce" : ""}`, range: rng.map(Math.round), pos: [] };
    for (const f of reduced ? [0.5] : [0.25, 0.6, 0.95]) {
      await p.evaluate((y) => scrollTo(0, y), rng[0] + (rng[1] - rng[0]) * f);
      await p.waitForTimeout(1800);
      res.pos.push(await m());
      if (!reduced && f === 0.6 && shotDir && w === 390) await p.screenshot({ path: `${shotDir}/vivir-390.jpg`, type: "jpeg", quality: 55 });
    }
    if (!reduced) {
      // vuelve a un punto medio y suelta con gesto
      await p.evaluate((y) => scrollTo(0, y), rng[0] + (rng[1] - rng[0]) * 0.4);
      await p.waitForTimeout(1800);
      const before = await m();
      const box = await p.evaluate(() => { const r = document.querySelector("#vivir-row").getBoundingClientRect(); return { x: r.left + r.width / 2, y: Math.min(r.top + 150, innerHeight - 100) }; });
      if (mobile) {
        const cdp = await ctx.newCDPSession(p);
        const t = (type, x) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y: box.y }] });
        await t("touchStart", box.x + 80);
        for (let i = 1; i <= 8; i++) { await t("touchMove", box.x + 80 - i * 15); await p.waitForTimeout(16); }
        await t("touchEnd", 0);
      } else {
        await p.mouse.move(box.x, box.y);
        await p.mouse.down();
        await p.mouse.move(box.x - 150, box.y, { steps: 6 });
        await p.mouse.up();
      }
      await p.waitForTimeout(700);
      const after = await m();
      await p.evaluate((y) => scrollTo(0, y), rng[0] + (rng[1] - rng[0]) * 0.8);
      await p.waitForTimeout(1800);
      const later = await m();
      res.release = { before, after, afterScrollDown: later };
      // flecha tras soltar
      if (!mobile) {
        await p.click(".vivir-btn >> nth=1", { force: true });
        await p.waitForTimeout(900);
        res.arrowPrev = await m();
      }
    }
    res.errs = errs;
    out.push(res);
    await ctx.close();
  }
}
await browser.close();
for (const r of out) console.log(JSON.stringify(r));
