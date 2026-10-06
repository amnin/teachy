/*
 * Samma ljud – flera bilder visas, tryck på de två ord som börjar på samma bokstav.
 */
(function () {
  'use strict';

  const GAME_ID = 'samma-ljud';
  const ROUND_LENGTH = 10;
  const LEVELS = [
    { name: 'Lätt', icon: '🐣', cards: 3, sub: '3 bilder' },
    { name: 'Mellan', icon: '🐥', cards: 4, sub: '4 bilder' },
    { name: 'Svår', icon: '🦅', cards: 5, sub: '5 bilder' }
  ];

  function firstLetter(word) {
    return word.charAt(0).toLocaleUpperCase('sv-SE');
  }

  // { 'B': [banan, bil, ...], ... }
  function wordsByLetter() {
    const groups = new Map();
    for (const w of Teachy.data.words) {
      const letter = firstLetter(w.word);
      if (!groups.has(letter)) groups.set(letter, []);
      groups.get(letter).push(w);
    }
    return groups;
  }

  // Bokstäver med minst två ord – bara de kan bilda ett par
  function pairLetters(groups) {
    return [...groups.keys()].filter(l => groups.get(l).length >= 2);
  }

  // Varje uppgift: ett par med samma första bokstav + övriga ord som alla
  // börjar på olika bokstäver, så att det bara finns ett rätt par.
  function makeTasks(level, n) {
    const groups = wordsByLetter();
    const letters = Teachy.shuffle(pairLetters(groups));
    const tasks = [];
    for (let i = 0; i < n; i++) {
      const letter = letters[i % letters.length];
      const pair = Teachy.sample(groups.get(letter), 2);
      const others = Teachy.sample([...groups.keys()].filter(l => l !== letter), level.cards - 2)
        .map(l => Teachy.sample(groups.get(l), 1)[0]);
      tasks.push({ letter, pair, cards: Teachy.shuffle([...pair, ...others]) });
    }
    return tasks;
  }

  Teachy.registerGame({
    id: GAME_ID,
    title: 'Samma ljud',
    subject: 'Svenska',
    icon: '🧩',
    color: '#4cc9f0',
    description: 'Hitta de två orden som börjar likadant.',

    renderProgress(progress, T) {
      const letters = pairLetters(wordsByLetter()).sort((a, b) => a.localeCompare(b, 'sv'));
      return T.accuracyReport(letters, progress.items, 'Bokstäver');
    },

    mount(root, T) {
      const { el } = T;
      const timer = T.timers();

      // Visa orden under bilderna av/på – sparas per profil
      const wordsKey = GAME_ID + ':words:' + T.profiles.current().id;
      const wordsOn = () => T.store.get(wordsKey, true);

      // ---------- Välj nivå ----------

      function showLevels() {
        timer.clear();
        T.levelScreen(root, {
          icon: '🧩',
          title: 'Samma ljud',
          text: 'Titta på bilderna och säg orden. Vilka två börjar på samma ljud? Tryck på dem!',
          levels: LEVELS,
          onPick: startRound,
          options: el('div', { class: 'options' }, [
            T.toggle('Visa orden', wordsOn(), value => {
              T.store.set(wordsKey, value);
              showLevels();
            })
          ])
        });
      }

      // ---------- En runda ----------

      function startRound(level) {
        timer.clear();
        const tasks = makeTasks(level, ROUND_LENGTH);
        const tracker = T.roundTracker(tasks.length);
        const showWords = wordsOn();
        let index = 0;
        let mistakes = 0;
        let locked = false;
        let current = null;
        let cards = [];
        let selected = [];

        const grid = el('div', { class: 'pair-grid' });
        const reveal = el('div', { class: 'pair-reveal', 'aria-live': 'polite' });

        root.replaceChildren(el('div', { class: 'screen samma-ljud' }, [
          tracker.bar,
          el('p', { class: 'hint', text: 'Vilka två börjar på samma ljud?' }),
          grid,
          reveal
        ]));

        function wordOf(card) {
          return current.cards[Number(card.dataset.index)];
        }

        function setSelected(card, on) {
          card.classList.toggle('selected', on);
          card.setAttribute('aria-pressed', String(on));
        }

        function showTask() {
          current = tasks[index];
          mistakes = 0;
          locked = false;
          selected = [];
          tracker.current(index);
          reveal.replaceChildren();

          cards = current.cards.map((w, i) => {
            const card = el('button', {
              class: 'pair-card pop-in', type: 'button', 'aria-label': w.word, 'aria-pressed': 'false',
              onclick: () => pick(card)
            }, [
              el('span', { class: 'pair-emoji', text: w.emoji }),
              el('span', { class: 'pair-word', hidden: !showWords }, [
                el('span', { class: 'pair-first', text: w.word.charAt(0) }),
                w.word.slice(1)
              ])
            ]);
            card.dataset.index = i;
            return card;
          });
          grid.replaceChildren(...cards);
        }

        function pick(card) {
          if (locked) return;
          T.speak(wordOf(card).word);

          if (selected.includes(card)) {
            selected = selected.filter(c => c !== card);
            setSelected(card, false);
            return;
          }
          selected.push(card);
          setSelected(card, true);
          if (selected.length === 2) check();
        }

        function check() {
          const [a, b] = selected.map(wordOf);

          if (firstLetter(a.word) === firstLetter(b.word)) {
            locked = true;
            T.chime('right');
            T.progress.recordAnswer(GAME_ID, current.letter, mistakes === 0);
            tracker.mark(index, mistakes === 0);

            for (const card of cards) {
              if (selected.includes(card)) {
                card.classList.add('right');
                card.querySelector('.pair-word').hidden = false;
              } else {
                card.classList.add('faded');
              }
            }

            const letter = current.letter;
            reveal.replaceChildren(
              el('span', { class: 'pair-letter', text: letter + letter.toLocaleLowerCase('sv-SE') }),
              el('span', { text: 'Båda börjar på ' + letter + '!' })
            );
            timer.later(() => T.speak(a.word + ' och ' + b.word + '. Båda börjar på ' + letter), 700);
            timer.later(next, 3800);
          } else {
            mistakes++;
            T.chime('wrong');
            const wrong = selected;
            selected = [];
            wrong.forEach(c => T.replayClass(c, 'wrong'));
            timer.later(() => wrong.forEach(c => {
              if (!selected.includes(c)) setSelected(c, false);
            }), 450);

            // Efter två fel: visa vilket par som är rätt
            if (mistakes >= 2) {
              cards.filter(c => current.pair.includes(wordOf(c))).forEach(c => c.classList.add('nudge'));
            }
          }
        }

        function next() {
          index++;
          if (index < tasks.length) {
            showTask();
            return;
          }
          timer.clear();
          T.resultScreen(root, {
            gameId: GAME_ID,
            // Märk rundor där orden var dolda, så det syns i historiken
            level: showWords ? level : { name: level.name + ' (utan ord)' },
            score: tracker.stars,
            total: tasks.length,
            onReplay: () => startRound(level),
            onLevels: showLevels
          });
        }

        showTask();
      }

      showLevels();
      return timer.clear;
    }
  });
})();
