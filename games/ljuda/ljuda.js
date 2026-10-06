/*
 * Ljuda – dra bilden till bokstaven som ordet börjar på.
 */
(function () {
  'use strict';

  const ROUND_LENGTH = 10;
  const LEVELS = [
    { name: 'Lätt', choices: 3, icon: '🐣', sub: '3 bokstäver' },
    { name: 'Mellan', choices: 4, icon: '🐥', sub: '4 bokstäver' },
    { name: 'Svår', choices: 6, icon: '🦅', sub: '6 bokstäver' }
  ];

  function firstLetter(word) {
    return word.charAt(0).toLocaleUpperCase('sv-SE');
  }

  Teachy.registerGame({
    id: 'ljuda',
    title: 'Ljuda',
    grade: 0,
    subject: 'Svenska',
    icon: '🔤',
    color: '#ff8a3d',
    description: 'Vilken bokstav börjar ordet på?',

    // Framstegssidan: hur ofta varje bokstav blir rätt på första försöket
    renderProgress(progress, T) {
      const letters = [...new Set(Teachy.data.words.map(w => firstLetter(w.word)))]
        .sort((a, b) => a.localeCompare(b, 'sv'));
      return T.accuracyReport(letters, progress.items, 'Bokstäver');
    },

    mount(root, T) {
      const { el } = T;
      const WORDS = Teachy.data.words;
      const ALL_LETTERS = [...new Set(WORDS.map(w => firstLetter(w.word)))];
      const timer = T.timers();

      // ---------- Välj nivå ----------

      function showLevels() {
        timer.clear();
        T.levelScreen(root, {
          icon: '🔤',
          title: 'Ljuda',
          text: 'Titta på bilden och säg ordet. Vilket ljud börjar det med? Dra bilden till rätt bokstav!',
          levels: LEVELS,
          onPick: startRound
        });
      }

      // ---------- En runda ----------

      function startRound(level) {
        timer.clear();
        const words = T.sample(WORDS, ROUND_LENGTH);
        const tracker = T.roundTracker(words.length);
        let index = 0;
        let mistakes = 0;
        let locked = false;
        let current = null;
        let tiles = [];

        const card = el('div', { class: 'pic-card', role: 'img' });
        const reveal = el('div', { class: 'reveal', 'aria-live': 'polite' });
        const letters = el('div', { class: 'letters' });
        const listen = el('button', {
          class: 'btn btn-listen', type: 'button', text: '🔊 Lyssna',
          onclick: () => T.speak(current.word)
        });

        root.replaceChildren(el('div', { class: 'screen ljuda' }, [
          tracker.bar,
          el('p', { class: 'hint', text: 'Dra bilden till rätt bokstav' }),
          el('div', { class: 'pic-zone' }, [card, reveal, listen]),
          letters
        ]));

        // Dra bilden till en bokstav. Ett tryck utan att dra = lyssna på ordet.
        const dragger = T.draggable(card, {
          targets: () => tiles,
          enabled: () => !locked,
          onDrop: tile => choose(tile),
          onTap: () => T.speak(current.word)
        });

        // --- Spelets logik ---

        function showWord() {
          current = words[index];
          mistakes = 0;
          locked = false;

          const answer = firstLetter(current.word);
          const others = T.sample(ALL_LETTERS.filter(l => l !== answer), level.choices - 1);

          card.textContent = current.emoji;
          card.setAttribute('aria-label', current.word);
          dragger.reset();

          reveal.replaceChildren();
          tracker.current(index);

          tiles = T.shuffle([answer, ...others]).map(letter => {
            const tile = el('button', {
              class: 'tile', type: 'button', 'aria-label': 'Bokstaven ' + letter,
              onclick: () => choose(tile)
            }, [
              el('span', { class: 'tile-up', text: letter }),
              el('span', { class: 'tile-low', text: letter.toLocaleLowerCase('sv-SE') })
            ]);
            tile.dataset.letter = letter;
            return tile;
          });
          letters.replaceChildren(...tiles);

          timer.later(() => T.speak(current.word), 400);
        }

        function choose(tile) {
          if (locked) return;
          const answer = firstLetter(current.word);

          if (tile.dataset.letter === answer) {
            locked = true;
            tile.classList.add('right');
            dragger.flyInto(tile);
            T.chime('right');

            T.progress.recordAnswer('ljuda', answer, mistakes === 0);
            tracker.mark(index, mistakes === 0);

            reveal.replaceChildren(
              el('span', { class: 'reveal-emoji', text: current.emoji }),
              el('span', { class: 'reveal-first', text: current.word.charAt(0) }),
              el('span', { text: current.word.slice(1) })
            );
            timer.later(() => T.speak(current.word), 350);
            timer.later(next, 2000);
          } else {
            mistakes++;
            T.chime('wrong');
            T.replayClass(tile, 'wrong');
            dragger.snapBack();
            timer.later(() => T.speak(current.word), 350);

            // Efter två fel: visa var rätt svar är
            if (mistakes >= 2) {
              const right = tiles.find(t => t.dataset.letter === answer);
              if (right) right.classList.add('nudge');
            }
          }
        }

        function next() {
          index++;
          if (index < words.length) {
            showWord();
            return;
          }
          timer.clear();
          T.resultScreen(root, {
            gameId: 'ljuda',
            level,
            score: tracker.stars,
            total: words.length,
            onReplay: () => startRound(level),
            onLevels: showLevels
          });
        }

        showWord();
      }

      showLevels();
      return timer.clear;
    }
  });
})();
