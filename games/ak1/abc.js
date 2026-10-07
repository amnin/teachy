/*
 * ABC – alfabetet och alfabetisk ordning.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ'.split('');

  const LEVELS = [
    { key: 'Efter', name: 'Vilken kommer efter?', icon: '➡️', sub: 'D E F …' },
    { key: 'Före', name: 'Vilken kommer före?', icon: '⬅️', sub: '… E F G' },
    { key: 'Saknas', name: 'Vilken saknas?', icon: '❓', sub: 'D … F' },
    { key: 'Ordning', name: 'Vilket ord kommer först?', icon: '🔤', sub: 'Ord i bokstavsordning' }
  ];

  function letterTile(letter) {
    return [
      el('span', { class: 'tile-up', text: letter }),
      el('span', { class: 'tile-low', text: letter.toLocaleLowerCase('sv-SE') })
    ];
  }

  // Felsvar: bokstäver som står nära i alfabetet
  function letterOptions(answer) {
    const i = ABC.indexOf(answer);
    const near = ABC.filter((l, j) => l !== answer && Math.abs(j - i) <= 3);
    return T.shuffle([answer, ...T.sample(near, 2)]);
  }

  function makeLetterTask(level) {
    // Visa tre bokstäver i rad där en är dold
    const start = T.rand(0, ABC.length - 3);
    const row = ABC.slice(start, start + 3);
    const hidden = { Efter: 2, Före: 0, Saknas: 1 }[level.key];
    const answer = row[hidden];
    const say = level.key === 'Efter' ? 'Vilken bokstav kommer efter ' + row[1] + '?'
      : level.key === 'Före' ? 'Vilken bokstav kommer före ' + row[1] + '?'
      : 'Vilken bokstav saknas mellan ' + row[0] + ' och ' + row[2] + '?';
    return { row, hidden, answer, say, options: letterOptions(answer) };
  }

  function makeWordTask() {
    // Tre ord som börjar på olika bokstäver
    const words = [];
    for (const w of T.shuffle(T.data.words)) {
      if (!words.some(o => o.word[0] === w.word[0])) words.push(w);
      if (words.length === 3) break;
    }
    const answer = words.slice().sort((a, b) => a.word.localeCompare(b.word, 'sv'))[0];
    return { words, answer };
  }

  function renderLetters(task) {
    const gap = T.slot();
    return {
      prompt: el('div', { class: 'letter-row' }, task.row.map((l, i) => (i === task.hidden ? gap : el('span', { text: l })))),
      say: task.say,
      praise: task.answer + '!',
      choiceClass: 'letter-tile',
      choices: task.options.map(l => ({ label: l, correct: l === task.answer, content: letterTile(l) })),
      onRight: () => gap.fill(task.answer)
    };
  }

  function renderWords(task) {
    return {
      prompt: el('div', { class: 'read-sentence', text: 'Vilket ord kommer först i ABC?' }),
      say: 'Vilket ord kommer först i alfabetet? ' + T.orList(task.words.map(w => w.word)) + '?',
      praise: task.answer.word + ' börjar på ' + task.answer.word[0].toUpperCase() + '. Det kommer först!',
      choiceClass: 'pic-tile',
      choices: task.words.map(w => ({
        label: w.word,
        correct: w === task.answer,
        content: [
          el('span', { class: 'tile-emoji', text: w.emoji }),
          el('span', { class: 'tile-word' }, [el('strong', { text: w.word[0] }), w.word.slice(1)])
        ]
      }))
    };
  }

  T.quizGame({
    id: 'abc',
    title: 'ABC',
    grade: 1,
    subject: 'Svenska',
    icon: '🔤',
    color: '#2bb673',
    description: 'Alfabetet och bokstavsordning.',
    intro: 'Kan du alfabetet? A, B, C, D … ända till Ö!',
    levels: LEVELS,
    makeTasks: (level, n) => Array.from({ length: n }, () =>
      (level.key === 'Ordning' ? makeWordTask() : makeLetterTask(level))),
    report: { title: 'Alfabetet', keys: LEVELS.map(l => l.key) },
    render: (task, level) => Object.assign(
      { item: level.key },
      level.key === 'Ordning' ? renderWords(task) : renderLetters(task)
    )
  });
})();
