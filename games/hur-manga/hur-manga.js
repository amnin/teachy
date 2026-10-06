/*
 * Hur många? – räkna sakerna och tryck på rätt tal.
 * "Blixten" visar sakerna bara en kort stund, som prickarna på en tärning,
 * så att barnet tränar på att se antalet utan att räkna en och en.
 */
(function () {
  'use strict';

  const GAME_ID = 'hur-manga';
  const ROUND_LENGTH = 10;
  const FLASH_MS = 1600;
  const LEVELS = [
    { name: '1 till 5', icon: '🖐️', sub: 'Räkna sakerna', min: 1, max: 5, choices: 3 },
    { name: '1 till 10', icon: '🙌', sub: 'Räkna sakerna', min: 1, max: 10, choices: 4 },
    { name: 'Blixten', icon: '⚡', sub: 'Titta snabbt – hur många?', min: 1, max: 6, choices: 4, flash: true }
  ];

  const THINGS = [
    ['🍎', 'äpple', 'äpplen'], ['⭐', 'stjärna', 'stjärnor'], ['🐞', 'nyckelpiga', 'nyckelpigor'],
    ['🎈', 'ballong', 'ballonger'], ['🐟', 'fisk', 'fiskar'], ['🚗', 'bil', 'bilar'],
    ['🌸', 'blomma', 'blommor'], ['🐥', 'kyckling', 'kycklingar'], ['🍓', 'jordgubbe', 'jordgubbar']
  ].map(([emoji, one, many]) => ({ emoji, one, many }));

  // Tärningsmönster på ett 3×3-rutnät (rutorna numreras 0–8)
  const DICE = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

  function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function makeTasks(level, n) {
    const tasks = [];
    let last = null;
    while (tasks.length < n) {
      const count = rand(level.min, level.max);
      if (count === last) continue;
      last = count;
      tasks.push({ count, thing: THINGS[rand(0, THINGS.length - 1)] });
    }
    return tasks;
  }

  // Rätt svar plus närliggande tal, i storleksordning
  function makeChoices(answer, level) {
    const near = [];
    for (let d = 1; near.length < 6 && d <= level.max; d++) {
      if (answer - d >= level.min) near.push(answer - d);
      if (answer + d <= level.max) near.push(answer + d);
    }
    return [answer, ...Teachy.sample(near.slice(0, 4), level.choices - 1)].sort((a, b) => a - b);
  }

  Teachy.registerGame({
    id: GAME_ID,
    title: 'Hur många?',
    grade: 0,
    subject: 'Matematik',
    icon: '🔢',
    color: '#ffb627',
    description: 'Räkna sakerna – eller se antalet blixtsnabbt.',

    renderProgress(progress, T) {
      const numbers = Array.from({ length: 10 }, (_, i) => String(i + 1));
      return T.accuracyReport(numbers, progress.items, 'Antal');
    },

    mount(root, T) {
      const { el } = T;
      const timer = T.timers();

      function showLevels() {
        timer.clear();
        T.levelScreen(root, {
          icon: '🔢',
          title: 'Hur många?',
          text: 'Räkna sakerna och tryck på rätt siffra!',
          levels: LEVELS,
          onPick: startRound
        });
      }

      function startRound(level) {
        timer.clear();
        T.quizRound(root, {
          gameId: GAME_ID,
          level,
          tasks: makeTasks(level, ROUND_LENGTH),
          hint: level.flash ? 'Titta noga – sakerna försvinner snabbt!' : 'Räkna sakerna',
          timer,
          onReplay: () => startRound(level),
          onLevels: showLevels,
          render: task => {
            // Blixten: tärningsmönster. Annars: utspridda på ett 4×3-rutnät.
            const cols = level.flash ? 3 : 4;
            const cells = level.flash ? 9 : 12;
            const filled = new Set(level.flash ? DICE[task.count] : T.sample([...Array(cells).keys()], task.count));
            const grid = el('div', { class: 'count-grid', style: '--cols:' + cols },
              [...Array(cells).keys()].map(i => el('span', { text: filled.has(i) ? task.thing.emoji : '' })));

            let solved = false;
            const cover = () => { if (!solved) grid.classList.add('covered'); };
            const uncover = () => grid.classList.remove('covered');

            return {
              prompt: grid,
              say: 'Hur många ' + task.thing.many + '?',
              praise: task.count + ' ' + (task.count === 1 ? task.thing.one : task.thing.many) + '!',
              item: String(task.count),
              choiceClass: 'num-tile',
              choices: makeChoices(task.count, level).map(n => ({
                label: String(n),
                correct: n === task.count,
                content: el('span', { class: 'tile-up', text: n })
              })),
              onShow: () => { if (level.flash) timer.later(cover, FLASH_MS); },
              // Vid fel i Blixten: visa sakerna en gång till
              onWrong: () => {
                if (!level.flash) return;
                uncover();
                timer.later(cover, FLASH_MS);
              },
              onRight: () => {
                solved = true;
                uncover();
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
