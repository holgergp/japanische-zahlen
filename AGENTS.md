# Project Context: japanische-zahlen

> Last updated: 2026-05-10
> Purpose: Quick onboarding for AI agents working on this codebase.

---

## 1. Project at a Glance

| | |
|---|---|
| **Name** | 数字 – Japanische Zahlen lernen |
| **What** | Interactive flashcard & quiz app for Japanese numbers 0–100 |
| **Audience** | German-speaking students (VHS Düsseldorf, Minna no Nihongo A1.1.1) |
| **Live URL** | https://holgergp.github.io/japanische-zahlen/ |
| **Language** | UI in German; content in Japanese (Kanji, Hiragana, Romaji) |

---

## 2. Tech Stack

- **Framework**: React 19 (no routing, single-page)
- **Bundler**: Vite 8
- **Language**: Mixed migration to TypeScript. Pure logic/data (`numberUtils.ts`, `types.ts`) is TS and type-checked (`npm run typecheck`); the UI (`App.jsx`, `main.jsx`) is still JSX, compiled via `allowJs`. New UI components should be authored in `.tsx`.
- **Styling**: Inline `style` objects inside JSX only. No CSS files, no CSS-in-JS library, no external UI framework.
- **Fonts**: Google Fonts via `<link>` in `index.html` — `Noto Sans JP` (body), `Shippori Mincho` (Japanese characters, headings)
- **State**: React `useState` + `useCallback`. No Context, no external store.
- **Tests**: vitest suite (`npm run test`). File: `src/numberUtils.test.js`. Includes an exhaustive 0–100 check against `src/numbersReference.js`. Must pass before merging any logic change.
- **Lint/Format**: ESLint flat config (`npm run lint`) + Prettier (`npm run format` / `format:check`). TypeScript type-check via `npm run typecheck`. All run in CI on every PR.
- **Deployment**: GitHub Actions → GitHub Pages. Trigger: push to `main`.

---

## 3. File Map

```
src/
├── main.jsx                # React root render. Do not touch unless changing entry point.
├── App.jsx                 # All UI and state. No number logic or data here.
├── numberUtils.ts          # Number data (numbers array), buildEntry, fullList, getQuizQuestion.
├── types.ts                # Shared types: NumberEntry, QuizMode, FilterGroup, QuizQuestion.
├── numbersReference.js     # Hand-maintained independent oracle for 0–100; used only in tests.
└── numberUtils.test.js     # vitest suite — exhaustive 0–100 comparison + quiz generation tests.

public/
└── favicon.svg       # Static asset

index.html            # HTML shell. Fonts loaded here. Lang="de". Base path handled by Vite config.
vite.config.js        # Vite config. base: '/japanische-zahlen/' (or BASE_PATH env var)
package.json          # Scripts: dev, build, preview, test, typecheck, lint, format
tsconfig.json         # TypeScript config (allowJs; strict; noEmit — Vite does the transpile)
.github/workflows/
├── ci.yml            # PR checks: typecheck, lint, format:check, test, build
└── deploy.yml        # CD for GitHub Pages (push to main)
```

---

## 4. Architecture

This is a **single-file monolithic React app**. All UI state and JSX live in `App.jsx`. Number logic and data live in `src/numberUtils.ts`.

### State Shape

```js
const [tab, setTab] = useState(0);                    // 0=Lernen, 1=Quiz, 2=Alle Zahlen
const [flashIdx, setFlashIdx] = useState(0);        // Current flashcard index (0-100)
const [showAnswer, setShowAnswer] = useState(false); // Flashcard flip state
const [quizMode, setQuizMode] = useState("zahl-romaji"); // or "romaji-zahl"
const [quiz, setQuiz] = useState(() => getQuizQuestion()); // Current question + options
const [quizResult, setQuizResult] = useState(null);  // "correct" | "wrong" | null
const [selected, setSelected] = useState(null);      // Selected option num (for styling)
const [score, setScore] = useState({
  "zahl-romaji": { correct: 0, total: 0 },
  "romaji-zahl": { correct: 0, total: 0 },
});
const [filterGroup, setFilterGroup] = useState("alle"); // For "Alle Zahlen" tab
```

### Data Model

```js
// Hardcoded base numbers (0-20, 30, 40, ..., 100)
const numbers = [
  { num: 0, kanji: "零", hiragana: "れい", romaji: "rei" },
  // ... special dual readings for 4 (shi/yon) and 7 (shichi/nana)
];

// Dynamically generated for 21-99
const fullList = Array.from({ length: 101 }, (_, i) => buildEntry(i));
```

**Key insight**: Numbers 21-99 are algorithmically composed from tens + ones. `buildEntry()` handles the Japanese reading rules (e.g., 四 uses `yon` when combined: 四十 = `yon-jū`, not `shi-jū`).

### Component Structure (all inline in App.jsx)

There are no separate component files. Everything is rendered via conditional JSX:

- **Header** — Title, subtitle, course info
- **Tab Bar** — 3 tabs: "Lernen", "Quiz", "Alle Zahlen"
- **Tab 0: Lernen** — Flashcard (click to flip) + prev/next buttons + progress counter + tip box
- **Tab 1: Quiz** — Mode switcher + score display + question card + 4 answer buttons (layout varies by mode) + result feedback
- **Tab 2: Alle Zahlen** — Filter chips + grid list (num, kanji, hiragana, romaji)

---

## 5. Key Logic & Algorithms

### `buildEntry(i)` — Number composition

Location: `src/numberUtils.ts`

Logic:
1. Check if `i` exists in hardcoded `numbers` array → return exact match
2. Split into `tens` and `ones`
3. For tens: if tens === 1, use "十/jū"; else use base reading + "十/jū"
4. For ones: if ones > 0, append base reading
5. **CRITICAL**: For 4 and 7, use the COMBINATION reading (second option):
   - 四 = `shi / yon` → in compounds use `yon` (e.g., 四十 = `yon-jū`)
   - 七 = `shichi / nana` → in compounds use `nana` (e.g., 七十 = `nana-jū`)
   - This is handled by splitting on `／` (fullwidth slash) for hiragana and ` / ` (space-slash-space) for romaji

### `getQuizQuestion()` — Quiz generation

Location: `src/numberUtils.ts`

Logic:
1. Pick random index from `fullList`
2. Select 3 distractors (different num, no duplicates)
3. Combine + shuffle
4. Return `{ correct, options }`

### `handleAnswer(opt)` — Answer validation

Location: `src/App.jsx`

- If `quizResult` already set → ignore (prevents double-clicking)
- Set `selected` to clicked option's `num`
- Compare `opt.num === quiz.correct.num`
- Update score for current mode
- Set `quizResult` to "correct" or "wrong"

---

## 6. Styling Conventions

### Color Palette (DARK THEME)

| Token | Value | Usage |
|---|---|---|
| Background | `linear-gradient(135deg, #1a0a2e, #16213e, #0f3460)` | Page bg |
| Text primary | `#e8e0f0` | Main text |
| Text secondary | `#a090c0` | Labels, subtitles |
| Text muted | `#7060a0` | Hints, metadata |
| Accent gold | `#e8c97e` | Numbers, active states, highlights |
| Accent purple | `#c8b0e8` | Kanji, secondary highlights |
| Success | `#64dc82` | Correct answers |
| Error | `#dc5050` | Wrong answers |

### Patterns

- **Cards**: `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(232,201,126,0.2)`, `borderRadius: 20`, `boxShadow: 0 8px 32px rgba(0,0,0,0.4)`
- **Buttons**: Pill-shaped (`borderRadius: 24` for tabs, `10-12` for actions)
- **Typography**: Japanese characters always use `'Shippori Mincho', serif`

---

## 7. Important Decisions & Constraints

1. **Single File**: Everything lives in `App.jsx`. If asked to add features, prefer extracting to new component files only if explicitly requested or if the file grows >600 lines.
2. **No External Dependencies**: Only React + Vite. Do NOT install UI libraries (MUI, Chakra, etc.) or state management (Redux, Zustand). Vanilla React only.
3. **No CSS Files**: All styles are inline `style` props. If adding new UI, follow this pattern.
4. **German UI**: All user-facing text must remain in German.
5. **Dual Readings**: 4 and 7 have two readings. The algorithm correctly prefers the compound reading for tens place.
6. **Deployment Path**: The app lives at `/japanische-zahlen/`. The Vite `base` config handles this. Do not change unless the deployment URL changes.

---

## 8. Common Tasks & How-To

### Add a new tab
1. Add label to `TABS` array (`App.jsx:78`)
2. Add conditional render block `{tab === 3 && (...)}`
3. Add any new state above the render

### Add quiz modes
1. Add entry to `QUIZ_MODES` array (`App.jsx:73`)
2. Add initial score shape in `useState` (`App.jsx:98`)
3. Add conditional rendering logic in Quiz tab

### Modify number data
- Edit `numbers` array at top of `App.jsx`
- Verify `buildEntry` handles edge cases (especially dual readings with `／` and ` / ` delimiters)

### Add styling changes
- Prefer editing inline styles directly in JSX
- Keep the dark theme color palette consistent

---

## 9. Known Issues / Tech Debt

- **Monolithic component**: `App.jsx` handles all UI. Refactoring into smaller components would improve maintainability but is not required for small changes.
- **No accessibility**: Missing ARIA labels, focus management, screen reader support.
- **Font dependency**: Relies on external Google Fonts CDN.

---

## 10. Deployment Checklist

Before pushing to `main`:
- [ ] `npm run build` succeeds locally
- [ ] `npm run preview` looks correct
- [ ] GitHub repo Settings → Pages → Source = GitHub Actions
- [ ] Live URL: https://holgergp.github.io/japanische-zahlen/

---

## 11. Quick Commands

```bash
npm run dev           # Start dev server (http://localhost:5173)
npm run test          # Run vitest suite (must pass before merging)
npm run typecheck     # TypeScript type-check (tsc --noEmit)
npm run lint          # ESLint (flat config, react-hooks rules)
npm run format        # Prettier: format code in place
npm run format:check  # Prettier: verify formatting (used in CI)
npm run build         # Production build → dist/
npm run preview       # Preview production build
```

---

*Ganbatte! 頑張って！*
