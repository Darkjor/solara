import { describe, expect, it } from "vitest";
import { formatMXN } from "./format";
import { lotCount, lotMax, lotMin, priceFrom, priceMax, pricePerM2, times } from "./site";

describe("datos de SOLARA", () => {
  it("el precio de entrada y el maximo salen de $4,450 por m2", () => {
    expect(pricePerM2).toBe(4450);
    expect(priceFrom).toBe(801000);
    expect(priceMax).toBe(1134750);
    expect(lotMin).toBe(180);
    expect(lotMax).toBe(255);
    expect(lotCount).toBe(235);
  });

  it("formatea el precio en MXN sin decimales", () => {
    expect(formatMXN(priceFrom, "es")).toMatch(/801,000/);
    expect(formatMXN(priceMax, "en")).toMatch(/1,134,750/);
  });

  it("los tiempos son los del mapa del cliente", () => {
    expect(times.map((t) => t.min).sort((a, b) => a - b)).toEqual([2, 5, 5, 5, 6, 9, 10, 13]);
  });
});
