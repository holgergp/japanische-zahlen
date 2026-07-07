import type { Colors } from "../theme";

interface HeaderProps {
  colors: Colors;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function Header({ colors, theme, onToggleTheme }: HeaderProps) {
  const themeLabel =
    theme === "dark" ? "Helles Design aktivieren" : "Dunkles Design aktivieren";
  return (
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
        onClick={onToggleTheme}
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
        title={themeLabel}
        aria-label={themeLabel}
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
  );
}
