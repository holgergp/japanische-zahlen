import type { CSSProperties } from "react";

// The full color token set, derived from the active theme. Keeping this in one
// place means a theme tweak is a single edit instead of hunting inline literals.
export function buildColors(isDark: boolean) {
  return {
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
}

export type Colors = ReturnType<typeof buildColors>;

export const navButtonStyle = (colors: Colors): CSSProperties => ({
  padding: "9px 16px",
  borderRadius: 10,
  border: `1px solid ${colors.btnNavBorder}`,
  background: colors.btnNavBg,
  color: colors.btnNavColor,
  cursor: "pointer",
  fontSize: 13,
});
