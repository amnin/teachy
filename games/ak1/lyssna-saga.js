/*
 * Lyssna på sagan – en kort berättelse läses upp, svara på en fråga med bilder.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  // Varje fråga: [fråga, rätt svar, fel svar, fel svar] där svaren är [emoji, ord]
  const STORIES = [
    // Nivå 1 – korta sagor
    { level: 1, text: 'Lisa har en röd ballong. Den flyger upp i himlen.', questions: [
      ['Vad hade Lisa?', ['🎈', 'ballong'], ['⚽', 'boll'], ['🧸', 'nalle']]] },
    { level: 1, text: 'Hunden Max gräver i sanden. Han hittar ett ben.', questions: [
      ['Vad hittade Max?', ['🦴', 'ett ben'], ['👟', 'en sko'], ['🔑', 'en nyckel']],
      ['Vem grävde i sanden?', ['🐕', 'hunden'], ['🐈', 'katten'], ['🐇', 'kaninen']]] },
    { level: 1, text: 'Det regnar ute. Ali tar på sig stövlar och går ut.', questions: [
      ['Hur var vädret?', ['🌧️', 'regn'], ['☀️', 'sol'], ['❄️', 'snö']]] },
    { level: 1, text: 'Katten Misse är hungrig. Hon dricker mjölk ur en skål.', questions: [
      ['Vad drack Misse?', ['🥛', 'mjölk'], ['🧃', 'saft'], ['☕', 'kaffe']]] },
    { level: 1, text: 'Elsa bygger en snögubbe. Den får en morot som näsa.', questions: [
      ['Vad fick snögubben som näsa?', ['🥕', 'en morot'], ['🍌', 'en banan'], ['🥒', 'en gurka']]] },
    { level: 1, text: 'Pappa bakar kakor. Hela köket luktar gott.', questions: [
      ['Vad bakade pappa?', ['🍪', 'kakor'], ['🍕', 'pizza'], ['🍞', 'bröd']]] },

    // Nivå 2 – längre sagor
    { level: 2, text: 'Omar och mormor går till skogen. De plockar blåbär i en hink. Sedan ser de en ekorre i ett träd.', questions: [
      ['Vad plockade de?', ['🫐', 'blåbär'], ['🍓', 'jordgubbar'], ['🍄', 'svamp']],
      ['Vilket djur såg de?', ['🐿️', 'en ekorre'], ['🦊', 'en räv'], ['🦉', 'en uggla']]] },
    { level: 2, text: 'Det är Saras födelsedag. Hon fyller sju år. Hon får en cykel i present. Sedan äter alla tårta.', questions: [
      ['Vad fick Sara i present?', ['🚲', 'en cykel'], ['🛴', 'en sparkcykel'], ['🪁', 'en drake']],
      ['Vad åt alla?', ['🎂', 'tårta'], ['🍕', 'pizza'], ['🍦', 'glass']]] },
    { level: 2, text: 'Leo ska till tandläkaren. Han är lite rädd. Men tandläkaren är snäll, och efteråt får Leo ett klistermärke.', questions: [
      ['Vart skulle Leo?', ['🦷', 'till tandläkaren'], ['🏫', 'till skolan'], ['🛒', 'till affären']],
      ['Hur kände sig Leo först?', ['😨', 'rädd'], ['😄', 'glad'], ['😠', 'arg']]] },
    { level: 2, text: 'Ett litet frö ligger i jorden. Solen skiner och regnet faller. Fröet växer och blir en stor solros.', questions: [
      ['Vad blev fröet?', ['🌻', 'en solros'], ['🌳', 'ett träd'], ['🌵', 'en kaktus']],
      ['Vad hjälpte fröet att växa?', ['🌦️', 'sol och regn'], ['❄️', 'snö och is'], ['🌙', 'mörker']]] },
    { level: 2, text: 'Nora tappar sin vante i parken. En hund hittar den. Hunden springer fram till Nora med vanten i munnen. Nora blir jätteglad.', questions: [
      ['Vad tappade Nora?', ['🧤', 'en vante'], ['🧣', 'en halsduk'], ['🧢', 'en keps']],
      ['Vem hittade vanten?', ['🐕', 'en hund'], ['🐈', 'en katt'], ['🐦', 'en fågel']]] },

    // Nivå 3 – vad hände först och sist?
    { level: 3, text: 'Först vaknar Tim. Sedan äter han frukost. Till sist borstar han tänderna.', questions: [
      ['Vad gjorde Tim först?', ['⏰', 'vaknade'], ['🥣', 'åt frukost'], ['🪥', 'borstade tänderna']],
      ['Vad gjorde Tim sist?', ['🪥', 'borstade tänderna'], ['⏰', 'vaknade'], ['🥣', 'åt frukost']]] },
    { level: 3, text: 'Ella och pappa åker buss till stranden. De badar i havet. Sedan äter de glass. Till sist åker de hem.', questions: [
      ['Vad gjorde de efter badet?', ['🍦', 'åt glass'], ['🚌', 'åkte buss'], ['🏖️', 'byggde sandslott']],
      ['Hur kom de till stranden?', ['🚌', 'med buss'], ['🚗', 'med bil'], ['🚲', 'med cykel']]] },
    { level: 3, text: 'Kim bygger ett högt torn av klossar. Då kommer katten och knuffar på det. Tornet ramlar!', questions: [
      ['Vem knuffade på tornet?', ['🐈', 'katten'], ['🐕', 'hunden'], ['🧒', 'Kim']],
      ['Vad hände sist?', ['💥', 'tornet ramlade'], ['🧱', 'Kim byggde'], ['🐈', 'katten kom']]] },
    { level: 3, text: 'Maja planterar ett frö i en kruka. Hon vattnar det varje dag. Efter en vecka tittar en liten grodd upp.', questions: [
      ['Vad gjorde Maja först?', ['🪴', 'planterade fröet'], ['💧', 'vattnade'], ['🌱', 'såg en grodd']],
      ['Vad hände sist?', ['🌱', 'en grodd kom upp'], ['🪴', 'Maja planterade'], ['💧', 'Maja vattnade']]] },
    { level: 3, text: 'Adam packar sin väska. Han tar på sig jackan. Sedan går han till skolan och möter sin kompis.', questions: [
      ['Vad gjorde Adam först?', ['🎒', 'packade väskan'], ['🧥', 'tog på jackan'], ['🏫', 'gick till skolan']],
      ['Vem mötte Adam i skolan?', ['🧒', 'sin kompis'], ['👮', 'en polis'], ['🐕', 'en hund']]] }
  ];

  const LEVELS = [
    { level: 1, name: 'Korta sagor', icon: '🐣', sub: 'Två meningar' },
    { level: 2, name: 'Längre sagor', icon: '🐥', sub: 'Lyssna noga' },
    { level: 3, name: 'Först och sist', icon: '🦅', sub: 'I vilken ordning hände det?' }
  ];

  function makeTasks(level, n) {
    const all = STORIES.filter(s => s.level === level.level)
      .flatMap(story => story.questions.map(([question, right, ...wrong]) =>
        ({ story, question, right, options: T.shuffle([right, ...wrong]) })));
    return T.sample(all, n);
  }

  T.quizGame({
    id: 'lyssna-saga',
    title: 'Lyssna på sagan',
    grade: 1,
    subject: 'Svenska',
    icon: '👂',
    color: '#4cc9f0',
    description: 'Lyssna noga och svara på frågan.',
    intro: 'Lyssna på sagan. Sedan kommer en fråga – tryck på rätt bild!',
    hint: 'Lyssna på sagan och svara på frågan',
    levels: LEVELS,
    makeTasks,
    report: { title: 'Sagor', keys: LEVELS.map(l => l.name) },
    render: (task, level) => ({
      prompt: el('div', { class: 'story' }, [
        el('p', { class: 'story-text', text: '📖 ' + task.story.text }),
        el('p', { class: 'story-question', text: task.question })
      ]),
      say: task.story.text + ' ... ' + task.question + ' ' + T.orList(task.options.map(a => a[1])) + '?',
      retry: task.question,
      item: level.name,
      choiceClass: 'pic-tile',
      choices: task.options.map(answer => ({
        label: answer[1],
        correct: answer === task.right,
        content: [
          el('span', { class: 'tile-emoji', text: answer[0] }),
          el('span', { class: 'tile-word', text: answer[1] })
        ]
      }))
    })
  });
})();
