import { useState, useCallback, useEffect } from "react";
import { fullList, getQuizQuestion } from "./numberUtils";
import { buildColors } from "./theme";
import type {
  FilterGroup,
  NumberEntry,
  QuizMode,
  QuizQuestion,
  QuizResult,
  Score,
} from "./types";
import Header from "./components/Header";
import FlashCard from "./components/FlashCard";
import Quiz from "./components/Quiz";
import NumberTable from "./components/NumberTable";

const TABS = ["Lernen", "Quiz", "Alle Zahlen"];

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia?.("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "light" : "dark");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  const isDark = theme === "dark";
  const colors = buildColors(isDark);

  const [tab, setTab] = useState(0);
  const [flashIdx, setFlashIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizMode, setQuizMode] = useState<QuizMode>("zahl-romaji");
  const [quiz, setQuiz] = useState<QuizQuestion>(() => getQuizQuestion());
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState<Score>(() => {
    const defaultScore: Score = {
      "zahl-romaji": { correct: 0, total: 0 },
      "romaji-zahl": { correct: 0, total: 0 },
    };
    try {
      const parsed = JSON.parse(localStorage.getItem("score") ?? "null");
      if (parsed && parsed["zahl-romaji"] && parsed["romaji-zahl"])
        return parsed as Score;
    } catch {
      // malformed JSON in localStorage → fall through to the default score
    }
    return defaultScore;
  });
  const [filterGroup, setFilterGroup] = useState<FilterGroup>("alle");

  useEffect(() => {
    localStorage.setItem("score", JSON.stringify(score));
  }, [score]);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (tab === 1 && quizResult === null) {
      setCountdown(3);
      const id = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(id);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(id);
    }
  }, [tab, quiz, quizResult]);

  const nextFlash = useCallback(() => {
    setFlashIdx((i) => (i + 1) % fullList.length);
    setShowAnswer(false);
  }, []);

  const prevFlash = useCallback(() => {
    setFlashIdx((i) => (i - 1 + fullList.length) % fullList.length);
    setShowAnswer(false);
  }, []);

  const nextQuiz = useCallback(() => {
    setQuiz(getQuizQuestion());
    setQuizResult(null);
    setSelected(null);
  }, []);

  const switchQuizMode = (mode: QuizMode) => {
    setQuizMode(mode);
    setQuiz(getQuizQuestion());
    setQuizResult(null);
    setSelected(null);
  };

  const handleAnswer = (opt: NumberEntry) => {
    if (quizResult) return;
    setSelected(opt.num);
    const correct = opt.num === quiz.correct.num;
    setQuizResult(correct ? "correct" : "wrong");
    setScore((s) => ({
      ...s,
      [quizMode]: {
        correct: s[quizMode].correct + (correct ? 1 : 0),
        total: s[quizMode].total + 1,
      },
    }));
  };

  return (
    <div
      className="app-root"
      style={{
        background: colors.bg,
        fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
        color: colors.textPrimary,
      }}
    >
      <Header colors={colors} theme={theme} onToggleTheme={toggleTheme} />

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginBottom: 8,
          flexShrink: 0,
        }}
      >
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            style={{
              padding: "8px 18px",
              borderRadius: 24,
              border: "1px solid",
              borderColor: tab === i ? colors.accentGold : colors.borderDefault,
              background: tab === i ? colors.tabBgActive : "transparent",
              color: tab === i ? colors.accentGold : colors.textSecondary,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: tab === i ? 700 : 400,
              transition: "all 0.2s",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <FlashCard
          colors={colors}
          isDark={isDark}
          card={fullList[flashIdx]}
          index={flashIdx}
          total={fullList.length}
          showAnswer={showAnswer}
          onToggleAnswer={() => setShowAnswer((a) => !a)}
          onPrev={prevFlash}
          onNext={nextFlash}
        />
      )}

      {tab === 1 && (
        <Quiz
          colors={colors}
          isDark={isDark}
          quizMode={quizMode}
          quiz={quiz}
          quizResult={quizResult}
          selected={selected}
          score={score}
          countdown={countdown}
          onSwitchMode={switchQuizMode}
          onAnswer={handleAnswer}
          onNext={nextQuiz}
        />
      )}

      {tab === 2 && (
        <NumberTable
          colors={colors}
          filterGroup={filterGroup}
          onFilterChange={setFilterGroup}
        />
      )}
    </div>
  );
}
