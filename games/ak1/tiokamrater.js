/*
 * Tiokamrater – hur talen delas upp. Femram/tioram och "gömda" saker i korgen.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const LEVELS = [
    { key: 5, name: 'Femkamrater', icon: '🖐️', sub: '3 + ? = 5' },
    { key: 10, name: 'Tiokamrater', icon: '🙌', sub: '7 + ? = 10' },
    { key: 'hidden', name: 'Gömda i korgen', icon: '🧺', sub: 'Hur många är gömda?' }
  ];

  const THINGS = [['🥚', 'ägg'], ['🍎', 'äpplen'], ['⚽', 'bollar'], ['🐥', 'kycklingar'], ['🍓', 'jordgubbar']];

  // Fem- eller tioram: rutor där de första är fyllda
  function frame(total, filled) {
    return el('div', { class: 'ten-frame', style: '--cols:5' },
      Array.from({ length: total }, (_, i) => el('span', { class: i < filled ? 'filled' : '' })));
  }

  function makeTask(level) {
    if (level.key === 'hidden') {
      const total = T.rand(4, 10);
      const shown = T.rand(1, total - 1);
      return { total, shown, answer: total - shown, thing: T.pick(THINGS) };
    }
    const shown = T.rand(1, level.key - 1);
    return { total: level.key, shown, answer: level.key - shown };
  }

  T.quizGame({
    id: 'tiokamrater',
    title: 'Tiokamrater',
    grade: 1,
    subject: 'Matematik',
    icon: '🔟',
    color: '#ffb627',
    description: 'Hur många saknas till 5 eller 10?',
    intro: 'Tiokamrater är två tal som blir 10 tillsammans – som 7 och 3. Hur många saknas?',
    hint: level => (level.key === 'hidden' ? 'Hur många är gömda i korgen?' : 'Hur många saknas?'),
    levels: LEVELS,
    makeTasks: (level, n) => {
      const tasks = [];
      while (tasks.length < n) {
        const task = makeTask(level);
        if (!tasks.length || tasks[tasks.length - 1].shown !== task.shown) tasks.push(task);
      }
      return tasks;
    },
    report: {
      title: 'Kamrater',
      keys: ['1+4', '2+3', '3+2', '4+1', '1+9', '2+8', '3+7', '4+6', '5+5', '6+4', '7+3', '8+2', '9+1', 'Gömda']
    },
    render: (task, level) => {
      const gap = T.slot();
      if (level.key === 'hidden') {
        const [emoji, plural] = task.thing;
        return {
          prompt: el('div', { class: 'hidden-task' }, [
            el('p', { class: 'read-sentence', text: 'Det är ' + task.total + ' ' + plural + '.' }),
            el('div', { class: 'hidden-row' }, [
              el('span', { class: 'hidden-things', text: emoji.repeat(task.shown) }),
              el('span', { class: 'plus', text: '+' }),
              el('span', { class: 'basket' }, ['🧺', gap])
            ])
          ]),
          say: 'Det är ' + task.total + ' ' + plural + '. ' + task.shown + ' syns. Hur många är gömda i korgen?',
          praise: task.shown + ' och ' + task.answer + ' blir ' + task.total + '!',
          item: 'Gömda',
          choiceClass: 'num-tile',
          choices: T.numberOptions(task.answer, 4, 1, 10, [task.shown, task.total]),
          onRight: () => gap.fill(task.answer)
        };
      }
      return {
        prompt: el('div', { class: 'frame-task' }, [
          frame(task.total, task.shown),
          el('div', { class: 'math-equation small' }, [
            el('span', { text: task.shown }), el('span', { class: 'math-op', text: '+' }), gap,
            el('span', { class: 'math-op', text: '=' }), el('span', { text: task.total })
          ])
        ]),
        say: task.shown + ' plus hur många blir ' + task.total + '?',
        praise: task.shown + ' och ' + task.answer + ' är ' + (task.total === 10 ? 'tiokamrater!' : 'femkamrater!'),
        item: task.shown + '+' + task.answer,
        choiceClass: 'num-tile',
        choices: T.numberOptions(task.answer, task.total === 5 ? 3 : 4, 0, task.total, [task.shown, task.total]),
        onRight: () => gap.fill(task.answer)
      };
    }
  });
})();
