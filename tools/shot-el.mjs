// Captura un elemento o rango. Uso: node tools/shot-el.mjs <w> <h> <path> <selector> <out> [scrollY] [lang]
import { chromium } from "playwright-core";
import { exe } from "./exe.mjs";
const [w, h, path, sel, out, sy] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: exe });
const ctx = await b.newContext({ viewport: { width: +w, height: +h } });
const p = await ctx.newPage();
await p.goto("http://localhost:3100" + path, { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
if (sel === "-") {
  await p.evaluate((y) => window.scrollTo(0, y), +sy);
  await p.waitForTimeout(900);
  await p.screenshot({ path: out });
} else {
  const el = p.locator(sel).first();
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(1200);
  await el.screenshot({ path: out });
}
await b.close();
