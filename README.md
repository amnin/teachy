# Teachy

Lärospel för skolan som webapp. Ren HTML/CSS/JavaScript – inget byggsteg och inga beroenden.

## Starta

Från projektmappen:

```sh
python3 -m http.server 8000
```

Öppna sedan <http://localhost:8000> i webbläsaren.
Vill du spela på en iPad i samma nätverk öppnar du `http://<datorns-ip>:8000` där.

(Det går också att dubbelklicka på `index.html`, men en server är att föredra.)

## Struktur

```
index.html            Laddar kärnan och alla spel
css/style.css         Gemensam stil
js/app.js             Router, startsida, hjälpfunktioner (tal, ljud, stjärnor, konfetti)
data/                 Gemensam data, t.ex. ord med bilder
games/<spel>/         Ett spel per mapp
```

## Lägga till ett nytt spel

1. Skapa `games/mitt-spel/mitt-spel.js`:

   ```js
   Teachy.registerGame({
     id: 'mitt-spel',           // blir adressen #/mitt-spel
     title: 'Mitt spel',
     grade: 1,                  // årskurs: 0 = förskoleklass, 1 = åk 1 (se GRADES i js/app.js)
     subject: 'Matematik',      // spel grupperas per ämne inom årskursen
     icon: '➕',
     color: '#3ddc97',
     description: 'Kort beskrivning',
     mount(root, T) {
       root.append(T.el('h1', { text: 'Hej!' }));
       return () => { /* städa: timers m.m. */ };
     }
   });
   ```

2. Lägg till en `<script>`-rad för filen i `index.html`.

Hjälpfunktioner i `T`: `el`, `shuffle`, `sample`, `speak` (svensk röst),
`chime('right' | 'wrong')`, `store`, `confetti`, `profiles`, `progress`.

## Profiler och framsteg

Varje barn har en egen profil (namn + figur). Framsteg sparas per profil och spel:

```js
T.progress.recordAnswer('mitt-spel', '7+5', true);   // rätt på första försöket?
T.progress.recordRound('mitt-spel', { level: 'Lätt', score: 8, total: 10, stars: 8 });
T.profiles.current().name;                            // för att säga barnets namn
```

Lägg till `renderProgress(progress, T)` i spelet för att visa egna detaljer på
framstegssidan (Ljuda visar t.ex. träffsäkerhet per bokstav).

Allt sparas i webbläsarens `localStorage`, alltså per enhet och webbläsare.

## Spel – Årskurs 0 (förskoleklass)

- **Ljuda** (Svenska) – en bild visas och läses upp, dra den till bokstaven ordet
  börjar på. Tre nivåer (3, 4 eller 6 bokstäver), 10 ord per runda.
- **Samma ljud** (Svenska) – 3, 4 eller 5 bilder visas, tryck på de två ord som börjar
  på samma bokstav. Orden under bilderna kan döljas.
- **Rimma** (Svenska) – vilken bild rimmar på ordet? 2, 3 eller 4 bilder att välja på.
- **Hur många?** (Matematik) – räkna saker 1–5 eller 1–10, eller "Blixten" där
  tärningsmönster bara visas en kort stund.
- **Mönster** (Matematik) – vad kommer sen? AB, AAB/ABB eller ABC/AABB.
- **Lägesord** (Matematik) – på, under, bredvid, bakom, framför. Lyssna och tryck
  på rätt bild.
- **Räkna** (Matematik) – plus och minus. Nivåer: plus till 5 och 10 och minus till 10
  med bilder att räkna på (kan döljas), samt plus & minus till 20 med bara siffror.
- **Sortera** (Natur och samhälle) – dra bilden till rätt grupp: djur som simmar,
  går eller flyger, frukt eller grönsak, årstider.

Spelen utgår från förskoleklassens centrala innehåll i Lgr22.
**Räkna** finns även i årskurs 1.

## Spel – Årskurs 1

Utgår från det centrala innehållet för åk 1–3 i Lgr22 (början av perioden) och
kriterierna för läsförståelse i slutet av åk 1. Filerna ligger i `games/ak1/`.

- **Svenska:** Läs ordet, Läs meningen, Bygg ordet, Lyssna på sagan, ABC,
  Punkt och stor bokstav
- **Matematik:** Tiokamrater, Tiotal och ental, Gömt tal, Talmönster,
  Dubbelt och hälften, Halvor och fjärdedelar, Klockan, Former, Robotvägen,
  Läs diagrammet (+ Räkna)
- **NO:** Flyter eller sjunker?, Is vatten ånga, Livscykeln, Vem äter vem?,
  Kroppen och sinnena
- **SO:** Trafikvett, Vem hjälper till?
- **Engelska:** English words (färger, siffror, djur, mat – engelsk uppläsning)
- **Teknik:** Datorns delar

Gemensam data: ord med bilder i `data/words.js`, bilder till lägesord i `data/scenes.js`.

## Byggstenar för nya spel

De flesta spel är bara data + en liten `render`-funktion. Välj typ:

- `T.quizGame(def)` – flervalsfrågor. Exempel: `games/ak1/tiotal.js` (≈50 rader).
- `T.sortGame(def)` – dra bilder till rätt grupp. Bara data, se `games/ak1/flyter.js`.
- `T.orderGame(def)` – tryck i rätt ordning. Se `games/ak1/livscykel.js`.
- Eget gränssnitt: `T.registerGame` + `T.levelScreen`, `T.roundTracker`,
  `T.resultScreen`, `T.timers`. Se `games/ak1/robot.js`.

`def` innehåller `id, title, grade, subject, icon, color, description, intro,
levels, makeTasks(level, n), render(task, level), hint, report: { title, keys }`.
`render` returnerar `{ prompt, say, item, choices, praise, retry, lang, onRight }`.

Övriga hjälpare: `T.numberOptions` (svarsknappar för tal), `T.slot` (?-ruta),
`T.picture`, `T.draggable`, `T.toggle`, `T.accuracyReport`, `T.praise`,
`T.orList`, `T.rand`, `T.pick`, `T.speak(text, lang)`.

Ämnenas ordning på startsidan styrs av `SUBJECTS` i `js/app.js`.
