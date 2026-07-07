import type { NumberEntry, QuizQuestion } from "./types";

export type LargeEntry = NumberEntry & { irregular?: boolean };

export const numbers: NumberEntry[] = [
  { num: 0, kanji: "零", hiragana: "れい", romaji: "rei" },
  { num: 1, kanji: "一", hiragana: "いち", romaji: "ichi" },
  { num: 2, kanji: "二", hiragana: "に", romaji: "ni" },
  { num: 3, kanji: "三", hiragana: "さん", romaji: "san" },
  { num: 4, kanji: "四", hiragana: "し／よん", romaji: "shi / yon" },
  { num: 5, kanji: "五", hiragana: "ご", romaji: "go" },
  { num: 6, kanji: "六", hiragana: "ろく", romaji: "roku" },
  { num: 7, kanji: "七", hiragana: "しち／なな", romaji: "shichi / nana" },
  { num: 8, kanji: "八", hiragana: "はち", romaji: "hachi" },
  { num: 9, kanji: "九", hiragana: "きゅう", romaji: "kyū" },
  { num: 10, kanji: "十", hiragana: "じゅう", romaji: "jū" },
  { num: 11, kanji: "十一", hiragana: "じゅういち", romaji: "jū-ichi" },
  { num: 12, kanji: "十二", hiragana: "じゅうに", romaji: "jū-ni" },
  { num: 13, kanji: "十三", hiragana: "じゅうさん", romaji: "jū-san" },
  {
    num: 14,
    kanji: "十四",
    hiragana: "じゅうし／じゅうよん",
    romaji: "jū-shi / jū-yon",
  },
  { num: 15, kanji: "十五", hiragana: "じゅうご", romaji: "jū-go" },
  { num: 16, kanji: "十六", hiragana: "じゅうろく", romaji: "jū-roku" },
  {
    num: 17,
    kanji: "十七",
    hiragana: "じゅうしち／じゅうなな",
    romaji: "jū-shichi / jū-nana",
  },
  { num: 18, kanji: "十八", hiragana: "じゅうはち", romaji: "jū-hachi" },
  { num: 19, kanji: "十九", hiragana: "じゅうきゅう", romaji: "jū-kyū" },
  { num: 20, kanji: "二十", hiragana: "にじゅう", romaji: "ni-jū" },
  { num: 30, kanji: "三十", hiragana: "さんじゅう", romaji: "san-jū" },
  { num: 40, kanji: "四十", hiragana: "よんじゅう", romaji: "yon-jū" },
  { num: 50, kanji: "五十", hiragana: "ごじゅう", romaji: "go-jū" },
  { num: 60, kanji: "六十", hiragana: "ろくじゅう", romaji: "roku-jū" },
  { num: 70, kanji: "七十", hiragana: "ななじゅう", romaji: "nana-jū" },
  { num: 80, kanji: "八十", hiragana: "はちじゅう", romaji: "hachi-jū" },
  { num: 90, kanji: "九十", hiragana: "きゅうじゅう", romaji: "kyū-jū" },
  { num: 100, kanji: "百", hiragana: "ひゃく", romaji: "hyaku" },
];

// 4 and 7 read differently when combined into a larger number:
//   四 = "shi / yon"     → in compounds use "yon"  (四十 = yon-jū)
//   七 = "shichi / nana" → in compounds use "nana"
// The combining form is always the LAST listed reading.
const combiningReading = (reading: string, separator: string): string =>
  reading.split(separator).at(-1)!.trim();

export function buildEntry(i: number): NumberEntry {
  const exact = numbers.find((n) => n.num === i);
  if (exact) return exact;

  // i is 0–100 and every tens/ones component exists in `numbers`, so these
  // finds never miss (the exhaustive test proves it).
  const tens = numbers.find((n) => n.num === Math.floor(i / 10))!;
  const ones = numbers.find((n) => n.num === i % 10)!;
  const hasOnes = i % 10 > 0;

  const kanji = tens.kanji + "十" + (hasOnes ? ones.kanji : "");
  const hiragana =
    combiningReading(tens.hiragana, "／") +
    "じゅう" +
    (hasOnes ? combiningReading(ones.hiragana, "／") : "");
  const romaji =
    combiningReading(tens.romaji, " / ") +
    "-jū" +
    (hasOnes ? "-" + combiningReading(ones.romaji, " / ") : "");

  return { num: i, kanji, hiragana, romaji };
}

export const fullList = Array.from({ length: 101 }, (_, i) => buildEntry(i));

// German thousands separators: 100000 → "100.000"
export const formatNum = (n: number): string => n.toLocaleString("de-DE");

// ── Irregular sound-change maps for 百 and 千 ──────────────────────────────
// ponytail: two small literal maps vs a rule-based string transform — easier to audit
const HYAKU_IRR: Record<
  number,
  { kanji: string; hiragana: string; romaji: string }
> = {
  3: { kanji: "三百", hiragana: "さんびゃく", romaji: "sanbyaku" },
  6: { kanji: "六百", hiragana: "ろっぴゃく", romaji: "roppyaku" },
  8: { kanji: "八百", hiragana: "はっぴゃく", romaji: "happyaku" },
};
const SEN_IRR: Record<
  number,
  { kanji: string; hiragana: string; romaji: string }
> = {
  3: { kanji: "三千", hiragana: "さんぜん", romaji: "sanzen" },
  8: { kanji: "八千", hiragana: "はっせん", romaji: "hassen" },
};

export function buildLargeEntry(n: number): NumberEntry {
  if (n < 0 || n > 1_000_000)
    throw new Error(`buildLargeEntry: ${n} out of range 0–1_000_000`);

  const manDigit = Math.floor(n / 10_000);
  const r1 = n % 10_000;
  const senDigit = Math.floor(r1 / 1_000);
  const r2 = r1 % 1_000;
  const hyakuDigit = Math.floor(r2 / 100);
  const rest = r2 % 100;

  const kanjiParts: string[] = [];
  const hiraganaParts: string[] = [];
  const romajiParts: string[] = [];

  // 万 part — buildEntry covers 1–100; ichi is always kept (ichiman, not just man)
  if (manDigit > 0) {
    const base = buildEntry(manDigit);
    kanjiParts.push(base.kanji + "万");
    hiraganaParts.push(combiningReading(base.hiragana, "／") + "まん");
    // strip any internal hyphens from compound readings (e.g. san-jū → sanjū)
    romajiParts.push(
      combiningReading(base.romaji, " / ").replace(/-/g, "") + "man",
    );
  }

  // 千 part — drop ichi for 1; 3 and 8 are irregular
  if (senDigit > 0) {
    const irr = SEN_IRR[senDigit];
    if (irr) {
      kanjiParts.push(irr.kanji);
      hiraganaParts.push(irr.hiragana);
      romajiParts.push(irr.romaji);
    } else {
      const d = numbers.find((e) => e.num === senDigit)!;
      const dh = senDigit === 1 ? "" : combiningReading(d.hiragana, "／");
      const dr = senDigit === 1 ? "" : combiningReading(d.romaji, " / ");
      kanjiParts.push((senDigit === 1 ? "" : d.kanji) + "千");
      hiraganaParts.push(dh + "せん");
      romajiParts.push(dr + "sen");
    }
  }

  // 百 part — drop ichi for 1; 3, 6, 8 are irregular
  if (hyakuDigit > 0) {
    const irr = HYAKU_IRR[hyakuDigit];
    if (irr) {
      kanjiParts.push(irr.kanji);
      hiraganaParts.push(irr.hiragana);
      romajiParts.push(irr.romaji);
    } else {
      const d = numbers.find((e) => e.num === hyakuDigit)!;
      const dh = hyakuDigit === 1 ? "" : combiningReading(d.hiragana, "／");
      const dr = hyakuDigit === 1 ? "" : combiningReading(d.romaji, " / ");
      kanjiParts.push((hyakuDigit === 1 ? "" : d.kanji) + "百");
      hiraganaParts.push(dh + "ひゃく");
      romajiParts.push(dr + "hyaku");
    }
  }

  // 0–99 part — existing buildEntry
  if (rest > 0) {
    const re = buildEntry(rest);
    kanjiParts.push(re.kanji);
    hiraganaParts.push(re.hiragana);
    romajiParts.push(re.romaji.replace(/-/g, ""));
  }

  // n = 0 → no parts collected, delegate to buildEntry (returns 零)
  if (kanjiParts.length === 0) return buildEntry(0);

  // When the man-part is itself compound (≥ 10) use "-" between major unit
  // segments so long strings stay readable (e.g. kyūjūkyūman-kyūsen-…).
  // Single-digit man-parts (or no man-part) run together without separators.
  const sep = manDigit >= 10 ? "-" : "";

  return {
    num: n,
    kanji: kanjiParts.join(""),
    hiragana: hiraganaParts.join(""),
    romaji: romajiParts.join(sep),
  };
}

// Curated overview list — all numbers that carry a rule, plus context entries.
// irregular = true  →  highlighted gold in the overview table (the whole point).
const importantLarge: { num: number; irregular?: boolean }[] = [
  // Hunderter
  { num: 100 },
  { num: 200 },
  { num: 300, irregular: true },
  { num: 400 },
  { num: 500 },
  { num: 600, irregular: true },
  { num: 700 },
  { num: 800, irregular: true },
  { num: 900 },
  // Tausender
  { num: 1_000 },
  { num: 2_000 },
  { num: 3_000, irregular: true },
  { num: 4_000 },
  { num: 5_000 },
  { num: 6_000 },
  { num: 7_000 },
  { num: 8_000, irregular: true },
  { num: 9_000 },
  // Große Einheiten
  { num: 10_000 },
  { num: 100_000 },
  { num: 200_000 },
  { num: 500_000 },
  { num: 1_000_000 },
];

export const largeList: LargeEntry[] = importantLarge.map((e) => ({
  ...buildLargeEntry(e.num),
  irregular: e.irregular,
}));

export function getQuizQuestion(
  forcedNum?: number,
  scope?: "large",
): QuizQuestion {
  // Large-number scope: fully random 0–1_000_000, 2 options (correct + 1 distractor)
  if (scope === "large") {
    const n = Math.floor(Math.random() * 1_000_001);
    const correct = buildLargeEntry(n);
    let distractor: NumberEntry;
    do {
      distractor = buildLargeEntry(Math.floor(Math.random() * 1_000_001));
    } while (distractor.num === n);
    const options =
      Math.random() < 0.5 ? [correct, distractor] : [distractor, correct];
    return { correct, options };
  }

  // Existing 0–100 logic (unchanged)
  const correct =
    forcedNum !== undefined
      ? fullList.find((x) => x.num === forcedNum)
      : fullList[Math.floor(Math.random() * fullList.length)];
  if (!correct) throw new Error(`Invalid forcedNum: ${forcedNum}`);
  const distractors: NumberEntry[] = [];
  while (distractors.length < 3) {
    const d = fullList[Math.floor(Math.random() * fullList.length)];
    if (d.num !== correct.num && !distractors.find((x) => x.num === d.num)) {
      distractors.push(d);
    }
  }
  const options = [...distractors, correct];
  for (let k = options.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [options[k], options[j]] = [options[j], options[k]];
  }
  return { correct, options };
}
