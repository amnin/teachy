/*
 * Räkna till 100 – plus och minus med tiotal och ental. Under "Visa hjälp"
 * finns en räknestrategi: dela upp talet och ta tiotalen först.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const LEVELS = [
    { name: 'Hela tiotal', icon: '🔟', sub: '30 + 40, 90 − 20', kind: 'tens' },
    { name: 'Utan tiotalsövergång', icon: '🧮', sub: '34 + 5, 47 − 3', kind: 'easy' },
    { name: 'Med tiotalsövergång', icon: '🚀', sub: '38 + 5, 42 − 7', kind: 'cross' },
    { name: 'Tvåsiffrigt', icon: '🦅', sub: '36 + 25, 64 − 28', kind: 'two' }
  ];

  const SIGN = { '+': '+', '-': '−' };
  const WORD = { '+': 'plus', '-': 'minus' };

  function makeTask(kind) {
    const op = T.pick(['+', '-']);
    let a, b;
    if (kind === 'tens') {
      a = T.rand(1, 9) * 10; b = T.rand(1, 9) * 10;
      if (op === '+' && a + b > 100) b = 100 - a || 10;
    } else if (kind === 'easy') {
      a = T.rand(1, 9) * 10 + T.rand(1, 8);
      b = op === '+' ? T.rand(1, 9 - (a % 10)) : T.rand(1, a % 10);
    } else if (kind === 'cross') {
      a = T.rand(1, 8) * 10 + T.rand(1, 8);
      b = op === '+' ? T.rand(10 - (a % 10), 9) : T.rand(a % 10 + 1, 9);
    } else {
      a = T.rand(20, 89); b = T.rand(11, op === '+' ? 99 - a : a - 1);
    }
    if (op === '-' && b > a) [a, b] = [b, a];
    if (op === '+' && a + b > 100) return makeTask(kind);
    if (b <= 0) return makeTask(kind);
    return { a, b, op, answer: op === '+' ? a + b : a - b };
  }

  // Räknestrategi: dela upp det andra talet i tiotal och ental, eller räkna via jämnt tiotal
  function strategy(t) {
    const s = SIGN[t.op];
    const tens = Math.floor(t.b / 10) * 10, ones = t.b % 10;
    if (tens && ones) {
      const mid = t.op === '+' ? t.a + tens : t.a - tens;
      return [t.a + ' ' + s + ' ' + tens + ' = ' + mid, mid + ' ' + s + ' ' + ones + ' = ?'];
    }
    if (!tens) {
      const toTen = t.op === '+' ? 10 - (t.a % 10) : t.a % 10;
      if (toTen && toTen < t.b) {
        const mid = t.op === '+' ? t.a + toTen : t.a - toTen;
        return [t.a + ' ' + s + ' ' + toTen + ' = ' + mid, mid + ' ' + s + ' ' + (t.b - toTen) + ' = ?'];
      }
      return ['Räkna ental: ' + (t.a % 10) + ' ' + s + ' ' + t.b];
    }
    return ['Räkna tiotalen: ' + Math.floor(t.a / 10) + ' ' + s + ' ' + (tens / 10) + ' tiotal', 'Entalen är kvar: ' + (t.a % 10)];
  }

  T.quizGame({
    id: 'rakna-100',
    title: 'Räkna till 100',
    grade: 2,
    subject: 'Matematik',
    icon: '💯',
    color: '#2bb673',
    description: 'Plus och minus med tiotal och ental.',
    intro: 'Dela upp talen i tiotal och ental – då blir det lättare! Fastnar du finns det hjälp.',
    hint: 'Räkna ut svaret',
    levels: LEVELS,
    makeTasks: (level, n) => {
      const tasks = [];
      while (tasks.length < n) {
        const t = makeTask(level.kind);
        if (!tasks.some(o => o.a === t.a && o.b === t.b && o.op === t.op)) tasks.push(t);
      }
      return tasks;
    },
    report: { title: 'Räknesätt', keys: LEVELS.map(l => l.name) },
    render: (task, level) => {
      const gap = T.slot();
      const help = el('div', { class: 'strategy' }, strategy(task).map(line => el('div', { text: line })));
      return {
        prompt: el('div', { class: 'fact-task' }, [
          el('div', { class: 'math-equation small' }, [
            el('span', { text: task.a }), el('span', { class: 'math-op', text: SIGN[task.op] }),
            el('span', { text: task.b }), el('span', { class: 'math-op', text: '=' }), gap
          ]),
          help
        ]),
        say: task.a + ' ' + WORD[task.op] + ' ' + task.b,
        praise: task.a + ' ' + WORD[task.op] + ' ' + task.b + ' är ' + task.answer + '!',
        item: level.name,
        help,
        choiceClass: 'num-tile',
        choices: T.numberOptions(task.answer, 4, 0, 100,
          [task.answer + 10, task.answer - 10, task.answer + 1, task.answer - 1]),
        onRight: () => gap.fill(task.answer)
      };
    }
  });
})();
