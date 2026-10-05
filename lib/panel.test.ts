import { describe, expect, it } from "vitest";
import { likePattern, toCsv } from "./panel";

describe("toCsv", () => {
  it("escapa comillas, comas y saltos de línea", () => {
    expect(toCsv([{ a: 'di "hola", ya', b: "x\ny" }])).toBe('a,b\r\n"di ""hola"", ya","x\ny"');
  });
  it("neutraliza fórmulas", () => {
    expect(toCsv([{ a: "=HYPERLINK(1)" }])).toBe("a\r\n'=HYPERLINK(1)");
  });
});

describe("likePattern", () => {
  it("escapa comodines", () => {
    expect(likePattern("50%_a")).toBe("%50\\%\\_a%");
  });
});
