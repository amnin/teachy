/*
 * Vem hjälper till? – yrken och viktiga samhällsfunktioner, och när man ringer 112.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const JOBS = {
    brandman: ['🧑‍🚒', 'brandmannen'],
    läkare: ['🧑‍⚕️', 'läkaren'],
    polis: ['👮', 'polisen'],
    lärare: ['🧑‍🏫', 'läraren'],
    kock: ['🧑‍🍳', 'kocken'],
    bonde: ['🧑‍🌾', 'bonden'],
    mekaniker: ['🧑‍🔧', 'mekanikern'],
    pilot: ['🧑‍✈️', 'piloten']
  };

  const JOB_QUESTIONS = [
    ['Det brinner! Vem kommer och släcker?', 'brandman'],
    ['Du är sjuk. Vem hjälper dig att bli frisk?', 'läkare'],
    ['Någon har stulit en cykel. Vem hjälper till?', 'polis'],
    ['Vem lär barnen att läsa och räkna?', 'lärare'],
    ['Vem lagar mat på en restaurang?', 'kock'],
    ['Vem odlar mat och tar hand om korna?', 'bonde'],
    ['Vem lagar bilen när den är trasig?', 'mekaniker'],
    ['Vem flyger flygplanet?', 'pilot'],
    ['Vem hjälper till när det har hänt en olycka på vägen?', 'polis'],
    ['Vem arbetar på sjukhuset?', 'läkare']
  ];

  // [fråga, rätt svar, fel svar, fel svar] där svaren är [emoji, ord]
  const EMERGENCY_QUESTIONS = [
    ['Vilket nummer ringer du när det är fara?', ['☎️', '112'], ['☎️', '123'], ['☎️', '999']],
    ['När ska man ringa 112?', ['🔥', 'när det brinner'], ['🍕', 'när man är hungrig'], ['🧸', 'när nallen är borta']],
    ['När ska man ringa 112?', ['🚑', 'när någon är svårt skadad'], ['😴', 'när man är trött'], ['📺', 'när tv:n är trasig']],
    ['Vad ska du berätta när du ringer 112?', ['📍', 'vad som hänt och var du är'], ['🎂', 'när du fyller år'], ['🎵', 'en sång']],
    ['Vilken bil kommer när någon är svårt sjuk?', ['🚑', 'ambulansen'], ['🚒', 'brandbilen'], ['🚌', 'bussen']],
    ['Vilken bil kommer när det brinner?', ['🚒', 'brandbilen'], ['🚓', 'polisbilen'], ['🚑', 'ambulansen']],
    ['Vilken bil kommer när någon har gjort inbrott?', ['🚓', 'polisbilen'], ['🚒', 'brandbilen'], ['🚕', 'taxin']]
  ];

  const LEVELS = [
    { name: 'Yrken', icon: '🧑‍🚒', sub: 'Vem gör vad?' },
    { name: '112', icon: '🚑', sub: 'När det är fara' }
  ];

  function makeTasks(level, n) {
    if (level.name === 'Yrken') {
      return T.sample(JOB_QUESTIONS, n).map(([question, key]) => {
        const right = JOBS[key];
        const wrong = T.sample(Object.keys(JOBS).filter(k => k !== key), 2).map(k => JOBS[k]);
        return { question, right, options: T.shuffle([right, ...wrong]) };
      });
    }
    return T.sample(EMERGENCY_QUESTIONS, n).map(([question, right, ...wrong]) =>
      ({ question, right, options: T.shuffle([right, ...wrong]) }));
  }

  T.quizGame({
    id: 'hjalpare',
    title: 'Vem hjälper till?',
    grade: 1,
    subject: 'SO',
    icon: '🚒',
    color: '#ffb627',
    description: 'Yrken och när man ringer 112.',
    intro: 'Många yrken hjälper oss i samhället. Och vid fara ringer man 112!',
    hint: 'Lyssna på frågan',
    levels: LEVELS,
    makeTasks,
    report: { title: 'Samhället', keys: LEVELS.map(l => l.name) },
    render: (task, level) => ({
      prompt: el('div', { class: 'read-sentence', text: task.question }),
      say: task.question + ' ' + T.orList(task.options.map(o => o[1])) + '?',
      retry: task.question,
      praise: 'Ja, ' + task.right[1] + '!',
      item: level.name,
      choiceClass: 'pic-tile',
      choices: task.options.map(o => ({
        label: o[1],
        correct: o === task.right,
        content: [el('span', { class: 'tile-emoji', text: o[0] }), el('span', { class: 'tile-word', text: o[1] })]
      }))
    })
  });
})();
