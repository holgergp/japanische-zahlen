export const numbers = [
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
const combiningReading = (reading, separator) =>
  reading.split(separator).at(-1).trim();

export function buildEntry(i) {
  const exact = numbers.find((n) => n.num === i);
  if (exact) return exact;

  const tens = numbers.find((n) => n.num === Math.floor(i / 10));
  const ones = numbers.find((n) => n.num === i % 10);
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

export function getQuizQuestion(forcedNum) {
  const correct =
    forcedNum !== undefined
      ? fullList.find((x) => x.num === forcedNum)
      : fullList[Math.floor(Math.random() * fullList.length)];
  if (!correct) throw new Error(`Invalid forcedNum: ${forcedNum}`);
  const distractors = [];
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
