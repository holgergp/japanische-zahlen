# Feature: Große Zahlen (100 → 100 Mio.)

> Companion to `docs/coding-spec.md`. This is the *what/why*; the *how* is a lean
> plan that reuses the existing `numbers` / `fullList` / `FilterGroup` machinery.
> UI copy stays **German**, content stays Japanese (Kanji / Hiragana / Romaji).

## 1. Goal

The 0–100 lesson is done. The next lesson covers the big units and their
**sound changes** (Rendaku / gemination). Two deliverables:

1. **Overview** — show the *important* large numbers and mark the irregular
   readings. Not every number, just the ones that carry a rule.
2. **Quiz mode** — an option to test against these larger numbers.

## 2. The rules (this is the content)

Japanese groups by **10.000 (万)**, not by 1.000 like German. So 100.000 is
"ten ten-thousands" = 十万, built on 万 as the base — exactly the user's hunch.

Most combinations are regular (`san` + `hyaku` = `sanbyaku`… no, that one *is*
irregular — see below). The whole point of the feature is the handful that
change sound. **Bold = irregular**, the rest are shown for context.

### Hunderter — 百 (hyaku)

| Zahl | Kanji | Hiragana | Romaji | Regel |
|------|-------|----------|--------|-------|
| 100 | 百 | ひゃく | hyaku | – |
| 200 | 二百 | にひゃく | nihyaku | regelmäßig |
| **300** | 三百 | さん**び**ゃく | san**b**yaku | h→b |
| 400 | 四百 | よんひゃく | yonhyaku | regelmäßig |
| 500 | 五百 | ごひゃく | gohyaku | regelmäßig |
| **600** | 六百 | **ろっ**ぴゃく | **rop**pyaku | roku→rop, h→p |
| 700 | 七百 | ななひゃく | nanahyaku | regelmäßig |
| **800** | 八百 | **はっ**ぴゃく | **hap**pyaku | hachi→hap, h→p |
| 900 | 九百 | きゅうひゃく | kyūhyaku | regelmäßig |

### Tausender — 千 (sen)

| Zahl | Kanji | Hiragana | Romaji | Regel |
|------|-------|----------|--------|-------|
| 1.000 | 千 | せん | sen | – |
| 2.000 | 二千 | にせん | nisen | regelmäßig |
| **3.000** | 三千 | さん**ぜ**ん | san**z**en | s→z |
| 4.000 | 四千 | よんせん | yonsen | regelmäßig |
| 5.000 | 五千 | ごせん | gosen | regelmäßig |
| 6.000 | 六千 | ろくせん | rokusen | regelmäßig |
| 7.000 | 七千 | ななせん | nanasen | regelmäßig |
| **8.000** | 八千 | **はっ**せん | **has**sen | hachi→has |
| 9.000 | 九千 | きゅうせん | kyūsen | regelmäßig |

### Große Einheiten — 万 (man), Obergrenze 500.000

Unlike 百 and 千, **万 itself never changes sound** (`ichiman`, `niman`, `sanman`
… all regular). The twist at this ceiling is that the 万-part is now a *composed*
number, not a single digit: 500.000 is "fifty ten-thousands".

| Zahl | Kanji | Hiragana | Romaji | Hinweis |
|------|-------|----------|--------|---------|
| 10.000 | 一万 | いちまん | ichiman | **immer mit 一** (nie nur 万) |
| 100.000 | 十万 | じゅうまん | jūman | 10 × 万 |
| 200.000 | 二十万 | にじゅうまん | nijūman | 20 × 万 |
| 500.000 | 五十万 | ごじゅうまん | gojūman | Obergrenze, 50 × 万 |

So the only irregular readings anywhere in 0–500.000 stay confined to the 百 slot
(3/6/8) and the 千 slot (3/8). Everything else — including the whole 万-part — is
regular composition.

## 3. Approach: a composer, not a flat list

The ceiling of **500.000** means the "test larger numbers" mode must handle
arbitrary values (e.g. 21.560), which a hand-written list can't cover. So extend
`buildEntry`'s philosophy to a `buildLargeEntry(n)` for 0–500.000:

```
n → man-part (compose ⌊n/10000⌋ via the existing 0–100 logic) + 万
  → sen-part (千, with 3→zen, 8→hassen; drop ichi for 1千)
  → hyaku-part (百, with 3→byaku, 6→roppyaku, 8→happyaku; drop ichi for 1百)
  → tens/ones (existing buildEntry)
```

~40 lines, irregular readings as two small lookup maps. The 万-part reuses the
0–100 machinery verbatim, so no new exception rules for the top slot. The
**overview** still shows only a curated set of important numbers (§2) — those are
just specific `n` values run through the same composer, so there is one source of
truth, not two.

## 4. Implementation plan (lean, reuses existing patterns)

### 4.1 Data + composer — `src/numberUtils.ts`

- Add `buildLargeEntry(n: number): NumberEntry` per §3. Guard the range
  (`0 ≤ n ≤ 500_000`).
- Add a curated list of the *important* numbers for the overview — just the
  `num`s plus an `irregular` flag for highlighting; readings come from the
  composer:

  ```ts
  const importantLarge: { num: number; irregular?: boolean }[] = [
    { num: 100 }, { num: 200 }, { num: 300, irregular: true }, /* … */
    { num: 10_000 }, { num: 100_000 }, { num: 500_000 },
  ];
  export const largeList = importantLarge.map((e) => ({
    ...buildLargeEntry(e.num),
    irregular: e.irregular,
  }));
  ```

`fullList` (0–100) is untouched.

### 4.1b Oracle — `src/numbersReference.js` (per this feature's correction)

Extend the hand-maintained oracle with relevant cases **above 100** — every
irregular trigger plus a few stacked combos — verified by hand, *not* generated
from the composer (same shape as today: `{ num, hiragana, romaji }`, no kanji):

| num | hiragana | romaji |
|-----|----------|--------|
| 100 | ひゃく | hyaku |
| 300 | さんびゃく | sanbyaku |
| 600 | ろっぴゃく | roppyaku |
| 800 | はっぴゃく | happyaku |
| 1000 | せん | sen |
| 3000 | さんぜん | sanzen |
| 8000 | はっせん | hassen |
| 10000 | いちまん | ichiman |
| 21560 | にまんせんごひゃくろくじゅう | nimansengohyakurokujū |
| 23000 | にまんさんぜん | nimansanzen |
| 100000 | じゅうまん | jūman |
| 500000 | ごじゅうまん | gojūman |

The existing exhaustive 0–100 test stays as-is; add a test that runs
`buildLargeEntry` against these curated rows. (Exhaustive 0–500.000 via a second
independent implementation is possible but not worth the code — skip it.)

### 4.2 Overview — `src/components/NumberTable.tsx` + `FilterGroup`

Extend `FilterGroup` in `types.ts`:

```ts
export type FilterGroup =
  | "alle" | "0-10" | "11-19" | "20-99" | "round"
  | "hunderter" | "tausender" | "grosse-einheiten";
```

The new three groups read from `largeList`, the existing five from `fullList`.
`NumberTable` picks the source by group, then renders the same row grid it
already has. For irregular rows, reuse `colors.accentGold` (already the "special"
color) on the Hiragana/Romaji cell so the rule is *visible* — that is the whole
"see the rules" ask. No new column strictly needed; a gold reading = "this one
breaks the pattern."

### 4.3 Quiz mode — `src/components/Quiz.tsx` + `getQuizQuestion`

The user wants a mode "that tests for larger numbers." Smallest change that fits
the existing quiz: a **scope** toggle alongside the current mode switch —
`0–100` (today's behavior) vs. `Große Zahlen`. For the large scope, pick a random
`n` in range and build it with `buildLargeEntry`; distractors are other composed
values so options stay plausible.

**Score: one shared bucket.** Scope does *not* enter the score key — `QuizMode`
(`zahl-romaji` / `romaji-zahl`) stays the only dimension, so large-number answers
count into the same `score[mode]` as the 0–100 ones. No `Score`/`QuizMode` type
change.

## 5. Scope / non-goals

- **In:** composer + oracle for 0–500.000, curated overview with irregular
  highlighting, a quiz scope for large numbers (shared score bucket).
- **Out (YAGNI):** numbers above 500.000, the 億 / 兆 units, counters (〜個/〜人).
  Add only if a later lesson needs them.

## 6. Ground rules (from coding-spec.md, still apply)

- `npm run test` green after every step; don't touch `numbersReference.js`.
- No new runtime deps. UI strings German. One task = one PR.
