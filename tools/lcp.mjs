import { chromium } from "playwright-core";
import { exe } from "./exe.mjs";
const b = await chromium.launch({ executablePath: exe });
for (const preset of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 2.6, isMobile: true });
  const p = await ctx.newPage();
  if (preset) await p.addInitScript(() => sessionStorage.setItem("solara-intro", "1"));
  await p.addInitScript(() => {
    window.__lcp = [];
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lcp.push([Math.round(e.startTime), e.element?.tagName + "." + String(e.element?.className).slice(0, 30), e.size]))).observe({ type: "largest-contentful-paint", buffered: true });
  });
  await p.goto("http://localhost:3101/", { waitUntil: "load" });
  await p.waitForTimeout(3000);
  console.log(preset ? "sin intro" : "con intro", JSON.stringify(await p.evaluate(() => window.__lcp)));
  await ctx.close();
}
await b.close();
