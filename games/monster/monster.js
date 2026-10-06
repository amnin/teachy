/*
 * Mönster – vad kommer sen i raden?
 */
(function () {
  'use strict';

  const GAME_ID = 'monster';
  const ROUND_LENGTH = 10;
  const LEVELS = [
    { name: 'Lätt', icon: '🐣', sub: '🔴🔵🔴🔵', units: ['AB'] },
    { name: 'Mellan', icon: '🐥', sub: '🔴🔴🔵🔴🔴🔵', units: ['AAB', 'ABB'] },
    { name: 'Svår', icon: '🦅', sub: '🔴🔵🟡🔴🔵🟡', units: ['ABC', 'AABB'] }
  ];
  const ALL_UNITS = ['AB', 'AAB', 'ABB', 'ABC', 'AABB'];

  const POOLS = [
    ['🔴', '🔵', '🟡', '🟢', '🟣'],
    ['🍎', '🍌', '🍇', '🍓', '🍊'],
    ['🐶', '🐱', '🐭', '🐰', '🐸'],
    ['⭐', '❤️', '🌙', '☀️', '☁️']
  ];

  function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function makeTask(level) {
    const unit = level.units[rand(0, level.units.length - 1)];
    const letters = [...new Set(unit)];
    const pool = POOLS[rand(0, POOLS.length - 1)];
    const symbols = Teachy.sample(pool, letters.length + 1);
    const map = {};
    letters.forEach((l, i) => { map[l] = symbols[i]; });

    // Visa mönstret 2–3 varv, och sluta på olika ställen i mönstret
    const length = unit.length * (unit.length <= 2 ? 3 : 2) + rand(0, unit.length - 1);
    const sequence = Array.from({ length }, (_, i) => map[unit[i % unit.length]]);
    const answer = map[unit[length % unit.length]];
    return { unit, sequence, answer, options: Teachy.shuffle(symbols) };
  }

  Teachy.registerGame({
    id: GAME_ID,
    title: 'Mönster',
    grade: 0,
    subject: 'Matematik',
    icon: '🔴',
    color: '#9b5de5',
    description: 'Vad kommer sen i raden?',

    renderProgress(progress, T) {
      return T.accuracyReport(ALL_UNITS, progress.items, 'Mönstertyper');
    },

    mount(root, T) {
      const { el } = T;
      const timer = T.timers();

      function showLevels() {
        timer.clear();
        T.levelScreen(root, {
          icon: '🔴',
          title: 'Mönster',
          text: 'Titta på raden. Vad kommer sen? Tryck på rätt bild!',
          levels: LEVELS,
          onPick: startRound
        });
      }

      function startRound(level) {
        timer.clear();
        T.quizRound(root, {
          gameId: GAME_ID,
          level,
          tasks: Array.from({ length: ROUND_LENGTH }, () => makeTask(level)),
          hint: 'Vad kommer sen?',
          timer,
          onReplay: () => startRound(level),
          onLevels: showLevels,
          render: task => {
            const slot = el('span', { class: 'pattern-slot', text: '?' });
            return {
              prompt: el('div', { class: 'pattern-row' }, [
                ...task.sequence.map(s => el('span', { text: s })),
                slot
              ]),
              say: 'Vad kommer sen?',
              item: task.unit,
              choiceClass: 'emoji-tile',
              choices: task.options.map(s => ({
                label: s,
                correct: s === task.answer,
                content: el('span', { class: 'tile-emoji', text: s })
              })),
              onRight: () => {
                slot.textContent = task.answer;
                slot.classList.add('right');
              }
            };
          }
        });
      }

      showLevels();
      return timer.clear;
    }
  });
})();
