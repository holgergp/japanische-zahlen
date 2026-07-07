import type { NumberEntry } from "../types";
import { navButtonStyle, type Colors } from "../theme";

interface FlashCardProps {
  colors: Colors;
  isDark: boolean;
  card: NumberEntry;
  index: number;
  total: number;
  showAnswer: boolean;
  onToggleAnswer: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function FlashCard({
  colors,
  isDark,
  card,
  index,
  total,
  showAnswer,
  onToggleAnswer,
  onPrev,
  onNext,
}: FlashCardProps) {
  const navBtn = navButtonStyle(colors);
  return (
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
      <div style={{ color: colors.textMuted, fontSize: 12, marginBottom: 8 }}>
        {index + 1} / {total}
      </div>

      <div
        onClick={onToggleAnswer}
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
          <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 12 }}>
            Tippen zum Aufdecken
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
        <button onClick={onPrev} style={navBtn}>
          ← Zurück
        </button>
        <button
          onClick={onToggleAnswer}
          style={{
            ...navBtn,
            background: colors.btnToggleBg,
            borderColor: colors.cardBorder,
            color: colors.accentGold,
          }}
        >
          {showAnswer ? "Verstecken" : "Aufdecken"}
        </button>
        <button onClick={onNext} style={navBtn}>
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
        <span style={{ color: colors.accentPurple }}>二十 (ni-jū)</span> = 2×10
        = 20
        <br />
        <span style={{ color: colors.accentPurple }}>二十三 (ni-jū-san)</span> =
        20+3 = 23
      </div>
    </div>
  );
}
