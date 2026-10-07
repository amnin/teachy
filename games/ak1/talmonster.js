/*
 * Talmönster – vilket tal kommer sen? 2, 4, 6, ?
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const LEVELS = [
    { name: 'Hoppa 1 och 2', icon: '🐣', sub: '3, 4, 5, ?', steps: [1, 2, -1] },
    { name: 'Hoppa 5 och 10', icon: '🐥', sub: '10, 20, 30, ?', steps: [5, 10] },
    { name: 'Blandat', icon: '🦅', sub: '18, 16, 14, ?', steps: [2, 3, 5, 10, -2, -10], gapAnywhere: true }
  ];

  const stepKey = step => (step > 0 ? '+' : '−') + Math.abs(step);

  function makeTask(level) {
    const step = T.pick(level.steps);
    const length = 5;
    // Startvärde så att alla tal hamnar mellan 0 och 100. Hopp på 5 och 10
    // börjar på jämna tal (5, 10, 15 ...), och nedåthopp börjar högre upp.
    const span = Math.abs(step) * (length - 1);
    let start = Math.abs(step) >= 5
      ? T.rand(0, Math.floor((100 - span) / Math.abs(step))) * Math.abs(step)
      : T.rand(0, Math.min(30, 100 - span));
    if (step < 0) start += span;
    const numbers = Array.from({ length }, (_, i) => start + i * step);
    const hidden = level.gapAnywhere ? T.rand(1, length - 1) : length - 1;
    return { numbers, hidden, answer: numbers[hidden], step };
  }

  T.quizGame({
    id: 'talmonster',
    title: 'Talmönster',
    grade: 1,
    subject: 'Matematik',
    icon: '🔢',
    color: '#06a77d',
    description: 'Hitta mönstret i talen.',
    intro: 'Talen hoppar lika långt varje gång. Hur långt hoppar de – och vilket tal kommer sen?',
    hint: 'Vilket tal saknas?',
    levels: LEVELS,
    makeTasks: (level, n) => Array.from({ length: n }, () => makeTask(level)),
    report: { title: 'Hopp', keys: ['+1', '+2', '+3', '+5', '+10', '−1', '−2', '−10'] },
    render: task => {
      const gap = T.slot();
      const s = task.step;
      return {
        prompt: el('div', { class: 'number-row' }, task.numbers.map((n, i) => (i === task.hidden ? gap : el('span', { text: n })))),
        say: task.numbers.map((n, i) => (i === task.hidden ? 'vad' : n)).join(', ') + '. Vilket tal saknas?',
        praise: 'Talen hoppar ' + (s > 0 ? 'upp ' : 'ner ') + Math.abs(s) + ' varje gång!',
        item: stepKey(s),
        choiceClass: 'num-tile',
        choices: T.numberOptions(task.answer, 4, 0, 100, [task.answer + 1, task.answer - 1, task.answer + s, task.answer - s]),
        onRight: () => gap.fill(task.answer)
      };
    }
  });
})();
