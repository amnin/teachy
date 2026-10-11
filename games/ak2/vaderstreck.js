/*
 * Väderstreck – norr, söder, öster och väster på en enkel karta.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const PLACES = [['🏫', 'skolan'], ['🌲', 'skogen'], ['🏖️', 'stranden'], ['🏪', 'affären'], ['🛝', 'lekplatsen'],
    ['🏠', 'huset'], ['⛪', 'kyrkan'], ['🏥', 'sjukhuset'], ['⚽', 'fotbollsplanen']];

  // Rutans plats i ett 3 × 3-rutnät: [rad, kolumn]
  const DIRS = { norr: [0, 1], söder: [2, 1], öster: [1, 2], väster: [1, 0] };
  const OPPOSITE = { norr: 'söder', söder: 'norr', öster: 'väster', väster: 'öster' };

  const LEVELS = [
    { name: 'Vad ligger var?', icon: '🧭', sub: 'Vad ligger norr om skolan?', kind: 'what' },
    { name: 'Åt vilket håll?', icon: '🗺️', sub: 'Från skolan till affären', kind: 'way' },
    { name: 'Vänd på det', icon: '🦅', sub: 'Från stranden till skolan', kind: 'back' }
  ];

  function makeTask(kind) {
    const [center, ...rest] = T.shuffle(PLACES);
    const around = {};
    Object.keys(DIRS).forEach((dir, i) => { around[dir] = rest[i]; });
    const dir = T.pick(Object.keys(DIRS));
    return { kind, center, around, dir };
  }

  function map(task) {
    const cells = Array.from({ length: 9 }, () => el('span', { class: 'map-cell' }));
    cells[4].append(el('span', { class: 'map-emoji', text: task.center[0] }), el('span', { class: 'map-name', text: task.center[1] }));
    cells[4].classList.add('center');
    Object.entries(DIRS).forEach(([dir, [r, c]]) => {
      const [emoji, name] = task.around[dir];
      cells[r * 3 + c].append(el('span', { class: 'map-emoji', text: emoji }), el('span', { class: 'map-name', text: name }));
    });
    return el('div', { class: 'map-wrap' }, [
      el('div', { class: 'map' }, cells),
      el('div', { class: 'compass', 'aria-label': 'Kompass' }, [
        el('span', { class: 'compass-n', text: 'N' }), el('span', { class: 'compass-v', text: 'V' }),
        el('span', { class: 'compass-arrow', text: '✛' }), el('span', { class: 'compass-o', text: 'Ö' }),
        el('span', { class: 'compass-s', text: 'S' })
      ])
    ]);
  }

  const dirChoices = right => Object.keys(DIRS).map(dir => ({
    label: dir, correct: dir === right, content: el('span', { class: 'tile-word', text: dir })
  }));

  T.quizGame({
    id: 'vaderstreck',
    title: 'Väderstreck',
    grade: 2,
    subject: 'SO',
    icon: '🧭',
    color: '#3a86ff',
    description: 'Norr, söder, öster och väster.',
    intro: 'På en karta är norr uppåt, söder nedåt, öster åt höger och väster åt vänster. Kom ihåg: N uppe, S nere – och V och Ö som "VÖ" från vänster till höger.',
    hint: 'Titta på kartan',
    levels: LEVELS,
    makeTasks: (level, n) => Array.from({ length: n }, () => makeTask(level.kind)),
    report: { title: 'Väderstreck', keys: LEVELS.map(l => l.name) },
    render: (task, level) => {
      const target = task.around[task.dir];
      let question, choices, praise, choiceClass = 'word-tile';
      if (task.kind === 'what') {
        question = 'Vad ligger ' + task.dir + ' om ' + task.center[1] + '?';
        choices = T.sample(Object.keys(DIRS).filter(d => d !== task.dir), 2).map(d => task.around[d]).concat([target])
          .sort(() => Math.random() - 0.5)
          .map(p => ({ label: p[1], correct: p === target, content: [el('span', { class: 'tile-emoji', text: p[0] }), el('span', { class: 'tile-word', text: p[1] })] }));
        choiceClass = 'pic-tile';
        praise = cap(target[1]) + ' ligger ' + task.dir + ' om ' + task.center[1] + '!';
      } else if (task.kind === 'way') {
        question = 'Åt vilket håll går du från ' + task.center[1] + ' till ' + target[1] + '?';
        choices = dirChoices(task.dir);
        praise = 'Du går åt ' + task.dir + '!';
      } else {
        question = 'Du är vid ' + target[1] + '. Åt vilket håll går du till ' + task.center[1] + '?';
        choices = dirChoices(OPPOSITE[task.dir]);
        praise = 'Du går åt ' + OPPOSITE[task.dir] + '!';
      }
      return {
        prompt: el('div', { class: 'fact-task' }, [map(task), el('p', { class: 'read-sentence', text: question })]),
        say: question + ' ' + T.orList(choices.map(c => c.label)) + '?',
        retry: question,
        praise,
        item: level.name,
        choiceClass,
        choices
      };
    }
  });

  function cap(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
})();
