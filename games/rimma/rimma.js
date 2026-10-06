/*
 * Rimma – vilket ord rimmar på ordet i bilden?
 */
(function () {
  'use strict';

  const GAME_ID = 'rimma';
  const ROUND_LENGTH = 10;
  const LEVELS = [
    { name: 'Lätt', icon: '🐣', sub: '2 bilder att välja på', choices: 2 },
    { name: 'Mellan', icon: '🐥', sub: '3 bilder att välja på', choices: 3 },
    { name: 'Svår', icon: '🦅', sub: '4 bilder att välja på', choices: 4 }
  ];

  // Ord som rimmar, grupperade efter slutljud
  const GROUPS = [
    { end: 'att', words: [['katt', '🐱'], ['hatt', '🎩']] },
    { end: 'us', words: [['mus', '🐭'], ['hus', '🏠'], ['ljus', '🕯️']] },
    { end: 'ol', words: [['sol', '☀️'], ['stol', '🪑']] },
    { end: 'il', words: [['bil', '🚗'], ['pil', '🏹']] },
    { end: 'o', words: [['ko', '🐮'], ['sko', '👟'], ['bro', '🌉']] },
    { end: 'is', words: [['gris', '🐷'], ['is', '🧊'], ['ris', '🍚']] },
    { end: 'and', words: [['tand', '🦷'], ['hand', '✋'], ['sand', '🏖️']] },
    { end: 'ok', words: [['bok', '📖'], ['krok', '🪝']] },
    { end: 'åg', words: [['tåg', '🚂'], ['våg', '🌊']] },
    { end: 'ägg', words: [['ägg', '🥚'], ['skägg', '🧔']] },
    { end: 'en', words: [['ben', '🦴'], ['sten', '🪨']] },
    { end: 'oll', words: [['boll', '⚽'], ['troll', '🧌']] }
  ].map(g => ({ end: g.end, words: g.words.map(([word, emoji]) => ({ word, emoji })) }));

  function makeTasks(level, n) {
    return Teachy.sample(GROUPS, n).map(group => {
      const [target, partner] = Teachy.sample(group.words, 2);
      const others = Teachy.sample(GROUPS.filter(g => g !== group), level.choices - 1)
        .map(g => Teachy.sample(g.words, 1)[0]);
      return { group, target, partner, options: Teachy.shuffle([partner, ...others]) };
    });
  }

  Teachy.registerGame({
    id: GAME_ID,
    title: 'Rimma',
    subject: 'Svenska',
    icon: '🎵',
    color: '#f15bb5',
    description: 'Vilka ord rimmar på varandra?',

    renderProgress(progress, T) {
      return T.accuracyReport(GROUPS.map(g => '-' + g.end), progress.items, 'Rim');
    },

    mount(root, T) {
      const { el } = T;
      const timer = T.timers();

      function showLevels() {
        timer.clear();
        T.levelScreen(root, {
          icon: '🎵',
          title: 'Rimma',
          text: 'Ord som rimmar låter likadant på slutet – som katt och hatt. Tryck på bilden som rimmar!',
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
          hint: 'Vad rimmar på ordet?',
          timer,
          onReplay: () => startRound(level),
          onLevels: showLevels,
          render: task => ({
            prompt: el('div', { class: 'quiz-card' }, [
              el('span', { class: 'quiz-emoji', text: task.target.emoji }),
              el('span', { class: 'quiz-word', text: task.target.word })
            ]),
            say: 'Vad rimmar på ' + task.target.word + '? ' + T.orList(task.options.map(o => o.word)) + '?',
            praise: task.target.word + ' och ' + task.partner.word + ' rimmar!',
            item: '-' + task.group.end,
            choiceClass: 'pic-tile',
            choices: task.options.map(o => ({
              label: o.word,
              correct: o === task.partner,
              content: [
                el('span', { class: 'tile-emoji', text: o.emoji }),
                el('span', { class: 'tile-word', text: o.word })
              ]
            }))
          })
        });
      }

      showLevels();
      return timer.clear;
    }
  });
})();
