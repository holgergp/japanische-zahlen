# Plan: Quiz-Denkzeit (Thinking Time)

> Status: Planned | Branch: `feature/denkzeit-plan`
> Last updated: 2026-05-10

---

## Ziel

Im Quiz-Modus sollen die Antwortmöglichkeiten zu Beginn jeder neuen Frage kurz ausgeblendet bleiben, damit der Nutzer aktiv über die Antwort nachdenken muss, bevor er sie sieht.

---

## Anforderungen

| # | Anforderung | Umsetzung |
|---|---|---|
| 1 | **Zeitgesteuert** | Die Antworten werden automatisch nach einer festen Wartezeit eingeblendet. |
| 2 | **Feste Dauer** | 3 Sekunden. Nicht konfigurierbar, um Clutter zu vermeiden. |
| 3 | **Kein Toggle** | Feature ist immer aktiv, keine Abschaltmöglichkeit nötig. |
| 4 | **Beide Modi** | Betrifft sowohl „Zahl → Romaji“ als auch „Romaji → Zahl“. |
| 5 | **Wartehinweis** | Während der Wartezeit erscheint ein Hinweis mit Countdown (z. B. *„Antworten werden in 3 Sekunden angezeigt…“*). |

---

## Technische Umsetzung

### 1. Datei
- **Betroffene Datei**: `src/App.jsx`

### 2. Benötigte React-Hooks
- **`useEffect`** (aktuell nur `useState` + `useCallback` importiert) – für den Countdown-Timer.

### 3. Neuer State
```js
const [countdown, setCountdown] = useState(0);
```

### 4. Logik (`useEffect`)

```js
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
```

**Wichtig**: Bei jedem Wechsel zu einer neuen Frage (`quiz` ändert sich) oder bei einem schnellen Moduswechsel muss das laufende Interval sauber aufgeräumt werden (`return () => clearInterval(id)`), um Memory Leaks zu vermeiden.

### 5. Rendering-Anpassungen

- **Frage-Box**: Bleibt sofort sichtbar (keine Änderung).
- **Antwort-Bereich**:
  - Wenn `countdown > 0`: Keine Buttons rendern. Stattdessen ein Hinweis-Element anzeigen:
    ```
    Antworten werden in {countdown} Sekunden angezeigt…
    ```
  - Wenn `countdown === 0`: Die 4 Antwort-Buttons wie bisher rendern.
- **Während `quizResult` gesetzt ist** (`correct` oder `wrong`): Countdown irrelevant, da die Antworten ja bereits sichtbar waren. Beim Klick auf „Nächste Frage“ startet der Cycle von vorne.

---

## UI/UX-Details

- **Hinweis-Styling**: Passend zur dunklen Theme-Palette des Projekts:
  - Hintergrund: `rgba(255,255,255,0.04)`
  - Rahmen: `1px solid rgba(232,201,126,0.2)`
  - Textfarbe: `#a090c0` (sekundäre Farbe)
  - Countdown-Zahl: `#e8c97e` (Akzentfarbe)
- **Keine Interaktion während Countdown**: Die Buttons sind ja noch nicht sichtbar, daher ist keine extra Deaktivierungslogik nötig.

---

## Deployment-Checkliste (für den späteren Implementierungs-Branch)

- [ ] `npm run build` erfolgreich
- [ ] `npm run preview` – Quiz-Denkzeit visuell geprüft
- [ ] Keine Konsole-Fehler (Interval-Cleanup getestet)
- [ ] Beide Quiz-Modi durchgespielt

---

*Ganbatte! 頑張って！*
