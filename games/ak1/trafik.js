/*
 * Trafikvett – trafikregler och hur man beter sig säkert i trafiken.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  // [fråga, rätt svar, fel svar, fel svar] där svaren är [emoji, ord]
  const PICTURE_QUESTIONS = [
    ['Var är det säkrast att gå över gatan?', ['🚸', 'vid övergångsstället'], ['🚗', 'mellan parkerade bilar'], ['🛣️', 'mitt på vägen']],
    ['Vilken färg betyder att du ska stanna?', ['🔴', 'röd'], ['🟢', 'grön'], ['🟡', 'gul']],
    ['Vilken färg betyder att du får gå?', ['🟢', 'grön'], ['🔴', 'röd'], ['🟡', 'gul']],
    ['Vad ska du ha på huvudet när du cyklar?', ['⛑️', 'hjälm'], ['🧢', 'keps'], ['👒', 'solhatt']],
    ['Vad gör att bilarna ser dig när det är mörkt?', ['✨', 'reflex'], ['🕶️', 'solglasögon'], ['🧣', 'halsduk']],
    ['Hur ska du sitta i bilen?', ['💺', 'med bältet på'], ['🧍', 'stå upp'], ['🛋️', 'ligga utan bälte']],
    ['Vad ska du göra innan du går över gatan?', ['👀', 'titta åt båda hållen'], ['📱', 'titta i mobilen'], ['🏃', 'springa fort']],
    ['Var ska du gå när det finns en trottoar?', ['🚶', 'på trottoaren'], ['🚗', 'på bilvägen'], ['🚲', 'på cykelbanan']]
  ];

  // [påstående, rätt?]
  const STATEMENTS = [
    ['Man ska titta åt båda hållen innan man går över gatan.', true],
    ['Det är okej att springa ut på gatan efter en boll.', false],
    ['Man ska ha hjälm när man cyklar.', true],
    ['När gubben lyser röd får man gå.', false],
    ['Reflexer gör att bilarna ser dig i mörkret.', true],
    ['Man får leka på bilvägen.', false],
    ['I bilen ska man alltid ha bältet på.', true],
    ['Man ska gå över gatan vid ett övergångsställe.', true],
    ['Bussen hinner alltid stanna om du springer ut framför den.', false],
    ['Man ska gå på trottoaren och inte på bilvägen.', true]
  ];

  const RIGHT = ['✅', 'Rätt'];
  const WRONG = ['❌', 'Fel'];

  const LEVELS = [
    { name: 'Bilder', icon: '🚦', sub: 'Välj rätt bild' },
    { name: 'Rätt eller fel', icon: '✅', sub: 'Är det sant?' }
  ];

  function makeTasks(level, n) {
    if (level.name === 'Bilder') {
      return T.sample(PICTURE_QUESTIONS, n).map(([question, right, ...wrong]) =>
        ({ question, right, options: T.shuffle([right, ...wrong]) }));
    }
    return T.sample(STATEMENTS, n).map(([question, isTrue]) =>
      ({ question, right: isTrue ? RIGHT : WRONG, options: [RIGHT, WRONG], statement: true }));
  }

  T.quizGame({
    id: 'trafik',
    title: 'Trafikvett',
    grade: 1,
    subject: 'SO',
    icon: '🚦',
    color: '#ff5d73',
    description: 'Säker i trafiken.',
    intro: 'Hur gör man för att vara säker i trafiken? Lyssna och svara!',
    hint: level => (level.name === 'Bilder' ? 'Lyssna på frågan' : 'Är det rätt eller fel?'),
    levels: LEVELS,
    makeTasks,
    report: { title: 'Trafikvett', keys: LEVELS.map(l => l.name) },
    render: (task, level) => ({
      prompt: el('div', { class: 'read-sentence', text: task.question }),
      say: task.statement
        ? task.question + ' Rätt eller fel?'
        : task.question + ' ' + T.orList(task.options.map(o => o[1])) + '?',
      retry: task.statement ? task.question : null,
      praise: task.statement ? (task.right === RIGHT ? 'Ja, det är rätt!' : 'Ja, det är fel!') : 'Ja, ' + task.right[1] + '!',
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
