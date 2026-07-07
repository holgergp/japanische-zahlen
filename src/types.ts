// Shared data shapes. `NumberEntry` is the full record; note that the test
// oracle `numbersReference.js` intentionally omits `kanji`.
export interface NumberEntry {
  num: number;
  kanji: string;
  hiragana: string;
  romaji: string;
}

export type QuizMode = "zahl-romaji" | "romaji-zahl";

export type FilterGroup = "alle" | "0-10" | "11-19" | "20-99" | "round";

export interface QuizQuestion {
  correct: NumberEntry;
  options: NumberEntry[];
}
