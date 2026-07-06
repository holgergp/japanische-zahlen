import { describe, it, expect } from "vitest";
import { buildEntry, fullList, getQuizQuestion } from "./numberUtils.js";
import { numbersReference } from "./numbersReference.js";

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

describe("Exhaustive comparison against independent gold standard reference data", () => {
  it("should match reference readings for all numbers 0-100", () => {
    for (let i = 0; i <= 100; i++) {
      const generated = buildEntry(i);
      const expected = numbersReference.find(r => r.num === i);
      
      expect(expected, `Reference data missing for ${i}`).toBeDefined();
      expect(generated.hiragana, `Hiragana discrepancy for ${i}`).toBe(expected.hiragana);
      expect(generated.romaji, `Romaji discrepancy for ${i}`).toBe(expected.romaji);
    }
  });
});

describe("Quiz generation logic", () => {
  it("should pick a valid correct answer and 3 unique distractors that match reference standards", () => {
    for (let testRun = 0; testRun < 200; testRun++) {
      const { correct, options } = getQuizQuestion();

      // 1. Correct answer must be a valid number from our reference list
      const refCorrect = numbersReference.find(r => r.num === correct.num);
      expect(refCorrect, `No reference entry found for picked correct number ${correct.num}`).toBeDefined();
      expect(correct.hiragana).toBe(refCorrect.hiragana);
      expect(correct.romaji).toBe(refCorrect.romaji);

      // 2. Options must contain exactly 4 choices
      expect(options.length).toBe(4);

      // 3. All options must be unique
      const uniqueNums = new Set(options.map(o => o.num));
      expect(uniqueNums.size).toBe(4);

      // 4. Correct answer must be included in the options
      expect(uniqueNums.has(correct.num)).toBe(true);

      // 5. Each option must match its standard reference data
      for (const opt of options) {
        const refOpt = numbersReference.find(r => r.num === opt.num);
        expect(refOpt, `No reference entry found for option number ${opt.num}`).toBeDefined();
        expect(opt.hiragana).toBe(refOpt.hiragana);
        expect(opt.romaji).toBe(refOpt.romaji);
      }
    }
  });

  it("should support forcing a specific question number via parameter", () => {
    const forced64 = getQuizQuestion(64);
    expect(forced64.correct.num).toBe(64);
    expect(forced64.options.find(o => o.num === 64)).toBeDefined();

    const forced0 = getQuizQuestion(0);
    expect(forced0.correct.num).toBe(0);
    expect(forced0.options.find(o => o.num === 0)).toBeDefined();

    const forced100 = getQuizQuestion(100);
    expect(forced100.correct.num).toBe(100);
    expect(forced100.options.find(o => o.num === 100)).toBeDefined();

    expect(() => getQuizQuestion(101)).toThrow("Invalid forcedNum: 101");
  });
});
