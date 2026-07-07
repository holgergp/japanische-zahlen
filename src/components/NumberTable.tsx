import { fullList, largeList, formatNum } from "../numberUtils";
import type { LargeEntry } from "../numberUtils";
import type { FilterGroup } from "../types";
import type { Colors } from "../theme";

const groups: { label: string; value: FilterGroup }[] = [
  { label: "Alle", value: "alle" },
  { label: "0–10", value: "0-10" },
  { label: "11–19", value: "11-19" },
  { label: "20–99", value: "20-99" },
  { label: "Runde Zahlen", value: "round" },
  { label: "Hunderter", value: "hunderter" },
  { label: "Tausender", value: "tausender" },
  { label: "Große Einheiten", value: "grosse-einheiten" },
];

const LARGE_GROUPS = new Set<FilterGroup>([
  "hunderter",
  "tausender",
  "grosse-einheiten",
]);

function matchesFilter(num: number, filter: FilterGroup): boolean {
  if (filter === "0-10") return num <= 10;
  if (filter === "11-19") return num >= 11 && num <= 19;
  if (filter === "20-99") return num >= 20 && num <= 99;
  if (filter === "round") return num % 10 === 0;
  if (filter === "hunderter") return num >= 100 && num < 1_000;
  if (filter === "tausender") return num >= 1_000 && num < 10_000;
  if (filter === "grosse-einheiten") return num >= 10_000;
  return true; // "alle"
}

interface NumberTableProps {
  colors: Colors;
  filterGroup: FilterGroup;
  onFilterChange: (group: FilterGroup) => void;
}

export default function NumberTable({
  colors,
  filterGroup,
  onFilterChange,
}: NumberTableProps) {
  // ponytail: source switches on group, same row renderer below
  const isLargeGroup = LARGE_GROUPS.has(filterGroup);
  const sourceList: LargeEntry[] = isLargeGroup ? largeList : fullList;
  const filteredList = sourceList.filter((n) =>
    matchesFilter(n.num, filterGroup),
  );
  return (
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
            onClick={() => onFilterChange(g.value)}
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
                filterGroup === g.value ? colors.tabBgActive : "transparent",
              color:
                filterGroup === g.value ? colors.accentGold : colors.textMuted,
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
        {filteredList.map((n) => {
          const irr = (n as LargeEntry).irregular === true;
          return (
            <div
              key={n.num}
              style={{
                display: "grid",
                // large numbers need wider num/kanji cells (e.g. 1.000.000, 二十万)
                gridTemplateColumns: isLargeGroup
                  ? "auto auto 1fr auto"
                  : "48px 56px 1fr auto",
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
                  whiteSpace: "nowrap",
                }}
              >
                {formatNum(n.num)}
              </span>
              <span
                style={{
                  fontFamily: "'Shippori Mincho', serif",
                  color: colors.accentPurple,
                  fontSize: 20,
                  whiteSpace: "nowrap",
                }}
              >
                {n.kanji}
              </span>
              <span
                style={{
                  color: irr ? colors.accentGold : colors.textPrimary,
                  fontSize: 15,
                  fontWeight: irr ? 700 : undefined,
                }}
              >
                {n.hiragana}
              </span>
              <span
                style={{
                  color: irr ? colors.accentGold : colors.textMuted,
                  fontSize: 12,
                  fontStyle: "italic",
                  textAlign: "right",
                  fontWeight: irr ? 700 : undefined,
                }}
              >
                {n.romaji}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
