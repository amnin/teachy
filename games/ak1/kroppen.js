/*
 * Kroppen och sinnena – sinnen, några organ och vad som gör att vi mår bra.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const SENSES = {
    se: ['👁️', 'ögonen'],
    höra: ['👂', 'öronen'],
    lukta: ['👃', 'näsan'],
    smaka: ['👅', 'tungan'],
    känna: ['✋', 'händerna']
  };

  const ORGANS = {
    hjärta: ['❤️', 'hjärtat'],
    lungor: ['🫁', 'lungorna'],
    hjärna: ['🧠', 'hjärnan'],
    skelett: ['🦴', 'skelettet'],
    tänder: ['🦷', 'tänderna'],
    muskler: ['💪', 'musklerna']
  };

  // [fråga, rätt svar] – felsvaren tas från samma grupp
  const SENSE_QUESTIONS = [
    ['Vad använder du för att se regnbågen?', 'se'],
    ['Vad använder du för att höra musik?', 'höra'],
    ['Vad använder du för att känna lukten av blommor?', 'lukta'],
    ['Vad använder du för att smaka på glass?', 'smaka'],
    ['Vad använder du för att känna att katten är mjuk?', 'känna'],
    ['Vad använder du för att höra fåglarna sjunga?', 'höra'],
    ['Vad använder du för att se om det är mörkt ute?', 'se'],
    ['Vad använder du för att känna att det luktar bränt?', 'lukta'],
    ['Vad använder du för att smaka att citronen är sur?', 'smaka'],
    ['Vad använder du för att känna att snön är kall?', 'känna']
  ];
  const ORGAN_QUESTIONS = [
    ['Vad pumpar runt blodet i kroppen?', 'hjärta'],
    ['Vad använder du när du andas?', 'lungor'],
    ['Vad tänker du med?', 'hjärna'],
    ['Vad håller upp kroppen, som en ställning?', 'skelett'],
    ['Vad tuggar du maten med?', 'tänder'],
    ['Vad hjälper dig att springa och lyfta saker?', 'muskler'],
    ['Vad slår fortare när du springer?', 'hjärta'],
    ['Vad kommer ihåg saker åt dig?', 'hjärna']
  ];
  // [fråga, rätt svar, fel svar, fel svar] där svaren är [emoji, ord]
  const HEALTH_QUESTIONS = [
    ['Vad ska du göra innan du äter?', ['🧼', 'tvätta händerna'], ['🎮', 'spela spel'], ['📺', 'titta på tv']],
    ['Vad behöver kroppen på natten?', ['😴', 'sova'], ['🍬', 'äta godis'], ['🏃', 'springa']],
    ['Vilken mat är bra att äta varje dag?', ['🥦', 'grönsaker'], ['🍭', 'klubbor'], ['🍟', 'pommes frites']],
    ['Vad är bäst att dricka när du är törstig?', ['💧', 'vatten'], ['🥤', 'läsk'], ['☕', 'kaffe']],
    ['Vad är bra för kroppen?', ['🏃', 'röra på sig'], ['🛋️', 'sitta still hela dagen'], ['📱', 'spela hela dagen']],
    ['Hur ska du hosta?', ['💪', 'i armvecket'], ['✋', 'i handen'], ['😮', 'rakt ut']],
    ['Vad gör du med tänderna morgon och kväll?', ['🪥', 'borstar dem'], ['🍬', 'äter godis'], ['🧽', 'tvättar dem med svamp']],
    ['Hur kan du vara en bra kompis?', ['🤝', 'dela och hjälpa'], ['😠', 'bli arg'], ['🙈', 'låtsas att du inte ser']]
  ];

  const LEVELS = [
    { name: 'Sinnena', icon: '👂', sub: 'Se, höra, lukta, smaka, känna' },
    { name: 'Organen', icon: '❤️', sub: 'Hjärtat, lungorna, hjärnan …' },
    { name: 'Må bra', icon: '😴', sub: 'Mat, sömn och hygien' }
  ];

  function fromGroup(group, question, answerKey) {
    const right = group[answerKey];
    const wrong = T.sample(Object.keys(group).filter(k => k !== answerKey), 2).map(k => group[k]);
    return { question, right, options: T.shuffle([right, ...wrong]) };
  }

  function makeTasks(level, n) {
    if (level.name === 'Sinnena') return T.sample(SENSE_QUESTIONS, n).map(([q, k]) => fromGroup(SENSES, q, k));
    if (level.name === 'Organen') return T.sample(ORGAN_QUESTIONS, n).map(([q, k]) => fromGroup(ORGANS, q, k));
    return T.sample(HEALTH_QUESTIONS, n).map(([question, right, ...wrong]) => ({ question, right, options: T.shuffle([right, ...wrong]) }));
  }

  T.quizGame({
    id: 'kroppen',
    title: 'Kroppen och sinnena',
    grade: 1,
    subject: 'NO',
    icon: '🫀',
    color: '#ff5d73',
    description: 'Sinnen, organ och att må bra.',
    intro: 'Hur fungerar kroppen? Lyssna på frågan och tryck på rätt bild!',
    hint: 'Lyssna på frågan',
    levels: LEVELS,
    makeTasks,
    report: { title: 'Kroppen', keys: LEVELS.map(l => l.name) },
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
