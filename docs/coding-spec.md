# Coding Specification — japanische-zahlen (implementation handoff)

> Audience: an implementing model/developer executing pre-scoped changes.
> Companion to `docs/project-review.md` (the *why*); this doc is the *what/how*.
> Every task here is low-ambiguity and test-guarded. Judgment-heavy work is
> listed under "Deferred — not in this handoff" and must NOT be attempted.

---

## 0. Project facts

- React 19 + Vite 8 single-page app. Plain JSX (no TypeScript). No router.
- UI text is **German**; content is Japanese (Kanji / Hiragana / Romaji).
- Number logic + data: `src/numberUtils.js`. Independent test oracle:
  `src/numbersReference.js`. Tests: `src/numberUtils.test.js` (vitest).
- UI (all of it): `src/App.jsx`.
- Deploys to GitHub Pages at base path `/japanische-zahlen/`.

## 1. Ground rules (do not violate)

1. **Run `npm run test` after every task. All tests must pass.** The exhaustive
   0–100 test in `numberUtils.test.js` is the safety net — if it goes red, you
   changed number output; revert until it's green.
2. **Do not add runtime dependencies.** Only React is allowed at runtime. Dev
   dependencies may be added **only** where a task explicitly lists them.
3. **Do not regenerate `src/numbersReference.js` from `buildEntry`.** It is a
   hand-maintained independent oracle. Editing it to "match" generated output
   defeats its purpose. Leave it untouched unless a task says otherwise.
4. **Keep all user-facing strings in German.** Do not translate or reword UI copy.
5. **Do not touch** `vite.config.js` `base`, `.github/workflows/deploy.yml`
   deploy steps, or `index.html` unless a task explicitly says so.
6. **One task = one commit/PR.** Do not bundle unrelated tasks.
7. **Preserve behavior unless a task explicitly changes it.** Refactor tasks must
   produce byte-identical output for the affected functions.

## 2. Verification baseline

Before starting and after each task, all three must succeed:

```bash
npm ci
npm run test
npm run build
```

---

## 3. Safe batch — Tasks 1–4 (do in order; each independent and shippable)

> This is the bulletproof batch: zero-risk docs, two behavior-preserving changes
> guarded by the exhaustive test, and one isolated localStorage addition. The
> interaction tests are pulled out into Section 4 as a separate follow-up.

### Task 1 — Fix stale documentation (no code change)

**Files:** `AGENTS.md`, `README.md`

**Steps:**
- `AGENTS.md`:
  - Replace "**Tests**: None…" with a line noting a vitest suite exists
    (`npm run test`, file `src/numberUtils.test.js`, incl. an exhaustive 0–100
    check against `numbersReference.js`).
  - Update the file map to add `src/numberUtils.js`, `src/numbersReference.js`,
    `src/numberUtils.test.js`.
  - Update text that says `App.jsx` holds "all logic and data" to note number
    logic/data now live in `src/numberUtils.js`.
- `README.md` → "Technik" section: change "React 18" → "React 19" and
  "Vite 5" → "Vite 8".

**Acceptance:** `grep -rn "React 18\|Vite 5\|Tests.*None" README.md AGENTS.md`
returns nothing; `AGENTS.md` file map lists the three files above.

---

### Task 2 — Readability refactor of `buildEntry` (behavior-preserving)

**File:** `src/numberUtils.js`

**Goal:** Replace the four cryptic `split(sep)[1]?.trim() ?? original`
expressions with one named helper. **Output must not change.**

**Replace the current `buildEntry` with exactly:**

```js
// 4 and 7 read differently when combined into a larger number:
//   四 = "shi / yon"     → in compounds use "yon"  (四十 = yon-jū)
//   七 = "shichi / nana" → in compounds use "nana"
// The combining form is always the LAST listed reading.
const combiningReading = (reading, separator) => reading.split(separator).at(-1).trim();

export function buildEntry(i) {
  const exact = numbers.find(n => n.num === i);
  if (exact) return exact;

  const tens = numbers.find(n => n.num === Math.floor(i / 10));
  const ones = numbers.find(n => n.num === i % 10);
  const hasOnes = i % 10 > 0;

  const kanji    = tens.kanji + "十" + (hasOnes ? ones.kanji : "");
  const hiragana = combiningReading(tens.hiragana, "／") + "じゅう"
                 + (hasOnes ? combiningReading(ones.hiragana, "／") : "");
  const romaji   = combiningReading(tens.romaji, " / ") + "-jū"
                 + (hasOnes ? "-" + combiningReading(ones.romaji, " / ") : "");

  return { num: i, kanji, hiragana, romaji };
}
```

**Do not** change the `numbers` array or `numbersReference.js`.

**Acceptance:** `npm run test` passes with the test files **unchanged**; the
string `?? ` no longer appears in `buildEntry`; `.split(` appears only inside
`combiningReading`.

---

### Task 3 — Uniform option shuffle (fix biased sort)

**File:** `src/numberUtils.js`, function `getQuizQuestion`

**Goal:** Replace `.sort(() => Math.random() - 0.5)` (not a uniform shuffle) with
a Fisher–Yates shuffle. Output shape is unchanged (4 unique options incl. the
correct answer).

**Replace the line**
`const options = [...distractors, correct].sort(() => Math.random() - 0.5);`
**with:**

```js
const options = [...distractors, correct];
for (let k = options.length - 1; k > 0; k--) {
  const j = Math.floor(Math.random() * (k + 1));
  [options[k], options[j]] = [options[j], options[k]];
}
```

**Acceptance:** `npm run test` passes (the existing quiz tests already assert 4
unique options containing the correct answer).

---

### Task 4 — Persist quiz score across reloads

**File:** `src/App.jsx`

**Goal:** Scores survive a page refresh, mirroring the existing `theme`
localStorage pattern. Do not change the score object shape.

**Steps:**
- Change the `score` `useState` initializer to read from `localStorage` key
  `"score"`, parsing JSON, and **falling back to the current default object** on
  missing/invalid/malformed data (wrap `JSON.parse` in try/catch; if the parsed
  value is not an object with both `"zahl-romaji"` and `"romaji-zahl"` keys, use
  the default).
- Add a `useEffect` that runs whenever `score` changes and writes
  `localStorage.setItem("score", JSON.stringify(score))`.

**Do not** persist any other state (theme is already handled; leave quiz/tab
state ephemeral).

**Acceptance:** Manual — answer a question, refresh, score is retained. Corrupt
the value (`localStorage.setItem("score","x")`) and reload: app renders with a
zeroed score, no crash. `npm run test` and `npm run build` still pass.

---

## 4. Follow-up batch — interaction tests (do only after Tasks 1–4 are merged)

> Pulled out of the safe batch: this is the one medium-difficulty item (async
> fake timers + reading state from the DOM rather than a fixed value). Land Tasks
> 1–4 first, then do this on its own PR. If any step below is unclear, stop and
> flag rather than guessing.

### Interaction tests for the quiz (regression safety)

**Files:** add `src/App.test.jsx`; edit `vite.config.js`; add dev deps.

**Dev deps (add to `devDependencies` only):** `@testing-library/react`,
`@testing-library/jest-dom`, `jsdom`.

**`vite.config.js`:** add a `test` block: `test: { environment: "jsdom" }`
(keep the existing `plugins`/`base`).

**Determinism note:** `getQuizQuestion` is random and the answer grid is gated
behind a 3-second countdown. In each test: use `vi.useFakeTimers()`, render
`<App/>`, switch to the Quiz tab, advance timers by 3s to reveal the options,
then **read the displayed correct value from the DOM** and click the matching
option button (do not assume a fixed number). Do NOT stub `Math.random` to a
constant — the distractor loop can spin if random never varies.

**Write exactly these tests (no snapshots, no extra cases):**
1. Correct answer increments both `correct` and `total` in the score line
   (`✓ 1 / 1 richtig`).
2. Wrong answer increments only `total` (`✓ 0 / 1 richtig`).
3. Clicking again after answering does not change the score (double-click guard).
4. Pressing "Nächste Frage →" clears the result view (options are shown again).
5. Flashcard "← Zurück" from the first card wraps to `100 / 101`.

**Acceptance:** `npm run test` runs the new file; all tests pass; test count
increases by 5. No change to production behavior.

---

## 5. Deferred — NOT in this handoff

Do not attempt these; they need design judgment and are tracked in
`docs/project-review.md`:

- TypeScript migration.
- Breaking `App.jsx` into components / extracting the `colors` theme.
- Data-model refactor of readings ("Tier 2" in the review).
- Accessibility overhaul, self-hosting fonts, ESLint/Prettier setup.

If a task above seems to require one of these, stop and flag it rather than
expanding scope.
