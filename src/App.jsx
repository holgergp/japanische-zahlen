import { useState, useCallback, useEffect } from "react";
import { fullList, getQuizQuestion } from "./numberUtils.js";

const QUIZ_MODES = [
  { id: "zahl-romaji", label: "Zahl → Romaji" },
  { id: "romaji-zahl", label: "Romaji → Zahl" },
];

const TABS = ["Lernen", "Quiz", "Alle Zahlen"];

export default function App() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia?.("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = (e) => {
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

  const colors = {
    bg: isDark
      ? "linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)"
      : "linear-gradient(135deg, #f3edf8 0%, #e6f0fa 50%, #d8e5f2 100%)",
    textPrimary: isDark ? "#e8e0f0" : "#2a1e38",
    textSecondary: isDark ? "#a090c0" : "#5d4c78",
    textMuted: isDark ? "#7060a0" : "#80749e",
    accentGold: isDark ? "#e8c97e" : "#aa8010",
    accentPurple: isDark ? "#c8b0e8" : "#7b52ab",
    success: isDark ? "#64dc82" : "#22a048",
    error: isDark ? "#dc5050" : "#c92c2c",
    borderDefault: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
    cardBg: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.65)",
    cardBorder: isDark ? "rgba(232,201,126,0.25)" : "rgba(170,128,16,0.25)",
    tipBg: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.45)",
    tabBgActive: isDark ? "rgba(232,201,126,0.15)" : "rgba(170,128,16,0.12)",
    btnNavBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)",
    btnNavColor: isDark ? "#c0b0d8" : "#5d4c78",
    btnNavBorder: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
    btnToggleBg: isDark ? "rgba(232,201,126,0.1)" : "rgba(170,128,16,0.08)",
    quizAnswerBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)",
    quizCorrectBg: isDark ? "rgba(100,220,130,0.15)" : "rgba(34,160,72,0.12)",
    quizWrongBg: isDark ? "rgba(220,80,80,0.15)" : "rgba(201,44,44,0.1)",
  };

  const navBtnStyle = {
    padding: "9px 16px",
    borderRadius: 10,
    border: `1px solid ${colors.btnNavBorder}`,
    background: colors.btnNavBg,
    color: colors.btnNavColor,
    cursor: "pointer",
    fontSize: 13,
  };

  const [tab, setTab] = useState(0);
  const [flashIdx, setFlashIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizMode, setQuizMode] = useState("zahl-romaji");
  const [quiz, setQuiz] = useState(() => getQuizQuestion());
  const [quizResult, setQuizResult] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(() => {
    const defaultScore = {
      "zahl-romaji": { correct: 0, total: 0 },
      "romaji-zahl": { correct: 0, total: 0 },
    };
    try {
      const parsed = JSON.parse(localStorage.getItem("score"));
      if (parsed && parsed["zahl-romaji"] && parsed["romaji-zahl"])
        return parsed;
    } catch {
      // malformed JSON in localStorage → fall through to the default score
    }
    return defaultScore;
  });
  const [filterGroup, setFilterGroup] = useState("alle");

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

  const switchQuizMode = (mode) => {
    setQuizMode(mode);
    setQuiz(getQuizQuestion());
    setQuizResult(null);
    setSelected(null);
  };

  const handleAnswer = (opt) => {
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

  const card = fullList[flashIdx];

  const groups = [
    { label: "Alle", value: "alle" },
    { label: "0–10", value: "0-10" },
    { label: "11–19", value: "11-19" },
    { label: "20–99", value: "20-99" },
    { label: "Runde Zahlen", value: "round" },
  ];

  const filteredList = fullList.filter((n) => {
    if (filterGroup === "alle") return true;
    if (filterGroup === "0-10") return n.num <= 10;
    if (filterGroup === "11-19") return n.num >= 11 && n.num <= 19;
    if (filterGroup === "20-99") return n.num >= 20 && n.num <= 99;
    if (filterGroup === "round") return n.num % 10 === 0;
    return true;
  });

  return (
    <div
      className="app-root"
      style={{
        background: colors.bg,
        fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
        color: colors.textPrimary,
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "relative",
          textAlign: "center",
          padding: "16px 16px 8px",
          borderBottom: `1px solid ${colors.borderDefault}`,
          marginBottom: "8px",
          flexShrink: 0,
        }}
      >
        <button
          onClick={toggleTheme}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "transparent",
            border: "none",
            color: colors.textSecondary,
            fontSize: 20,
            cursor: "pointer",
            padding: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "background-color 0.2s",
          }}
          title={
            theme === "dark"
              ? "Helles Design aktivieren"
              : "Dunkles Design aktivieren"
          }
          aria-label={
            theme === "dark"
              ? "Helles Design aktivieren"
              : "Dunkles Design aktivieren"
          }
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <div
          style={{
            fontSize: 36,
            letterSpacing: 4,
            fontFamily: "'Shippori Mincho', serif",
            color: colors.accentGold,
            marginBottom: 4,
          }}
        >
          数字
        </div>
        <div
          style={{
            fontSize: 13,
            color: colors.textSecondary,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Japanische Zahlen · 0–100
        </div>
        <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>
          VHS Düsseldorf · Minna no Nihongo A1
        </div>
      </div>

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

      {/* ── LERNEN TAB ── */}
      {tab === 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 16px",
            flex: 1,
            overflow: "auto",
          }}
        >
          <div
            style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8 }}
          >
            {flashIdx + 1} / {fullList.length}
          </div>

          <div
            onClick={() => setShowAnswer((a) => !a)}
            style={{
              width: "100%",
              maxWidth: 340,
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: "24px 16px",
              boxShadow: isDark
                ? "0 8px 32px rgba(0,0,0,0.4)"
                : "0 8px 24px rgba(0,0,0,0.06)",
              userSelect: "none",
            }}
          >
            <div
              style={{
                fontSize: "clamp(56px, 18vw, 80px)",
                fontFamily: "'Shippori Mincho', serif",
                color: colors.accentGold,
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              {card.num}
            </div>
            <div
              style={{
                fontSize: "clamp(24px, 7vw, 32px)",
                fontFamily: "'Shippori Mincho', serif",
                color: colors.accentPurple,
                marginBottom: showAnswer ? 16 : 0,
              }}
            >
              {card.kanji}
            </div>
            {showAnswer ? (
              <div
                style={{
                  textAlign: "center",
                  borderTop: `1px solid ${colors.borderDefault}`,
                  paddingTop: 16,
                  width: "100%",
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    color: colors.textPrimary,
                    marginBottom: 6,
                  }}
                >
                  {card.hiragana}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    color: colors.textSecondary,
                    fontStyle: "italic",
                  }}
                >
                  {card.romaji}
                </div>
              </div>
            ) : (
              <div
                style={{ fontSize: 12, color: colors.textMuted, marginTop: 12 }}
              >
                Tippen zum Aufdecken
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            <button onClick={prevFlash} style={navBtnStyle}>
              ← Zurück
            </button>
            <button
              onClick={() => setShowAnswer((a) => !a)}
              style={{
                ...navBtnStyle,
                background: colors.btnToggleBg,
                borderColor: colors.cardBorder,
                color: colors.accentGold,
              }}
            >
              {showAnswer ? "Verstecken" : "Aufdecken"}
            </button>
            <button onClick={nextFlash} style={navBtnStyle}>
              Weiter →
            </button>
          </div>

          <div
            style={{
              maxWidth: 340,
              width: "100%",
              marginTop: 12,
              padding: "12px 16px",
              background: colors.tipBg,
              borderRadius: 12,
              borderLeft: `3px solid ${colors.accentGold}`,
              fontSize: 12,
              color: colors.textSecondary,
              lineHeight: 1.7,
            }}
          >
            <strong
              style={{
                color: colors.accentGold,
                display: "block",
                marginBottom: 4,
              }}
            >
              💡 Tipp: So funktionieren Zahlen auf Japanisch
            </strong>
            Zahlen werden aus Grundbausteinen zusammengesetzt:
            <br />
            <span style={{ color: colors.accentPurple }}>十 (jū)</span> = 10 ·{" "}
            <span style={{ color: colors.accentPurple }}>二十 (ni-jū)</span> =
            2×10 = 20
            <br />
            <span style={{ color: colors.accentPurple }}>
              二十三 (ni-jū-san)
            </span>{" "}
            = 20+3 = 23
          </div>
        </div>
      )}

      {/* ── QUIZ TAB ── */}
      {tab === 1 && (
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
              marginBottom: 8,
              background: colors.cardBg,
              borderRadius: 14,
              padding: 4,
              flexShrink: 0,
            }}
          >
            {QUIZ_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => switchQuizMode(m.id)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 10,
                  border: "none",
                  background:
                    quizMode === m.id ? colors.tabBgActive : "transparent",
                  color:
                    quizMode === m.id ? colors.accentGold : colors.textMuted,
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
                      onClick={() => handleAnswer(opt)}
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
                  onClick={nextQuiz}
                  style={{
                    ...navBtnStyle,
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
      )}

      {/* ── ALLE ZAHLEN TAB ── */}
      {tab === 2 && (
        <div
          style={{
            padding: "0 16px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: 12,
              flexShrink: 0,
            }}
          >
            {groups.map((g) => (
              <button
                key={g.value}
                onClick={() => setFilterGroup(g.value)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  border: "1px solid",
                  borderColor:
                    filterGroup === g.value
                      ? colors.accentGold
                      : colors.borderDefault,
                  background:
                    filterGroup === g.value
                      ? colors.tabBgActive
                      : "transparent",
                  color:
                    filterGroup === g.value
                      ? colors.accentGold
                      : colors.textMuted,
                  cursor: "pointer",
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
          <div
            style={{
              maxWidth: 500,
              margin: "0 auto",
              width: "100%",
              overflow: "auto",
              flex: 1,
            }}
          >
            {filteredList.map((n) => (
              <div
                key={n.num}
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 56px 1fr auto",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  borderBottom: `1px solid ${colors.borderDefault}`,
                }}
              >
                <span
                  style={{
                    color: colors.accentGold,
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  {n.num}
                </span>
                <span
                  style={{
                    fontFamily: "'Shippori Mincho', serif",
                    color: colors.accentPurple,
                    fontSize: 20,
                  }}
                >
                  {n.kanji}
                </span>
                <span style={{ color: colors.textPrimary, fontSize: 15 }}>
                  {n.hiragana}
                </span>
                <span
                  style={{
                    color: colors.textMuted,
                    fontSize: 12,
                    fontStyle: "italic",
                    textAlign: "right",
                  }}
                >
                  {n.romaji}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
