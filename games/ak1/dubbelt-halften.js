/*
 * Dubbelt och hälften – med bilder att räkna på.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const THINGS = [['🍎', 'äpplen'], ['⭐', 'stjärnor'], ['🐞', 'nyckelpigor'], ['🍪', 'kakor'], ['🎈', 'ballonger']];

  const LEVELS = [
    { name: 'Dubbelt', icon: '✌️', sub: 'Dubbelt så många som 3', kinds: ['dubbelt'], max: 5 },
    { name: 'Hälften', icon: '✂️', sub: 'Hälften av 8', kinds: ['hälften'], max: 5 },
    { name: 'Blandat till 20', icon: '🦅', sub: 'Dubbelt och hälften', kinds: ['dubbelt', 'hälften'], max: 10, noPictures: true }
  ];

  function makeTasks(level, n) {
    const tasks = [];
    let last = null;
    while (tasks.length < n) {
      const kind = T.pick(level.kinds);
      const half = T.rand(1, level.max);
      if (kind + half === last) continue;
      last = kind + half;
      tasks.push(kind === 'dubbelt'
        ? { kind, given: half, answer: half * 2, thing: T.pick(THINGS) }
        : { kind, given: half * 2, answer: half, thing: T.pick(THINGS) });
    }
    return tasks;
  }

  T.quizGame({
    id: 'dubbelt-halften',
    title: 'Dubbelt och hälften',
    grade: 1,
    subject: 'Matematik',
    icon: '✌️',
    color: '#f15bb5',
    description: 'Dubbelt så många – eller hälften så många?',
    intro: 'Dubbelt betyder två gånger så många. Hälften betyder att man delar i två lika stora delar.',
    levels: LEVELS,
    makeTasks,
    report: { title: 'Räknesätt', keys: ['Dubbelt', 'Hälften'] },
    render: (task, level) => {
      const [emoji, plural] = task.thing;
      const gap = T.slot();
      const what = level.noPictures ? '' : ' ' + plural;
      const question = task.kind === 'dubbelt'
        ? 'Vad är dubbelt så många som ' + task.given + what + '?'
        : 'Vad är hälften av ' + task.given + what + '?';
      return {
        prompt: el('div', { class: 'double-task' }, [
          level.noPictures ? null : el('div', { class: 'double-things' }, [el('span', { text: emoji.repeat(task.given) })]),
          el('div', { class: 'read-sentence' }, [
            el('span', { text: task.kind === 'dubbelt' ? 'Dubbelt så många som ' + task.given + ' är ' : 'Hälften av ' + task.given + ' är ' }),
            gap
          ])
        ]),
        say: question,
        praise: task.kind === 'dubbelt'
          ? task.given + ' och ' + task.given + ' blir ' + task.answer + '!'
          : task.answer + ' och ' + task.answer + ' blir ' + task.given + '!',
        item: task.kind === 'dubbelt' ? 'Dubbelt' : 'Hälften',
        choiceClass: 'num-tile',
        choices: T.numberOptions(task.answer, 4, 0, 20, [task.given, task.given + 2, task.answer + 1, task.answer - 1]),
        onRight: () => gap.fill(task.answer)
      };
    }
  });
})();
