import type {
  NumberEntry,
  QuizMode,
  QuizQuestion,
  QuizResult,
  Score,
} from "../types";
import { navButtonStyle, type Colors } from "../theme";

const QUIZ_MODES: { id: QuizMode; label: string }[] = [
  { id: "zahl-romaji", label: "Zahl → Romaji" },
  { id: "romaji-zahl", label: "Romaji → Zahl" },
];

const QUIZ_SCOPES: { id: "small" | "large"; label: string }[] = [
  { id: "small", label: "0–100" },
  { id: "large", label: "Große Zahlen" },
];

interface QuizProps {
  colors: Colors;
  isDark: boolean;
  quizMode: QuizMode;
  quizScope: "small" | "large";
  quiz: QuizQuestion;
  quizResult: QuizResult | null;
  selected: number | null;
  score: Score;
  countdown: number;
  onSwitchMode: (mode: QuizMode) => void;
  onSwitchScope: (scope: "small" | "large") => void;
  onAnswer: (opt: NumberEntry) => void;
  onNext: () => void;
}

export default function Quiz({
  colors,
  isDark,
  quizMode,
  quizScope,
  quiz,
  quizResult,
  selected,
  score,
  countdown,
  onSwitchMode,
  onSwitchScope,
  onAnswer,
  onNext,
}: QuizProps) {
  const navBtn = navButtonStyle(colors);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 16px",
        flex: 1,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 6,
          background: colors.cardBg,
          borderRadius: 14,
          padding: 4,
          flexShrink: 0,
        }}
      >
        {QUIZ_MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => onSwitchMode(m.id)}
            style={{
              padding: "7px 14px",
              borderRadius: 10,
              border: "none",
              background:
                quizMode === m.id ? colors.tabBgActive : "transparent",
              color: quizMode === m.id ? colors.accentGold : colors.textMuted,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: quizMode === m.id ? 700 : 400,
              transition: "all 0.2s",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 8,
          background: colors.cardBg,
          borderRadius: 14,
          padding: 4,
          flexShrink: 0,
        }}
      >
        {QUIZ_SCOPES.map((s) => (
          <button
            key={s.id}
            onClick={() => onSwitchScope(s.id)}
            style={{
              padding: "6px 14px",
              borderRadius: 10,
              border: "none",
              background:
                quizScope === s.id ? colors.tabBgActive : "transparent",
              color: quizScope === s.id ? colors.accentGold : colors.textMuted,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: quizScope === s.id ? 700 : 400,
              transition: "all 0.2s",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div
        style={{
          color: colors.textMuted,
          fontSize: 12,
          marginBottom: 8,
          flexShrink: 0,
        }}
      >
        ✓ {score[quizMode].correct} / {score[quizMode].total} richtig
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 340,
          padding: "16px",
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 20,
          textAlign: "center",
          marginBottom: 4,
          flexShrink: 0,
        }}
      >
        {quizMode === "zahl-romaji" ? (
          <>
            <div
              style={{
                fontSize: 11,
                color: colors.textMuted,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Wie lautet die Aussprache?
            </div>
            <div
              style={{
                fontSize: "clamp(56px, 18vw, 80px)",
                fontWeight: 700,
                color: colors.accentGold,
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {quiz.correct.num}
            </div>
            <div
              style={{
                fontSize: "clamp(20px, 6vw, 22px)",
                fontFamily: "'Shippori Mincho', serif",
                color: colors.accentPurple,
              }}
            >
              {quiz.correct.kanji}
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: 11,
                color: colors.textMuted,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Welche Zahl ist das?
            </div>
            <div
              style={{
                fontSize: "clamp(24px, 7vw, 32px)",
                fontWeight: 700,
                color: colors.accentGold,
                letterSpacing: 1,
                marginBottom: 4,
              }}
            >
              {quiz.correct.romaji}
            </div>
            <div
              style={{
                fontSize: "clamp(16px, 5vw, 18px)",
                color: colors.accentPurple,
              }}
            >
              {quiz.correct.hiragana}
            </div>
          </>
        )}
      </div>

      {/* Answer / Countdown / Result area */}
      <div style={{ width: "100%", maxWidth: 340, marginTop: 4 }}>
        {countdown > 0 && !quizResult ? (
          <div
            style={{
              padding: "20px",
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 20,
              textAlign: "center",
              color: colors.textSecondary,
              fontSize: 14,
            }}
          >
            Antworten werden in{" "}
            <span style={{ color: colors.accentGold, fontWeight: 700 }}>
              {countdown}
            </span>{" "}
            {countdown === 1 ? "Sekunde" : "Sekunden"} angezeigt…
          </div>
        ) : !quizResult ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              width: "100%",
            }}
          >
            {quiz.options.map((opt) => {
              let bg = colors.quizAnswerBg;
              let border = colors.borderDefault;
              let col = colors.textPrimary;
              let subCol = colors.textMuted;
              if (selected !== null) {
                if (opt.num === quiz.correct.num) {
                  bg = colors.quizCorrectBg;
                  border = colors.success;
                  col = colors.success;
                  subCol = isDark ? "#4aac62" : "#22a048";
                } else if (opt.num === selected) {
                  bg = colors.quizWrongBg;
                  border = colors.error;
                  col = colors.error;
                  subCol = isDark ? "#a03030" : "#c92c2c";
                }
              }
              return (
                <button
                  key={opt.num}
                  onClick={() => onAnswer(opt)}
                  style={{
                    padding:
                      quizMode === "zahl-romaji" ? "8px 4px" : "12px 4px",
                    borderRadius: 12,
                    border: `1px solid ${border}`,
                    background: bg,
                    color: col,
                    fontSize:
                      quizMode === "zahl-romaji"
                        ? "clamp(14px, 3.8vw, 17px)"
                        : 28,
                    fontWeight: quizMode === "zahl-romaji" ? 600 : 700,
                    cursor: quizResult ? "default" : "pointer",
                    transition: "all 0.2s",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    lineHeight: 1.3,
                  }}
                >
                  {quizMode === "zahl-romaji" ? (
                    <>
                      <span>{opt.romaji}</span>
                      <span
                        style={{
                          fontSize: 10,
                          color: subCol,
                          fontWeight: 400,
                        }}
                      >
                        {opt.hiragana}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>{opt.num}</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: "'Shippori Mincho', serif",
                          color: subCol,
                          fontWeight: 400,
                        }}
                      >
                        {opt.kanji}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>
              {quizResult === "correct" ? "✅ Richtig!" : "❌ Falsch!"}
            </div>
            {quizResult === "wrong" && (
              <div
                style={{
                  color: colors.textSecondary,
                  fontSize: 13,
                  marginBottom: 10,
                }}
              >
                Richtig war:{" "}
                <span style={{ color: colors.accentGold }}>
                  {quiz.correct.num}
                </span>
                {" · "}
                <span style={{ color: colors.accentPurple }}>
                  {quiz.correct.romaji}
                </span>
                {" · "}
                <span style={{ color: colors.textSecondary }}>
                  {quiz.correct.hiragana}
                </span>
              </div>
            )}
            <button
              onClick={onNext}
              style={{
                ...navBtn,
                background: colors.btnToggleBg,
                borderColor: colors.cardBorder,
                color: colors.accentGold,
                padding: "10px 28px",
              }}
            >
              Nächste Frage →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
