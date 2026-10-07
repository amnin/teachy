/*
 * Tiotal och ental – positionssystemet med tiostavar och kuber.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const LEVELS = [
    { name: 'Till 20', icon: '🐣', sub: 'Ett tiotal och några ental', min: 10, max: 20 },
    { name: 'Till 50', icon: '🐥', sub: 'Några tiotal', min: 10, max: 50 },
    { name: 'Till 100', icon: '🦅', sub: 'Många tiotal', min: 10, max: 99 }
  ];

  function blocks(n) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return el('div', { class: 'base-ten' }, [
      ...Array.from({ length: tens }, () =>
        el('span', { class: 'ten-bar' }, Array.from({ length: 10 }, () => el('i')))),
      el('span', { class: 'ones' }, Array.from({ length: ones }, () => el('i')))
    ]);
  }

  T.quizGame({
    id: 'tiotal',
    title: 'Tiotal och ental',
    grade: 1,
    subject: 'Matematik',
    icon: '🧱',
    color: '#4361ee',
    description: 'Räkna tiostavar och kuber.',
    intro: 'En lång stav är ett tiotal – tio kuber. En liten kub är ett ental. Vilket tal är det?',
    hint: 'Vilket tal är det?',
    levels: LEVELS,
    makeTasks: (level, n) => T.sample(Array.from({ length: level.max - level.min + 1 }, (_, i) => level.min + i), n),
    report: { title: 'Talområde', keys: LEVELS.map(l => l.name) },
    render: (n, level) => {
      const tens = Math.floor(n / 10);
      const ones = n % 10;
      return {
        prompt: blocks(n),
        say: 'Räkna tiotalen och entalen. Vilket tal är det?',
        praise: tens + ' tiotal och ' + ones + ' ental. Det är ' + n + '!',
        item: level.name,
        choiceClass: 'num-tile',
        // Vanligt fel: att byta plats på tiotal och ental (34 ↔ 43)
        choices: T.numberOptions(n, 4, 0, 100, [ones * 10 + tens, n + 10, n - 10, tens + ones])
      };
    }
  });
})();
