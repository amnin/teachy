/*
 * Bråk av antal – hälften, en tredjedel och en fjärdedel av en grupp.
 * Grupperna ritas under "Visa hjälp".
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const FRACTIONS = [
    { n: 2, name: 'hälften', sign: '1/2' },
    { n: 3, name: 'en tredjedel', sign: '1/3' },
    { n: 4, name: 'en fjärdedel', sign: '1/4' },
    { n: 5, name: 'en femtedel', sign: '1/5' }
  ];
  const THINGS = [['🍓', 'jordgubbar'], ['🍬', 'godisbitar'], ['⚽', 'bollar'], ['🍪', 'kakor'], ['🖍️', 'kritor']];

  const LEVELS = [
    { name: 'Hälften och en fjärdedel', icon: '🍰', sub: 'Hälften av 8', fractions: [2, 4], kind: 'part' },
    { name: 'Tredjedelar och femtedelar', icon: '🍕', sub: 'En tredjedel av 12', fractions: [2, 3, 4, 5], kind: 'part' },
    { name: 'Vilket är störst?', icon: '🦅', sub: '1/2, 1/3 eller 1/4?', kind: 'compare' }
  ];

  function groups(f, total, emoji) {
    const size = total / f.n;
    return el('div', { class: 'groups' }, Array.from({ length: f.n }, (_, i) =>
      el('span', { class: 'group' + (i === 0 ? ' chosen' : ''), text: emoji.repeat(size) })));
  }

  function makeTask(level) {
    if (level.kind === 'compare') {
      const picked = T.sample(FRACTIONS, 3);
      const largest = Math.random() < 0.6;
      const answer = picked.reduce((a, b) => ((largest ? b.n < a.n : b.n > a.n) ? b : a));
      return { kind: 'compare', picked, largest, answer };
    }
    const n = T.pick(level.fractions);
    const f = FRACTIONS.find(x => x.n === n);
    const size = T.rand(1, f.n === 2 ? 8 : 5);
    return { kind: 'part', f, total: f.n * size, answer: size, thing: T.pick(THINGS) };
  }

  T.quizGame({
    id: 'brak-antal',
    title: 'Bråk av antal',
    grade: 3,
    subject: 'Matematik',
    icon: '🍰',
    color: '#f15bb5',
    description: 'Hälften, en tredjedel och en fjärdedel av en grupp.',
    intro: 'En fjärdedel av 12 betyder: dela 12 i fyra lika stora grupper. Hur många är det i en grupp?',
    hint: 'Dela i lika stora grupper',
    levels: LEVELS,
    makeTasks: (level, n) => Array.from({ length: n }, () => makeTask(level)),
    report: { title: 'Bråk', keys: LEVELS.map(l => l.name) },
    render: (task, level) => {
      if (task.kind === 'compare') {
        const word = task.largest ? 'störst' : 'minst';
        const question = 'Tänk dig en pizza. Vilken bit är ' + word + '?';
        return {
          prompt: el('div', { class: 'fact-task' }, [el('div', { class: 'fact-picture', text: '🍕' }), el('p', { class: 'read-sentence', text: question })]),
          say: question + ' ' + T.orList(task.picked.map(f => f.name)) + '?',
          retry: question,
          praise: (task.largest ? 'Ju färre delar, desto större bit! ' : 'Ju fler delar, desto mindre bit! ') + task.answer.name + ' är ' + word + '.',
          item: level.name,
          choiceClass: 'word-tile',
          choices: task.picked.map(f => ({
            label: f.name, correct: f === task.answer,
            content: [el('span', { class: 'tile-up frac', text: f.sign }), el('span', { class: 'tile-word', text: f.name })]
          }))
        };
      }
      const [emoji, plural] = task.thing;
      const gap = T.slot();
      const help = groups(task.f, task.total, emoji);
      const question = 'Vad är ' + task.f.name + ' av ' + task.total + ' ' + plural + '?';
      return {
        prompt: el('div', { class: 'fact-task' }, [
          el('div', { class: 'read-sentence' }, [task.f.sign + ' av ' + task.total + ' = ', gap]),
          help,
          el('p', { class: 'muted', text: question })
        ]),
        say: question,
        praise: task.f.name.charAt(0).toUpperCase() + task.f.name.slice(1) + ' av ' + task.total + ' är ' + task.answer + '!',
        item: level.name,
        help,
        choiceClass: 'num-tile',
        choices: T.numberOptions(task.answer, 4, 1, 40, [task.total - task.answer, task.answer * 2, task.f.n]),
        onRight: () => gap.fill(task.answer)
      };
    }
  });
})();
