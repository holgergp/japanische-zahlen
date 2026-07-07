import { describe, it, expect } from "vitest";
import { buildLargeEntry } from "./numberUtils";
import { numbersReference } from "./numbersReference.js";

describe("buildLargeEntry against hand-verified oracle", () => {
  const largeOracle = numbersReference.filter((r) => r.num > 100);

  it("covers all expected large oracle cases", () => {
    expect(largeOracle.length).toBeGreaterThan(0);
  });

  it("matches hiragana and romaji for every large oracle row", () => {
    for (const expected of largeOracle) {
      const generated = buildLargeEntry(expected.num);
      expect(generated.hiragana, `hiragana mismatch for ${expected.num}`).toBe(
        expected.hiragana,
      );
      expect(generated.romaji, `romaji mismatch for ${expected.num}`).toBe(
        expected.romaji,
      );
    }
  });

  it("throws for out-of-range inputs", () => {
    expect(() => buildLargeEntry(-1)).toThrow();
    expect(() => buildLargeEntry(1_000_001)).toThrow();
  });
});
