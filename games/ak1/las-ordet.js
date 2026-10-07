/*
 * Läs ordet – ett skrivet ord visas, tryck på bilden som passar.
 * Ordet läses INTE upp – barnet ska ljuda eller känna igen det själv.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;
  const WORDS = T.data.words;

  const first = w => w.word.charAt(0);
  const sameStartCount = w => WORDS.filter(o => first(o) === first(w)).length;
  const lengthKey = word => (word.length >= 6 ? '6+' : String(word.length));

  const LEVELS = [
    { name: 'Korta ord', icon: '🐣', sub: '2–3 bokstäver', filter: w => w.word.length <= 3, others: 'different' },
    { name: 'Längre ord', icon: '🐥', sub: '4–5 bokstäver', filter: w => w.word.length >= 4 && w.word.length <= 5, others: 'any' },
    // Alla bilder börjar på samma bokstav – då måste man läsa hela ordet
    { name: 'Läs noga', icon: '🦅', sub: 'Orden börjar likadant', filter: w => sameStartCount(w) >= 3, others: 'same' }
  ];

  function makeTasks(level, n) {
    return T.sample(WORDS.filter(level.filter), n).map(word => {
      const rest = WORDS.filter(w => w !== word);
      const pool = level.others === 'same' ? rest.filter(w => first(w) === first(word))
        : level.others === 'different' ? rest.filter(w => first(w) !== first(word))
        : rest;
      return { word, options: T.shuffle([word, ...T.sample(pool, 2)]) };
    });
  }

  T.quizGame({
    id: 'las-ordet',
    title: 'Läs ordet',
    grade: 1,
    subject: 'Svenska',
    icon: '📖',
    color: '#ff8a3d',
    description: 'Läs ordet och hitta rätt bild.',
    intro: 'Läs ordet – ljuda om du behöver. Tryck sedan på bilden som passar!',
    hint: 'Läs ordet. Vilken bild passar?',
    levels: LEVELS,
    makeTasks,
    report: { title: 'Ordlängd (antal bokstäver)', keys: ['2', '3', '4', '5', '6+'] },
    render: task => ({
      prompt: el('div', { class: 'read-word', text: task.word.word }),
      say: 'Läs ordet. Vilken bild passar?',
      praise: task.word.word + '!',
      item: lengthKey(task.word.word),
      choiceClass: 'emoji-tile',
      choices: task.options.map(o => ({
        label: o.emoji,
        correct: o === task.word,
        content: el('span', { class: 'tile-emoji', text: o.emoji })
      }))
    })
  });
})();
