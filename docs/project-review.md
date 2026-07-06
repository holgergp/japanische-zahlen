# Project Review — 数字 / Japanische Zahlen

> Reviewed: 2026-07-06 · Scope: whole repository, with attention to the recent
> `numberUtils` extraction + test suite on branch `reviewWithOpus`.

A small, well-scoped React app for learning Japanese numbers 0–100 (VHS
Düsseldorf, Minna no Nihongo A1). ~750 lines of source. The app does one thing
and does it well. This review covers what's strong, what's weak, and a
prioritized list of what to improve.

---

## Strengths

- **Sharp, honest scope.** One audience, one topic (0–100), three tabs. No
  feature creep, no routing, no state library. The app is exactly as big as the
  problem.
- **Good recent direction.** The `numberUtils.js` extraction pulled the number
  logic out of the UI, added a `vitest` suite, and wired `npm run test` into CI
  *before* `build`. That's the right order of operations for a codebase that
  previously had zero tests.
- **The core algorithm is the right call.** `buildEntry` composes 21–99 from
  tens + ones instead of hardcoding 101 rows, and it correctly handles the
  tricky dual readings (4 = shi/yon, 7 = shichi/nana), preferring the compound
  form. This is the part most likely to have subtle bugs, and it's now the part
  best covered.
- **Strong test coverage where it matters.** The exhaustive 0–100 comparison
  against `numbersReference` is a genuine oracle for the generation logic — it
  would catch any regression in `buildEntry` immediately. The `forcedNum`
  parameter is a clean, minimal way to make quiz generation deterministic in
  tests without mocking `Math.random`.
- **Lightweight and fast.** Zero runtime dependencies beyond React. Vite build,
  static hosting, automated deploy to GitHub Pages.
- **Thoughtful UX details.** System-preference-aware theme with `localStorage`
  override and live `matchMedia` listener, answer countdown, two quiz modes with
  separate scoring, `clamp()` responsive typography, and `safe-area-inset`
  handling for mobile notches.
- **Above-average documentation** for a project this size (README + AGENTS.md).

---

## Weaknesses

### 1. `App.jsx` is a 448-line monolith
All UI, all state, all styling, and a ~25-key `colors` object live in one
component. There are no sub-components (FlashCard, Quiz, NumberTable), so the
render tree is one long conditional block. This is the main obstacle to both
maintainability and UI testing.

### 2. Documentation has drifted out of sync
The recent refactor made the docs wrong in several concrete places:
- `AGENTS.md` still says **"Tests: None"** and **"App.jsx — THE ENTIRE APP …
  All UI, state, logic, data"**, and its file map omits `numberUtils.js`,
  `numbersReference.js`, and the test file.
- `README.md` "Technik" section claims **React 18 / Vite 5**; `package.json`
  pins **React 19 / Vite 8**.

Stale docs are worse than no docs — they actively mislead the next contributor
(human or agent).

### 3. Only pure logic is tested; the UI is not
The 9 tests cover `buildEntry` and `getQuizQuestion` well, but nothing exercises
`handleAnswer`, score accumulation, mode switching, or the countdown. A
component-level regression (e.g. wrong answer scored as correct) would ship
undetected.

### 4. `numbersReference.js` is a hand-transcribed duplicate
103 lines of data that could be derived. As an *independent oracle* for the
tests it has real value — but only if it's genuinely maintained by hand and
independently. Right now it's an undocumented copy; if someone regenerates it
from `buildEntry` "to fix a mismatch," the test silently becomes a tautology.
Either commit to it as an intentional oracle (and say so in a header comment) or
drop it.

### 5. Styling is entirely inline and duplicated
Every color exists twice (dark/light) inside one giant object, and style props
are repeated across JSX. No CSS, no CSS variables. Theme changes mean editing
literals in two places.

### 6. Accessibility gaps
Quiz result ("Richtig!/Falsch!") is not announced (`aria-live`), answer buttons
have no descriptive labels, and the flashcard flip is click-only (no keyboard
affordance). The theme toggle is the only element with proper `aria-label`.

### 7. Smaller items
- **Score is not persisted** — only `theme` uses `localStorage`; quiz progress
  resets on refresh.
- **Biased shuffle** — `sort(() => Math.random() - 0.5)` is not a uniform
  shuffle; option positions are skewed.
- **No linter/formatter** — no ESLint or Prettier config.
- **Fonts load from Google CDN** — an external runtime dependency (privacy,
  offline, and a render-blocking request).
- **Dependency pinning is inconsistent** — everything is exact-pinned except
  `vitest` (`^4.1.10`).
- **No error boundary** — a render throw blanks the page.

---

## What to do better — prioritized

**Do first (cheap, high value)**
1. **Fix the stale docs.** Update `AGENTS.md` (tests exist now; logic/data moved
   to `numberUtils.js`; add the new files to the map) and correct the React/Vite
   versions in `README.md`.
2. **Document or drop `numbersReference.js`.** Add a header comment stating it's
   an intentional, hand-maintained oracle that must *not* be generated from
   `buildEntry` — or remove it and assert against inline expected values.

**Do next (structural, moderate effort)**
3. **Break up `App.jsx`.** Extract `FlashCard`, `Quiz`, and `NumberTable`
   components and move the `colors`/theme object into its own module. This
   unblocks everything below.
4. **Add component tests.** With the UI split out, add React Testing Library +
   jsdom tests for the quiz flow (correct/wrong scoring, mode switch, "next
   question"). The `forcedNum` hook already makes this deterministic.
5. **Persist quiz scores** in `localStorage`, mirroring the theme pattern.

**Polish (low effort each)**
6. **Accessibility pass:** `aria-live="polite"` on the result region,
   `aria-label` on answer buttons, keyboard support for the flashcard flip.
7. **Fix the shuffle** to Fisher–Yates for uniform option ordering.
8. **Add ESLint + Prettier** and run them in CI alongside tests.
9. **Self-host the fonts** (or add a system-font fallback stack) to drop the CDN
   dependency.
10. **Pin `vitest` exactly** to match the rest of the manifest.

---

## Would TypeScript help?

Modest but real payoff for a project this size, concentrated in a couple of
specific spots. Worth doing in the same pass as the component extraction, since
that already touches every file.

**Where it genuinely helps**
1. **One shared data shape.** `{ num, kanji, hiragana, romaji }` flows through
   `numberUtils.js`, `App.jsx`, and `numbersReference.js`. A single
   `NumberEntry` type catches the real structural gotcha: reference entries have
   **no `kanji` field**, so `refEntry.kanji` is silently `undefined` today — TS
   flags it at the call site.
2. **String-union state — the best ROI.** `quizMode` (`"zahl-romaji" |
   "romaji-zahl"`) is used as an object key in three places (`score[quizMode]`,
   `QUIZ_MODES` ids, render branches). A typo is a silent `undefined` →
   `undefined.correct` crash today; as a union it's a compile error with
   autocomplete. Same win for `filterGroup` and the `tab` index.
3. **Self-documenting signatures.** `getQuizQuestion(forcedNum?: number)`:
   `{ correct: NumberEntry, options: NumberEntry[] }` states the contract
   without reading the body.
4. **The `colors` theme object.** ~25 tokens referenced by name across hundreds
   of lines of JSX; `colors.accentGld` becomes a compile error.
5. **Editor leverage on the monolith** — rename/refactor/autocomplete, most
   valuable exactly when breaking up `App.jsx`.

**Where it would *not* help (be honest).** The one real historical bug —
`buildEntry` reading `split(...)[0]` instead of `[1]` (`ni-jū-shi` vs
`ni-jū-yon`) — is a data/string-content bug. TS can't see inside string values
and would have sailed right past it. That class of bug is caught by the
`numbersReference` test, not by types. **TS complements the test suite; it does
not replace it.**

**Cost is low.** `@types/react` / `@types/react-dom` are already in `devDeps`
and Vite compiles `.ts`/`.tsx` with zero config. Minimal path: add a
`tsconfig.json` (with `allowJs`), a shared `types.ts`, and convert
`numberUtils.js` + its test first; migrate the UI incrementally.

## Refactoring the translation logic for readability

The least readable code in the project is the reading-composition in
`buildEntry`: the pattern `split("／")[1]?.trim() ?? original` appears **four
times** with two different delimiters (`／` for hiragana, `" / "` for romaji).
Root cause: those strings encode *two facts in one field* — the standalone
reading **and** the combining reading — and `split` is a band-aid over that.
Three tiers, cheapest first.

**Tier 1 — Name the concept (immediate win, no data change).** Extract a
`combiningReading()` helper. The key simplification is `.at(-1)`: the combining
form is always the *last* listed reading, and for single-reading digits the last
*is* the whole string — so the `?? fallback` disappears too.

```js
// 4 and 7 read differently when combined into a larger number:
//   四 = "shi / yon"     → in compounds use "yon"  (四十 = yon-jū)
//   七 = "shichi / nana" → in compounds use "nana"
// The combining form is always the last listed reading.
const combiningReading = (reading, separator) => reading.split(separator).at(-1).trim();
```

`buildEntry` then reads top-to-bottom instead of decoding punctuation, and the
`tens === 1` branch can be dropped — every number 10–19 is already a hardcoded
exact match, so that branch is **unreachable** dead code in the generated path.
The exhaustive 0–100 test guards the change.

**Tier 2 — Fix the data model (the "right depth" version).** Tier 1 still parses
display strings. The deeper fix stores the combining reading *as data*, so
`buildEntry` never splits anything and the domain rule lives where the data does:

```js
{ num: 4, kanji: "四", hiragana: "し／よん", romaji: "shi / yon",
  combines: { hiragana: "よん", romaji: "yon" } },
{ num: 7, kanji: "七", hiragana: "しち／なな", romaji: "shichi / nana",
  combines: { hiragana: "なな", romaji: "nana" } },
// const combHira = e => e.combines?.hiragana ?? e.hiragana;
```

This removes the delimiter knowledge and the fragile "second element = combining
form" ordering assumption entirely, at the cost of a little more data.

**Tier 3 — Rename the terse locals.** `t`/`o`/`tHira`/`oHira`/`tRom`/`oRom` →
`tens`/`ones` entries with `.hiragana` etc. (Tier 1 already does most of this.)

**Recommendation:** Tier 1. It's a ~10-line change that kills all four cryptic
splits and the dead branch, guarded by the existing exhaustive test. Tier 2 is
the "correct" model but mostly philosophical for a dataset this small and stable
(the readings of 4 and 7 won't change) — reach for it only if more irregular
readings appear later.

## Improving test coverage (enough to be safe from regressions)

The goal here is regression safety, not a coverage number. Aim for a small set
of tests that would fail loudly if someone broke something real — no more.

**What's already safe — leave it alone.** `buildEntry` and `getQuizQuestion` are
well covered, and the exhaustive 0–100 comparison against `numbersReference` is
about as strong a regression guard as this logic can have. Resist piling on more
logic tests here; the return has already flattened.

**The actual gap: interaction logic in `App.jsx`.** Scoring, the double-click
guard, and the state resets have zero coverage — and that's exactly where a
silent regression (e.g. a wrong answer counted as correct) would slip through.

**Recommended additions — a handful of component tests, no more.** Add React
Testing Library + `jsdom` (set `test.environment: "jsdom"` in `vite.config.js`)
and cover only the behaviors a user would notice if they broke:

1. Correct answer → both `correct` and `total` increment; wrong answer → only
   `total` increments.
2. Double-click guard: answering a second time does not change the score
   (the `if (quizResult) return` in `handleAnswer`).
3. Switching quiz mode / pressing "next question" clears the previous result and
   selection.
4. Flashcard navigation wraps around (prev from 0 → 100, next from 100 → 0).

That's it. Four or five tests cover the interaction surface that matters.

**Deliberately out of scope (this is the "don't go crazy" part):**
- No snapshot tests — brittle against all the inline styles, low signal.
- No E2E / Playwright — the app is too small to justify the maintenance.
- No coverage-percentage gate — chasing a number invites low-value tests.

**Two bits of friction to plan for:**
- The quiz answer flow is gated behind the 3-second `setInterval` countdown, so
  interaction tests need `vi.useFakeTimers()` to advance past it.
- `getQuizQuestion` is random, so the UI can't currently be handed a known
  question. The `forcedNum` seam already exists in the function — exposing it one
  level up (or extracting the `Quiz` component so a fixed question can be passed
  in) makes these tests deterministic. This dovetails with the "break up
  `App.jsx`" recommendation above.

CI already runs `npm run test` before `build`, so once these exist they're
enforced on every push — no extra wiring needed.

---

## Bottom line

The fundamentals are sound and the recent testing/refactor work moved the
project in exactly the right direction. The highest-leverage next step is
**closing the doc/reality gap** (nearly free), followed by **breaking up the
monolith so the UI becomes testable**. Everything else is polish on an already
solid little app. 頑張って！
