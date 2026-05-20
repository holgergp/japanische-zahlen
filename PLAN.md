# Plan: Mobile-optimierte Ansicht (iPhone 16 Pro)

## Ziel
Der Hauptbereich der App soll auf einem iPhone 16 Pro (393×852 CSS-Pixel) komplett sichtbar sein, ohne scrollen zu müssen. Safari-UI-Elemente (Dynamic Island, URL-Bar, Home-Indicator) dürfen den Inhalt nicht verdecken.

## Analyse der aktuellen Probleme
1. **Falscher Viewport-Bezug**: `minHeight: "100vh"` bezieht sich auf die "Small Viewport Height". Auf iOS führt dies dazu, dass die Seite die Adressleiste mit einrechnet und Inhalte unten abgeschnitten werden.
2. **Großzügige Abstände**: Padding und Margin im Header, bei den Tabs und zwischen den Elementen sind zu groß für kleine Bildschirme.
3. **Feste Schriftgrößen**: Die 80px-Zahl im Lern-/Quiz-Tab skaliert nicht herunter und kann zusammen mit großen Paddings den Platzverbrauch erhöhen.
4. **Fehlende Body-Reset**: Standard-Browser-Margins (insb. auf Mobile) können zu unerwünschtem Scrollen führen.

## Umsetzungsschritte

### 1. Viewport & Body-Reset (`index.html`)
- `<style>`-Tag im `<head>` einfügen.
- `body { margin: 0; }` setzen, um Standard-Margins zu entfernen.
- Optional: `html, body, #root { height: 100%; }` für konsistente Flex-Berechnungen.

### 2. Root-Layout (`App.jsx`)
- `minHeight: "100vh"` durch `minHeight: "100dvh"` ersetzen (`dvh` = dynamic viewport height).
- `padding: "0 0 40px"` entfernen.
- Root-Container zu Flex-Column machen (`display: "flex", flexDirection: "column"`), damit die Tab-Inhalte den verbleibenden Platz füllen und wir steuern können, was fixiert und was scrollt.

### 3. Header kompaktieren
- Obere Padding reduzieren: `"32px 16px 16px"` → `"16px 16px 8px"`.
- `marginBottom` reduzieren: `24px` → `12px`.
- Untertitel etwas kleiner lassen (`fontSize: 10`).

### 4. Tabs kompaktieren
- `marginBottom` der Tab-Bar reduzieren: `28px` → `12px`.

### 5. "Lernen"-Tab kompaktieren
- Container bekommt `flex: 1` und `overflow: "auto"`, damit er den restlichen Viewport füllt und nur bei Bedarf scrollt.
- Flashcard: `maxWidth: "100%"` statt `340px`, damit volle Breite genutzt wird. `minHeight: 220` → entfernt oder auf `auto`, Padding reduziert (`24px 16px`).
- Schriftgrößen dynamisch mit `clamp()`:
  - Zahl: `fontSize: "clamp(56px, 18vw, 80px)"`
  - Kanji: `fontSize: "clamp(24px, 7vw, 32px)"`
- Buttons: `marginTop: 24` → `16`.
- Tipp-Box: `marginTop: 28` → `16`, Padding reduziert.

### 6. "Quiz"-Tab kompaktieren
- Container bekommt `flex: 1` und `overflow: "auto"`.
- Mode-Switcher `marginBottom`: `20` → `12`.
- Score `marginBottom`: `20` → `12`.
- Question Card: `padding: "28px 24px"` → `"20px 16px"`, `marginBottom: 20` → `12`.
- Schriftgrößen dynamisch mit `clamp()` (wie im Lernen-Tab).
- Antwort-Buttons: Padding leicht reduziert, `gap: 10` → `8`.
- Ergebnis-Anzeige: `marginTop: 24` → `12`.

### 7. "Alle Zahlen"-Tab: Scrollbare Liste
- Container bekommt `flex: 1`, `display: "flex"`, `flexDirection: "column"`, `overflow: "hidden"`.
- Filter-Chips bleiben oben fixiert (`marginBottom` reduziert auf `12`).
- Die eigentliche Zahlen-Liste wird in ein Wrapper-`<div>` mit `overflow: "auto"` und `flex: 1` gelegt, sodass nur die Liste scrollt, während Filter und Tabs sichtbar bleiben.

## Erfolgskriterien
- [ ] `npm run build` und `npm run preview` laufen fehlerfrei.
- [ ] Die drei Tabs sind auf einem iPhone 16 Pro (simuliert via DevTools) ohne Scrollen vollständig sichtbar (außer "Alle Zahlen", wo nur die Liste scrollt).
- [ ] Farben, Logik (`buildEntry`, Quiz) und Texte bleiben unverändert.
- [ ] Desktop-Ansicht bleibt funktional und optisch ansprechend.
