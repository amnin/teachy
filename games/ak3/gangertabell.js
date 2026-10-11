/*
 * Multiplikation och division – tabellerna 2 till 10.
 * Under "Visa hjälp" finns tabellen som hopp på en tallinje (räkna i hopp).
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const LEVELS = [
    { name: '2, 5 och 10', icon: '✋', sub: '6 · 5 = ?', tables: [2, 5, 10], kind: 'mul' },
    { name: '3 och 4', icon: '🍀', sub: '7 · 4 = ?', tables: [3, 4], kind: 'mul' },
    { name: '6 till 9', icon: '🚀', sub: '8 · 7 = ?', tables: [6, 7, 8, 9], kind: 'mul' },
    { name: 'Division', icon: '➗', sub: '24 / 6 = ?', tables: [2, 3, 4, 5, 6, 10], kind: 'div' },
    { name: 'Hemligt tal', icon: '🦅', sub: '? · 6 = 42', tables: [3, 4, 5, 6, 7, 8, 9], kind: 'missing' }
  ];

  // Talen i tabellen: 4, 8, 12, … – som stöd för att "räkna i hopp"
  function skipCount(table, upTo) {
    return el('div', { class: 'skip-count' }, Array.from({ length: upTo }, (_, i) =>
      el('span', { text: (i + 1) * table })));
  }

  T.quizGame({
    id: 'gangertabell',
    title: 'Gångertabellen',
    grade: 3,
    subject: 'Matematik',
    icon: '✖️',
    color: '#ffb627',
    description: 'Multiplikation och division.',
    intro: 'Gånger är upprepad addition: 3 · 4 = 4 + 4 + 4. Division är tvärtom – 12 delat med 4 är 3, för 3 · 4 = 12.',
    hint: 'Räkna ut svaret',
    levels: LEVELS,
    makeTasks: (level, n) => {
      const tasks = [];
      for (let tries = 0; tasks.length < n && tries < 300; tries++) {
        const table = T.pick(level.tables);
        const times = T.rand(2, 10);
        if (!tasks.some(t => t.table === table && t.times === times)) tasks.push({ table, times, product: table * times });
      }
      return tasks;
    },
    report: { title: 'Tabeller', keys: LEVELS.map(l => l.name) },
    render: (task, level) => {
      const gap = T.slot();
      const { table, times, product } = task;
      const help = skipCount(table, Math.max(times, 10));
      let parts, say, answer, praise;
      if (level.kind === 'mul') {
        parts = [times + ' · ' + table + ' = ', gap];
        say = times + ' gånger ' + table;
        answer = product;
        praise = times + ' gånger ' + table + ' är ' + product + '!';
      } else if (level.kind === 'div') {
        parts = [product + ' / ' + table + ' = ', gap];
        say = product + ' delat med ' + table;
        answer = times;
        praise = product + ' delat med ' + table + ' är ' + times + ', för ' + times + ' gånger ' + table + ' är ' + product + '!';
      } else {
        parts = [gap, ' · ' + table + ' = ' + product];
        say = 'Hur många gånger ' + table + ' är ' + product + '?';
        answer = times;
        praise = times + ' gånger ' + table + ' är ' + product + '!';
      }
      return {
        prompt: el('div', { class: 'fact-task' }, [el('div', { class: 'read-sentence big-math' }, parts), help]),
        say,
        praise,
        item: level.name,
        help,
        choiceClass: 'num-tile',
        choices: T.numberOptions(answer, 4, 0, 100, [answer + 1, answer - 1, answer + table, answer - table]),
        onRight: () => gap.fill(answer)
      };
    }
  });
})();
