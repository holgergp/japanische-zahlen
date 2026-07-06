import { describe, it, expect } from "vitest";
import { buildEntry, fullList } from "./numberUtils.js";

describe("Japanese number parsing/building logic", () => {
  it("should parse hardcoded basic numbers correctly", () => {
    const n4 = buildEntry(4);
    expect(n4.romaji).toBe("shi / yon");
    expect(n4.hiragana).toBe("し／よん");

    const n14 = buildEntry(14);
    expect(n14.romaji).toBe("jū-shi / jū-yon");
    expect(n14.hiragana).toBe("じゅうし／じゅうよん");
  });

  it("should correctly build compound numbers ending in 4", () => {
    const n24 = buildEntry(24);
    expect(n24.romaji).toBe("ni-jū-yon");
    expect(n24.hiragana).toBe("にじゅうよん");

    const n54 = buildEntry(54);
    expect(n54.romaji).toBe("go-jū-yon");
    expect(n54.hiragana).toBe("ごじゅうよん");

    const n64 = buildEntry(64);
    expect(n64.romaji).toBe("roku-jū-yon");
    expect(n64.hiragana).toBe("ろくじゅうよん");
  });

  it("should correctly build compound numbers ending in 7", () => {
    const n27 = buildEntry(27);
    expect(n27.romaji).toBe("ni-jū-nana");
    expect(n27.hiragana).toBe("にじゅうなな");

    const n67 = buildEntry(67);
    expect(n67.romaji).toBe("roku-jū-nana");
    expect(n67.hiragana).toBe("ろくじゅうなな");
  });

  it("should correctly build round tens", () => {
    const n40 = buildEntry(40);
    expect(n40.romaji).toBe("yon-jū");
    expect(n40.hiragana).toBe("よんじゅう");

    const n70 = buildEntry(70);
    expect(n70.romaji).toBe("nana-jū");
    expect(n70.hiragana).toBe("ななじゅう");
  });

  it("should generate a complete list of 101 numbers (0-100)", () => {
    expect(fullList.length).toBe(101);
  });
});
