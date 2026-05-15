import { useState, useCallback, useEffect } from "react";

const numbers = [
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
  { num: 14, kanji: "十四", hiragana: "じゅうし／じゅうよん", romaji: "jū-shi / jū-yon" },
  { num: 15, kanji: "十五", hiragana: "じゅうご", romaji: "jū-go" },
  { num: 16, kanji: "十六", hiragana: "じゅうろく", romaji: "jū-roku" },
  { num: 17, kanji: "十七", hiragana: "じゅうしち／じゅうなな", romaji: "jū-shichi / jū-nana" },
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

function buildEntry(i) {
  const exact = numbers.find(n => n.num === i);
  if (exact) return exact;
  const tens = Math.floor(i / 10);
  const ones = i % 10;
  const t = numbers.find(n => n.num === tens);
  const o = numbers.find(n => n.num === ones);

  const tKanji = tens === 1 ? "十" : t.kanji + "十";
  const kanji = tKanji + (ones > 0 ? o.kanji : "");

  const tHira = tens === 1 ? "じゅう" : (t.hiragana.split("／")[1]?.trim() ?? t.hiragana) + "じゅう";
  const oHira = ones > 0 ? (o.hiragana.split("／")[1]?.trim() ?? o.hiragana) : "";
  const hiragana = tHira + oHira;

  const tRom = tens === 1 ? "jū" : (t.romaji.split(" / ")[1]?.trim() ?? t.romaji) + "-jū";
  const oRom = ones > 0 ? (o.romaji.split(" / ")[0]?.trim() ?? o.romaji) : "";
  const romaji = tRom + (ones > 0 ? "-" + oRom : "");

  return { num: i, kanji, hiragana, romaji };
}

const fullList = Array.from({ length: 101 }, (_, i) => buildEntry(i));

function getQuizQuestion() {
  const idx = Math.floor(Math.random() * fullList.length);
  const correct = fullList[idx];
  const distractors = [];
  while (distractors.length < 3) {
    const d = fullList[Math.floor(Math.random() * fullList.length)];
    if (d.num !== correct.num && !distractors.find(x => x.num === d.num)) {
      distractors.push(d);
    }
  }
  const options = [...distractors, correct].sort(() => Math.random() - 0.5);
  return { correct, options };
}

const QUIZ_MODES = [
  { id: "zahl-romaji", label: "Zahl → Romaji" },
  { id: "romaji-zahl", label: "Romaji → Zahl" },
];

const TABS = ["Lernen", "Quiz", "Alle Zahlen"];

const navBtn = {
  padding: "9px 16px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.05)",
  color: "#c0b0d8",
  cursor: "pointer",
  fontSize: 13,
};

export default function App() {
  const [tab, setTab] = useState(0);
  const [flashIdx, setFlashIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizMode, setQuizMode] = useState("zahl-romaji");
  const [quiz, setQuiz] = useState(() => getQuizQuestion());
  const [quizResult, setQuizResult] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState({
    "zahl-romaji": { correct: 0, total: 0 },
    "romaji-zahl": { correct: 0, total: 0 },
  });
  const [filterGroup, setFilterGroup] = useState("alle");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (quizResult === null) {
      setCountdown(3);
      const id = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(id);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(id);
    }
  }, [quiz, quizResult]);

  const nextFlash = useCallback(() => {
    setFlashIdx(i => (i + 1) % fullList.length);
    setShowAnswer(false);
  }, []);

  const prevFlash = useCallback(() => {
    setFlashIdx(i => (i - 1 + fullList.length) % fullList.length);
    setShowAnswer(false);
  }, []);

  const nextQuiz = useCallback(() => {
    setQuiz(getQuizQuestion());
    setQuizResult(null);
    setSelected(null);
    setCountdown(3);
  }, []);

  const switchQuizMode = (mode) => {
    setQuizMode(mode);
    setQuiz(getQuizQuestion());
    setQuizResult(null);
    setSelected(null);
    setCountdown(3);
  };

  const handleAnswer = (opt) => {
    if (quizResult) return;
    setSelected(opt.num);
    const correct = opt.num === quiz.correct.num;
    setQuizResult(correct ? "correct" : "wrong");
    setScore(s => ({
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

  const filteredList = fullList.filter(n => {
    if (filterGroup === "alle") return true;
    if (filterGroup === "0-10") return n.num <= 10;
    if (filterGroup === "11-19") return n.num >= 11 && n.num <= 19;
    if (filterGroup === "20-99") return n.num >= 20 && n.num <= 99;
    if (filterGroup === "round") return n.num % 10 === 0;
    return true;
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)",
      fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
      color: "#e8e0f0",
      padding: "0 0 40px",
    }}>
      {/* Header */}
      <div style={{
        textAlign: "center",
        padding: "32px 16px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        marginBottom: "24px",
      }}>
        <div style={{ fontSize: 36, letterSpacing: 4, fontFamily: "'Shippori Mincho', serif", color: "#e8c97e", marginBottom: 4 }}>数字</div>
        <div style={{ fontSize: 13, color: "#a090c0", letterSpacing: 2, textTransform: "uppercase" }}>Japanische Zahlen · 0–100</div>
        <div style={{ fontSize: 11, color: "#7060a0", marginTop: 4 }}>VHS Düsseldorf · Minna no Nihongo A1</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            padding: "8px 18px",
            borderRadius: 24,
            border: "1px solid",
            borderColor: tab === i ? "#e8c97e" : "rgba(255,255,255,0.15)",
            background: tab === i ? "rgba(232,201,126,0.15)" : "transparent",
            color: tab === i ? "#e8c97e" : "#a090c0",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: tab === i ? 700 : 400,
            transition: "all 0.2s",
          }}>{t}</button>
        ))}
      </div>

      {/* ── LERNEN TAB ── */}
      {tab === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px" }}>
          <div style={{ color: "#7060a0", fontSize: 12, marginBottom: 16 }}>{flashIdx + 1} / {fullList.length}</div>

          <div
            onClick={() => setShowAnswer(a => !a)}
            style={{
              width: "100%",
              maxWidth: 340,
              minHeight: 220,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(232,201,126,0.25)",
              borderRadius: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 32,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              userSelect: "none",
            }}
          >
            <div style={{ fontSize: 80, fontFamily: "'Shippori Mincho', serif", color: "#e8c97e", lineHeight: 1, marginBottom: 8 }}>
              {card.num}
            </div>
            <div style={{ fontSize: 32, fontFamily: "'Shippori Mincho', serif", color: "#c8b0e8", marginBottom: showAnswer ? 16 : 0 }}>
              {card.kanji}
            </div>
            {showAnswer ? (
              <div style={{ textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16, width: "100%" }}>
                <div style={{ fontSize: 22, color: "#e8e0f0", marginBottom: 6 }}>{card.hiragana}</div>
                <div style={{ fontSize: 15, color: "#a090c0", fontStyle: "italic" }}>{card.romaji}</div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "#5050a0", marginTop: 12 }}>Tippen zum Aufdecken</div>
            )}
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
            <button onClick={prevFlash} style={navBtn}>← Zurück</button>
            <button onClick={() => setShowAnswer(a => !a)} style={{ ...navBtn, background: "rgba(232,201,126,0.1)", borderColor: "rgba(232,201,126,0.4)", color: "#e8c97e" }}>
              {showAnswer ? "Verstecken" : "Aufdecken"}
            </button>
            <button onClick={nextFlash} style={navBtn}>Weiter →</button>
          </div>

          <div style={{ maxWidth: 340, marginTop: 28, padding: "16px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 12, borderLeft: "3px solid #e8c97e", fontSize: 12, color: "#9080b0", lineHeight: 1.7 }}>
            <strong style={{ color: "#e8c97e", display: "block", marginBottom: 4 }}>💡 Tipp: So funktionieren Zahlen auf Japanisch</strong>
            Zahlen werden aus Grundbausteinen zusammengesetzt:<br />
            <span style={{ color: "#c8b0e8" }}>十 (jū)</span> = 10 · <span style={{ color: "#c8b0e8" }}>二十 (ni-jū)</span> = 2×10 = 20<br />
            <span style={{ color: "#c8b0e8" }}>二十三 (ni-jū-san)</span> = 20+3 = 23
          </div>
        </div>
      )}

      {/* ── QUIZ TAB ── */}
      {tab === 1 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 4 }}>
            {QUIZ_MODES.map(m => (
              <button key={m.id} onClick={() => switchQuizMode(m.id)} style={{
                padding: "7px 14px",
                borderRadius: 10,
                border: "none",
                background: quizMode === m.id ? "rgba(232,201,126,0.2)" : "transparent",
                color: quizMode === m.id ? "#e8c97e" : "#7060a0",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: quizMode === m.id ? 700 : 400,
                transition: "all 0.2s",
              }}>{m.label}</button>
            ))}
          </div>

          <div style={{ color: "#7060a0", fontSize: 12, marginBottom: 20 }}>
            ✓ {score[quizMode].correct} / {score[quizMode].total} richtig
          </div>

          <div style={{
            width: "100%", maxWidth: 340,
            padding: "28px 24px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(232,201,126,0.2)",
            borderRadius: 20,
            textAlign: "center",
            marginBottom: 20,
          }}>
            {quizMode === "zahl-romaji" ? (
              <>
                <div style={{ fontSize: 11, color: "#7060a0", marginBottom: 16, textTransform: "uppercase", letterSpacing: 2 }}>
                  Wie lautet die Aussprache?
                </div>
                <div style={{ fontSize: 80, fontWeight: 700, color: "#e8c97e", lineHeight: 1, marginBottom: 4 }}>
                  {quiz.correct.num}
                </div>
                <div style={{ fontSize: 22, fontFamily: "'Shippori Mincho', serif", color: "#c8b0e8" }}>
                  {quiz.correct.kanji}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 11, color: "#7060a0", marginBottom: 16, textTransform: "uppercase", letterSpacing: 2 }}>
                  Welche Zahl ist das?
                </div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#e8c97e", letterSpacing: 1, marginBottom: 4 }}>
                  {quiz.correct.romaji}
                </div>
                <div style={{ fontSize: 18, color: "#c8b0e8" }}>
                  {quiz.correct.hiragana}
                </div>
              </>
            )}
          </div>

          {countdown > 0 && !quizResult ? (
            <div style={{
              width: "100%", maxWidth: 340,
              padding: "24px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(232,201,126,0.2)",
              borderRadius: 20,
              textAlign: "center",
              color: "#a090c0",
              fontSize: 14,
            }}>
              Antworten werden in <span style={{ color: "#e8c97e", fontWeight: 700 }}>{countdown}</span> Sekunden angezeigt…
            </div>
          ) : (
            quizMode === "zahl-romaji" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 340 }}>
                {quiz.options.map(opt => {
                  let bg = "rgba(255,255,255,0.05)";
                  let border = "rgba(255,255,255,0.12)";
                  let col = "#e8e0f0";
                  let subCol = "#7060a0";
                  if (selected !== null) {
                    if (opt.num === quiz.correct.num) { bg = "rgba(100,220,130,0.15)"; border = "#64dc82"; col = "#64dc82"; subCol = "#4aac62"; }
                    else if (opt.num === selected) { bg = "rgba(220,80,80,0.15)"; border = "#dc5050"; col = "#dc5050"; subCol = "#a03030"; }
                  }
                  return (
                    <button key={opt.num} onClick={() => handleAnswer(opt)} style={{
                      padding: "12px 18px", borderRadius: 12, border: `1px solid ${border}`,
                      background: bg, color: col, fontSize: 17, fontWeight: 600,
                      cursor: quizResult ? "default" : "pointer", transition: "all 0.2s",
                      textAlign: "left", display: "flex", flexDirection: "column", gap: 2,
                    }}>
                      <span>{opt.romaji}</span>
                      <span style={{ fontSize: 12, color: subCol, fontWeight: 400 }}>{opt.hiragana}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", maxWidth: 340 }}>
                {quiz.options.map(opt => {
                  let bg = "rgba(255,255,255,0.05)";
                  let border = "rgba(255,255,255,0.12)";
                  let col = "#e8e0f0";
                  let subCol = "#7060a0";
                  if (selected !== null) {
                    if (opt.num === quiz.correct.num) { bg = "rgba(100,220,130,0.15)"; border = "#64dc82"; col = "#64dc82"; subCol = "#4aac62"; }
                    else if (opt.num === selected) { bg = "rgba(220,80,80,0.15)"; border = "#dc5050"; col = "#dc5050"; subCol = "#a03030"; }
                  }
                  return (
                    <button key={opt.num} onClick={() => handleAnswer(opt)} style={{
                      padding: "18px 8px", borderRadius: 12, border: `1px solid ${border}`,
                      background: bg, color: col, fontSize: 28, fontWeight: 700,
                      cursor: quizResult ? "default" : "pointer", transition: "all 0.2s",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    }}>
                      <span>{opt.num}</span>
                      <span style={{ fontSize: 11, fontFamily: "'Shippori Mincho', serif", color: subCol, fontWeight: 400 }}>{opt.kanji}</span>
                    </button>
                  );
                })}
              </div>
            )
          )}

          {quizResult && (
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{quizResult === "correct" ? "✅ Richtig!" : "❌ Falsch!"}</div>
              {quizResult === "wrong" && (
                <div style={{ color: "#a090c0", fontSize: 13, marginBottom: 12 }}>
                  Richtig war: <span style={{ color: "#e8c97e" }}>{quiz.correct.num}</span>
                  {" · "}<span style={{ color: "#c8b0e8" }}>{quiz.correct.romaji}</span>
                  {" · "}<span style={{ color: "#9080c0" }}>{quiz.correct.hiragana}</span>
                </div>
              )}
              <button onClick={nextQuiz} style={{ ...navBtn, background: "rgba(232,201,126,0.12)", borderColor: "rgba(232,201,126,0.5)", color: "#e8c97e", padding: "10px 28px" }}>
                Nächste Frage →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── ALLE ZAHLEN TAB ── */}
      {tab === 2 && (
        <div style={{ padding: "0 16px" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 }}>
            {groups.map(g => (
              <button key={g.value} onClick={() => setFilterGroup(g.value)} style={{
                padding: "5px 12px", borderRadius: 20, fontSize: 12,
                border: "1px solid",
                borderColor: filterGroup === g.value ? "#e8c97e" : "rgba(255,255,255,0.12)",
                background: filterGroup === g.value ? "rgba(232,201,126,0.15)" : "transparent",
                color: filterGroup === g.value ? "#e8c97e" : "#8070a0",
                cursor: "pointer",
              }}>{g.label}</button>
            ))}
          </div>
          <div style={{ maxWidth: 500, margin: "0 auto" }}>
            {filteredList.map(n => (
              <div key={n.num} style={{
                display: "grid",
                gridTemplateColumns: "48px 56px 1fr auto",
                alignItems: "center",
                gap: 12,
                padding: "10px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                <span style={{ color: "#e8c97e", fontWeight: 700, fontSize: 18 }}>{n.num}</span>
                <span style={{ fontFamily: "'Shippori Mincho', serif", color: "#c8b0e8", fontSize: 20 }}>{n.kanji}</span>
                <span style={{ color: "#e8e0f0", fontSize: 15 }}>{n.hiragana}</span>
                <span style={{ color: "#7060a0", fontSize: 12, fontStyle: "italic", textAlign: "right" }}>{n.romaji}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
