/*
 * Bygg ordet – en bild visas och ordet läses upp. Tryck på bokstäverna i rätt ordning.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const lengthKey = word => (word.length >= 6 ? '6+' : String(word.length));

  const LEVELS = [
    { name: 'Korta ord', icon: '🐣', sub: '2–3 bokstäver', filter: w => w.word.length <= 3 },
    { name: 'Mellanlånga ord', icon: '🐥', sub: '4–5 bokstäver', filter: w => w.word.length >= 4 && w.word.length <= 5 },
    { name: 'Långa ord', icon: '🦅', sub: '6 bokstäver eller fler', filter: w => w.word.length >= 6 }
  ];

  T.orderGame({
    id: 'bygg-ordet',
    title: 'Bygg ordet',
    grade: 1,
    subject: 'Svenska',
    icon: '✏️',
    color: '#f15bb5',
    description: 'Stava ordet med bokstäverna.',
    intro: 'Lyssna på ordet och titta på bilden. Tryck på bokstäverna i rätt ordning!',
    hint: 'Tryck på bokstäverna i rätt ordning',
    levels: LEVELS,
    makeTasks: (level, n) => T.sample(T.data.words.filter(level.filter), n),
    report: { title: 'Ordlängd (antal bokstäver)', keys: ['2', '3', '4', '5', '6+'] },
    render: word => ({
      prompt: el('span', { class: 'quiz-emoji', text: word.emoji }),
      say: word.word,
      praise: word.word + '! ' + [...word.word].join(', '),
      item: lengthKey(word.word),
      steps: [...word.word].map(letter => ({ label: letter, text: letter }))
    })
  });
})();
