# 数字 – Japanische Zahlen lernen

Eine interaktive Lern-App für japanische Zahlen von 0 bis 100, entwickelt für den Kurs **Japanisch A1.1.1** an der VHS Düsseldorf (Minna no Nihongo).

🌐 **Live:** [https://holgergp.github.io/japanische-zahlen/](https://holgergp.github.io/japanische-zahlen/)

---

## Funktionen

### 📇 Lernen
Lernkarten mit allen Zahlen von 0–100. Tippe auf die Karte, um Hiragana und Romaji aufzudecken. Navigiere mit den Pfeiltasten vor und zurück.

### 🧠 Quiz – zwei Modi
- **Zahl → Romaji:** Sieh eine arabische Zahl, wähle die richtige Aussprache aus vier Optionen (mit Hiragana-Annotation).
- **Romaji → Zahl:** Sieh die Aussprache (mit Hiragana), wähle die richtige Zahl aus vier Optionen.

Getrennte Punktzählung pro Modus.

### 📋 Alle Zahlen
Komplette Referenztabelle mit Zahl, Kanji, Hiragana und Romaji. Filterbar nach Gruppen:
- 0–10 (Grundzahlen)
- 11–19
- 20–99
- Runde Zahlen (10, 20, 30 …)

---

## Lokale Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Produktions-Build erstellen
npm run build
```

---

## Deployment

Die App wird automatisch via **GitHub Actions** auf GitHub Pages deployed, sobald ein Commit auf den `main`-Branch gepusht wird.

### Einmalige Einrichtung in GitHub

1. Repository-Einstellungen öffnen → **Settings**
2. Unter **Pages** → **Source** → **GitHub Actions** auswählen
3. Fertig – der erste Push auf `main` startet den Deploy automatisch

Die App ist dann erreichbar unter:  
`https://holgergp.github.io/japanische-zahlen/`

---

## Technik

- [React 18](https://react.dev/)
- [Vite 5](https://vitejs.dev/)
- [Google Fonts: Noto Sans JP + Shippori Mincho](https://fonts.google.com/)
- Kein externes UI-Framework – reines CSS-in-JS

---

## Hintergrund

Japanische Zahlen folgen einem einfachen System:

| Baustein | Kanji | Romaji |
|---|---|---|
| 1–9 | 一 二 三 四 五 六 七 八 九 | ichi ni san shi/yon go roku shichi/nana hachi kyū |
| 10 | 十 | jū |
| 100 | 百 | hyaku |

Zusammengesetzte Zahlen entstehen durch Multiplikation:  
**47** = 四十七 = 四(4) × 十(10) + 七(7) = **yon-jū-nana**

Bei 4 und 7 gibt es je zwei gültige Lesungen (し/よん und しち/なな).

---

頑張って！ *(Ganbatte – Viel Erfolg!)*
