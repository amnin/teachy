/*
 * Punkt och stor bokstav – skiljetecken och stor bokstav i namn.
 * Meningen läses upp med rätt tonfall, som stöd för att höra om det är en fråga.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const SENTENCES = {
    '.': ['Jag har en katt', 'Solen skiner idag', 'Vi ska äta pannkakor', 'Hunden springer i parken',
      'Det regnar ute', 'Mamma läser en bok', 'Jag tycker om glass', 'Bussen är gul'],
    '?': ['Vad heter du', 'Vill du leka med mig', 'Var bor du', 'Är det din boll',
      'Hur gammal är du', 'Har du sett min mössa', 'Vad ska vi äta', 'Kan du simma'],
    '!': ['Akta dig', 'Vad roligt', 'Hjälp mig', 'Titta, en regnbåge',
      'Grattis på födelsedagen', 'Stopp']
  };
  const MARKS = {
    '.': { name: 'punkt', item: 'Punkt' },
    '?': { name: 'frågetecken', item: 'Frågetecken' },
    '!': { name: 'utropstecken', item: 'Utropstecken' }
  };

  // Meningar med ett namn som ska ha stor bokstav
  const NAMES = [
    ['Jag heter', 'Elsa'], ['Vi åker till', 'Malmö'], ['Min hund heter', 'Bamse'],
    ['Mormor bor i', 'Kiruna'], ['Katten heter', 'Misse'], ['I morgon kommer', 'Sara'],
    ['Vi badar i', 'Vättern'], ['Min bästa kompis heter', 'Omar'], ['Pappa jobbar i', 'Stockholm'],
    ['Vi ska åka till', 'Spanien']
  ];

  const LEVELS = [
    { key: 'marks2', name: 'Punkt eller frågetecken?', icon: '❓', sub: '. eller ?', marks: ['.', '?'] },
    { key: 'marks3', name: 'Punkt, fråga eller utrop?', icon: '❗', sub: '. ? !', marks: ['.', '?', '!'] },
    { key: 'names', name: 'Stor bokstav', icon: '🅰️', sub: 'Namn har stor bokstav' }
  ];

  function makeTasks(level, n) {
    if (level.key === 'names') {
      return T.sample(NAMES, n).map(([start, name]) => {
        const words = start.split(' ').slice(1).concat(name);
        return { start, name, words: T.shuffle(words) };
      });
    }
    const all = level.marks.flatMap(mark => SENTENCES[mark].map(text => ({ text, mark })));
    return T.sample(all, n);
  }

  function renderMarks(task, level) {
    const gap = T.slot();
    return {
      prompt: el('div', { class: 'read-sentence' }, [el('span', { text: task.text }), gap]),
      say: task.text + task.mark,
      praise: 'Ja, det ska vara ' + MARKS[task.mark].name + '.',
      item: MARKS[task.mark].item,
      choiceClass: 'mark-tile',
      choices: level.marks.map(mark => ({
        label: MARKS[mark].name,
        correct: mark === task.mark,
        content: [el('span', { class: 'tile-up', text: mark }), el('span', { class: 'tile-word', text: MARKS[mark].name })]
      })),
      onRight: () => gap.fill(task.mark)
    };
  }

  function renderNames(task) {
    const lower = w => w.toLocaleLowerCase('sv-SE');
    const sentence = task.start + ' ' + lower(task.name) + '.';
    return {
      prompt: el('div', { class: 'read-sentence', text: sentence }),
      say: 'Vilket ord ska ha stor bokstav? ' + task.start + ' ' + task.name + '.',
      retry: 'Vilket ord är ett namn?',
      praise: task.name + ' är ett namn. Namn har stor bokstav!',
      item: 'Stor bokstav',
      choiceClass: 'word-tile',
      choices: task.words.map(w => ({ label: lower(w), correct: w === task.name, content: el('span', { text: lower(w) }) }))
    };
  }

  T.quizGame({
    id: 'skrivregler',
    title: 'Punkt och stor bokstav',
    grade: 1,
    subject: 'Svenska',
    icon: '❓',
    color: '#ffb627',
    description: 'Punkt, frågetecken och stor bokstav.',
    intro: 'En mening slutar med punkt, frågetecken eller utropstecken. Och namn skrivs med stor bokstav!',
    hint: level => (level.key === 'names' ? 'Vilket ord ska ha stor bokstav?' : 'Lyssna. Vilket tecken ska stå sist?'),
    levels: LEVELS,
    makeTasks,
    report: { title: 'Skrivregler', keys: ['Punkt', 'Frågetecken', 'Utropstecken', 'Stor bokstav'] },
    render: (task, level) => (level.key === 'names' ? renderNames(task) : renderMarks(task, level))
  });
})();
