/*
 * Gömt tal – likhetstecknet och obekanta tal: 5 + ▢ = 8, och vågen 3 + 4 = ▢ + 2.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const LEVELS = [
    { name: 'Plus till 10', icon: '➕', sub: '5 + ? = 8', ops: ['+'], max: 10 },
    { name: 'Minus till 10', icon: '➖', sub: '9 − ? = 6', ops: ['-'], max: 10 },
    { name: 'Plus och minus till 20', icon: '🚀', sub: '? + 7 = 15', ops: ['+', '-'], max: 20 },
    { name: 'Vågen', icon: '⚖️', sub: '3 + 4 = ? + 2', balance: true, max: 10 }
  ];

  const SIGN = { '+': '+', '-': '−' };
  const WORD = { '+': 'plus', '-': 'minus' };

  // En uppgift är en lista av "delar": tal, tecken eller luckan (null)
  function makeTask(level) {
    if (level.balance) {
      const sum = T.rand(4, level.max);
      const a = T.rand(1, sum - 1);
      const c = T.rand(1, sum - 1);
      return { parts: [a, '+', sum - a, '=', null, '+', c], answer: sum - c };
    }
    const op = T.pick(level.ops);
    let a, b, c;
    if (op === '+') {
      c = T.rand(2, level.max);
      a = T.rand(1, c - 1);
      b = c - a;
    } else {
      a = T.rand(2, level.max);
      b = T.rand(1, a - 1);
      c = a - b;
    }
    const parts = [a, op, b, '=', c];
    const hide = T.pick([0, 2]); // dölj första eller andra talet
    const answer = parts[hide];
    parts[hide] = null;
    return { parts, answer };
  }

  T.quizGame({
    id: 'gomt-tal',
    title: 'Gömt tal',
    grade: 1,
    subject: 'Matematik',
    icon: '🎁',
    color: '#9b5de5',
    description: 'Vilket tal gömmer sig i rutan?',
    intro: 'Likhetstecknet = betyder att det är lika mycket på båda sidor. Vilket tal är gömt?',
    hint: level => (level.balance ? 'Vågen ska väga lika – vilket tal saknas?' : 'Vilket tal är gömt?'),
    levels: LEVELS,
    makeTasks: (level, n) => Array.from({ length: n }, () => makeTask(level)),
    report: { title: 'Uppgifter', keys: LEVELS.map(l => l.name) },
    render: (task, level) => {
      const gap = T.slot();
      const shown = task.parts.map(p => (p === null ? gap
        : typeof p === 'number' ? el('span', { text: p })
        : el('span', { class: 'math-op', text: SIGN[p] || p })));
      const spoken = task.parts.map(p => (p === null ? 'något' : WORD[p] || (p === '=' ? 'är lika med' : p))).join(' ');
      const solved = task.parts.map(p => (p === null ? task.answer : SIGN[p] || p)).join(' ');
      return {
        prompt: el('div', { class: 'math-equation' + (level.balance ? ' balance' : '') },
          level.balance ? [el('span', { class: 'balance-icon', text: '⚖️' }), ...shown] : shown),
        say: spoken + '. Vilket tal är gömt?',
        praise: solved.replace(/\+/g, 'plus').replace(/−/g, 'minus').replace('=', 'är lika med'),
        item: level.name,
        choiceClass: 'num-tile',
        choices: T.numberOptions(task.answer, 4, 0, level.max, task.parts.filter(p => typeof p === 'number')),
        onRight: () => gap.fill(task.answer)
      };
    }
  });
})();
