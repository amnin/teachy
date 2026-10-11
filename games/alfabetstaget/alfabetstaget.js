/*
 * Alfabetståget – ett tåg med vagnar som har var sin bokstav. Dra bilderna
 * till vagnen med bokstaven som ordet börjar på, och låt sedan tåget köra.
 *
 * Bilderna har ingen text – barnet säger ordet (eller trycker för att höra det)
 * och lyssnar efter första ljudet. På svåraste nivån finns också ord som inte
 * ska med, de ska stå kvar på perrongen.
 *
 * Poäng: ett ord som hamnar i rätt vagn på första försöket ger en poäng.
 * Ord som blir kvar när tåget kör är missade, och ett ord som inte ska med
 * men läggs i en vagn drar av en poäng.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const LEVELS = [
    { name: 'Lätt', icon: '🐣', sub: '3 vagnar', wagons: 3, perWagon: [2, 2], extra: 0 },
    { name: 'Mellan', icon: '🐥', sub: '5 vagnar', wagons: 5, perWagon: [2, 2], extra: 0 },
    { name: 'Svår', icon: '🦅', sub: '5 vagnar – och ord som inte ska med', wagons: 5, perWagon: [2, 3], extra: 3 },
    { name: 'Extra svår', icon: '🐉', sub: '5 vagnar – många ord ska stanna kvar', wagons: 5, perWagon: [2, 3], extra: 8 }
  ];

  const firstLetter = word => word.charAt(0).toLocaleUpperCase('sv-SE');

  // Väljer bokstäver till vagnarna och ord till perrongen
  function makeTrain(level) {
    const byLetter = new Map();
    T.data.words.forEach(w => {
      const letter = firstLetter(w.word);
      if (!byLetter.has(letter)) byLetter.set(letter, []);
      byLetter.get(letter).push(w);
    });
    const usable = [...byLetter.keys()].filter(l => byLetter.get(l).length >= level.perWagon[1]);
    const letters = T.sample(usable, level.wagons).sort((a, b) => a.localeCompare(b, 'sv'));

    const cargo = letters.flatMap(letter =>
      T.sample(byLetter.get(letter), T.rand(level.perWagon[0], level.perWagon[1])));
    const others = [...byLetter.keys()].filter(l => !letters.includes(l)).flatMap(l => byLetter.get(l));
    const extra = T.sample(others, level.extra);

    return { letters, cards: T.shuffle(cargo.concat(extra)).map(w => ({ word: w.word, emoji: w.emoji, letter: firstLetter(w.word) })) };
  }

  T.registerGame({
    id: 'alfabetstaget',
    title: 'Alfabetståget',
    grade: 0,
    subject: 'Svenska',
    icon: '🚂',
    color: '#ff5d73',
    description: 'Lasta orden i vagnen med rätt bokstav.',

    renderProgress(progress) {
      const letters = [...new Set(T.data.words.map(w => firstLetter(w.word)))].sort((a, b) => a.localeCompare(b, 'sv'));
      return T.accuracyReport(letters, progress.items, 'Bokstäver');
    },

    mount(root) {
      const timer = T.timers();

      function showLevels() {
        timer.clear();
        T.levelScreen(root, {
          icon: '🚂',
          title: 'Alfabetståget',
          text: 'Varje vagn har en bokstav. Dra bilderna till vagnen med bokstaven som ordet börjar på. När allt är lastat – låt tåget köra!',
          levels: LEVELS,
          onPick: startRound
        });
      }

      function startRound(level) {
        timer.clear();
        const { letters, cards } = makeTrain(level);
        const total = cards.filter(c => letters.includes(c.letter)).length;
        let penalty = 0;
        let leaving = false;

        // ---------- Tåget ----------

        const wagons = letters.map(letter => {
          const load = el('div', { class: 'wagon-load' });
          const node = el('button', {
            class: 'wagon', type: 'button', 'aria-label': 'Vagnen med bokstaven ' + letter,
            onclick: () => T.speak(letter.toLocaleLowerCase('sv-SE'))
          }, [
            el('span', { class: 'wagon-letter', text: letter + letter.toLocaleLowerCase('sv-SE') }),
            load
          ]);
          node.dataset.letter = letter;
          node.load = load;
          return node;
        });
        const train = el('div', { class: 'train', style: '--wagons:' + letters.length }, [
          el('span', { class: 'train-engine', 'aria-hidden': 'true', text: '🚂' }),
          ...wagons
        ]);

        // ---------- Perrongen ----------

        const go = el('button', { class: 'btn btn-big train-go', type: 'button', text: '🚂 Kör tåget!', onclick: depart });
        const platform = el('div', { class: 'platform' }, cards.map(makeCard));

        root.replaceChildren(el('div', { class: 'screen' }, [
          T.topBar(),
          el('p', { class: 'hint', text: 'Dra bilderna till vagnen med rätt bokstav' }),
          el('div', { class: 'train-track' }, [train]),
          platform,
          go
        ]));

        timer.later(() => T.speak('Dra bilderna till vagnen med rätt bokstav. Tryck på en bild för att höra ordet.'), 400);

        function makeCard(card) {
          const node = el('div', { class: 'word-card', role: 'img', 'aria-label': card.word, text: card.emoji });
          card.node = node;
          card.misses = 0;
          card.onBoard = false;
          card.drag = T.draggable(node, {
            targets: () => wagons,
            enabled: () => !leaving && !card.onBoard,
            onDrop: wagon => drop(card, wagon),
            onTap: () => T.speak(card.word)
          });
          return node;
        }

        function drop(card, wagon) {
          const letter = wagon.dataset.letter;

          if (letter === card.letter) {
            card.onBoard = true;
            T.chime('right');
            T.progress.recordAnswer('alfabetstaget', card.letter, card.misses === 0);
            wagons.forEach(w => w.classList.remove('nudge'));
            card.drag.flyInto(wagon);
            T.replayClass(wagon, 'bump');
            T.speak(card.word + '. ' + letter.toLocaleLowerCase('sv-SE'));
            timer.later(() => {
              card.node.remove();
              wagon.load.append(el('span', { class: 'wagon-item', text: card.emoji, title: card.word }));
              if (cards.every(c => c.onBoard || !letters.includes(c.letter))) {
                go.classList.add('ready');
                T.speak('Allt är lastat! Tryck på Kör tåget!');
              }
            }, 380);
            return;
          }

          T.chime('wrong');
          T.replayClass(wagon, 'wrong');
          card.drag.snapBack();

          if (!letters.includes(card.letter)) {
            // Ett ord som inte ska med – drar av en poäng första gången
            if (card.misses === 0) penalty++;
            card.misses++;
            T.speak(card.word + ' börjar på ' + card.letter.toLocaleLowerCase('sv-SE') +
              '. Den bokstaven finns inte på tåget, så ' + card.word + ' får stanna kvar.');
            card.node.classList.add('stays');
            return;
          }

          card.misses++;
          T.speak(card.word + '. Lyssna på första ljudet och försök igen!');
          // Efter två fel: visa vilken vagn det ska till
          if (card.misses >= 2) wagons.find(w => w.dataset.letter === card.letter).classList.add('nudge');
        }

        function depart() {
          if (leaving) return;
          leaving = true;
          go.disabled = true;

          // Ord som skulle med men blev kvar
          const missed = cards.filter(c => letters.includes(c.letter) && !c.onBoard);
          missed.forEach(c => {
            c.node.classList.add('missed');
            T.progress.recordAnswer('alfabetstaget', c.letter, false);
          });

          const onBoard = cards.filter(c => c.onBoard && c.misses === 0).length;
          const score = Math.max(0, onBoard - penalty);

          train.classList.add('leaving');
          T.speak(missed.length
            ? 'Tut tut! Tåget kör. ' + missed.map(c => c.word).join(', ') + ' kom inte med.'
            : 'Tut tut! Tåget kör iväg med alla orden!');

          timer.later(() => {
            timer.clear();
            T.resultScreen(root, {
              gameId: 'alfabetstaget', level, score, total,
              onReplay: () => startRound(level), onLevels: showLevels
            });
          }, missed.length ? 5200 : 3400);
        }
      }

      showLevels();
      return timer.clear;
    }
  });
})();
