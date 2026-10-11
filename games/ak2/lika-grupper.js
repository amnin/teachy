/*
 * Lika grupper – multiplikation som upprepad addition: 3 + 3 + 3 = 3 · 3.
 * Bilder på grupperna finns bakom "Visa hjälp".
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const THINGS = ['🍎', '⭐', '🐞', '🍪', '🌸', '🐟', '🎈'];
  const LEVELS = [
    { name: 'Upprepad addition', icon: '➕', sub: '2 + 2 + 2 = ?', tables: [2, 3, 5], times: [2, 5], kind: 'add' },
    { name: '2, 5 och 10', icon: '✖️', sub: '4 · 5 = ?', tables: [2, 5, 10], times: [1, 10], kind: 'mul' },
    { name: '3 och 4', icon: '🦅', sub: '6 · 3 = ?', tables: [3, 4], times: [1, 10], kind: 'mul' }
  ];

  function groups(count, size, thing) {
    return el('div', { class: 'groups' }, Array.from({ length: count }, () =>
      el('span', { class: 'group', text: thing.repeat(size) })));
  }

  T.quizGame({
    id: 'lika-grupper',
    title: 'Lika grupper',
    grade: 2,
    subject: 'Matematik',
    icon: '✖️',
    color: '#ffb627',
    description: 'Multiplikation – lika många i varje grupp.',
    intro: 'Tre grupper med fyra i varje är 4 + 4 + 4. Det kan också skrivas 3 · 4 – tre gånger fyra.',
    hint: 'Hur många blir det?',
    levels: LEVELS,
    makeTasks: (level, n) => {
      const tasks = [];
      for (let tries = 0; tasks.length < n && tries < 200; tries++) {
        const size = T.pick(level.tables);
        const count = T.rand(level.times[0], level.times[1]);
        if (!tasks.some(t => t.size === size && t.count === count)) tasks.push({ size, count, answer: size * count });
      }
      return tasks;
    },
    report: { title: 'Gånger', keys: LEVELS.map(l => l.name) },
    render: (task, level) => {
      const gap = T.slot();
      const help = groups(task.count, task.size, T.pick(THINGS));
      const equation = level.kind === 'add'
        ? Array(task.count).fill(task.size).join(' + ')
        : task.count + ' · ' + task.size;
      return {
        prompt: el('div', { class: 'fact-task' }, [
          help,
          el('div', { class: 'read-sentence' }, [equation + ' = ', gap])
        ]),
        say: level.kind === 'add'
          ? Array(task.count).fill(task.size).join(' plus ')
          : task.count + ' gånger ' + task.size,
        praise: task.count + ' gånger ' + task.size + ' är ' + task.answer + '!',
        item: level.name,
        help,
        choiceClass: 'num-tile',
        choices: T.numberOptions(task.answer, 4, 0, 100,
          [task.answer + task.size, task.answer - task.size, task.size + task.count]),
        onRight: () => gap.fill(task.answer)
      };
    }
  });
})();
