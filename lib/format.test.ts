import { describe, expect, it } from "vitest";
import { formatMXNCompact } from "./format";

describe("formatMXNCompact", () => {
  it("abrevia una cifra a un decimal", () => {
    expect(formatMXNCompact(1134750, "en")).toBe("$1.1M");
  });
});
