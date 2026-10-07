/*
 * Läs meningen – en kort mening visas, tryck på bilden som passar.
 * Felsvaren skiljer sig bara lite, så man måste läsa hela meningen.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;
  const { ANIMALS, OBJECTS, scene } = T.data.scenes;

  const WHO = [
    { name: 'Katten', emoji: '🐈' },
    { name: 'Hunden', emoji: '🐕' },
    { name: 'Fågeln', emoji: '🐦' },
    { name: 'Musen', emoji: '🐁' },
    { name: 'Kaninen', emoji: '🐇' },
    { name: 'Grisen', emoji: '🐖' }
  ];
  const DOES = [
    { text: 'äter ett äpple', emoji: '🍎' },
    { text: 'har en boll', emoji: '⚽' },
    { text: 'sover', emoji: '💤' },
    { text: 'har en hatt', emoji: '🎩' },
    { text: 'läser en bok', emoji: '📖' },
    { text: 'har en ballong', emoji: '🎈' },
    { text: 'äter en kaka', emoji: '🍪' }
  ];

  const LEVELS = [
    { key: 'Vem', name: 'Vem?', icon: '🐣', sub: 'Katten sover.' },
    { key: 'Vem och vad', name: 'Vem gör vad?', icon: '🐥', sub: 'Hunden har en hatt.' },
    { key: 'Var', name: 'Var är den?', icon: '🦅', sub: 'Musen är under bordet.' }
  ];

  // Bild = djur + vad det gör, t.ex. 🐈 💤
  function actionPicture(who, does) {
    return el('span', { class: 'sentence-pic' }, [
      el('span', { text: who.emoji }),
      el('span', { class: 'sentence-pic-thing', text: does.emoji })
    ]);
  }

  function makeTask(level) {
    if (level.key === 'Var') {
      const objectKey = T.pick(Object.keys(OBJECTS));
      const words = OBJECTS[objectKey].words;
      const animal = T.pick(ANIMALS);
      const word = T.pick(words);
      const otherAnimal = T.pick(ANIMALS.filter(a => a !== animal));
      // Fel: samma djur på annat ställe, och ett annat djur på samma ställe
      const options = T.shuffle([
        { animal, word, correct: true },
        { animal, word: T.pick(words.filter(w => w !== word)) },
        { animal: otherAnimal, word }
      ]);
      return {
        sentence: animal.name + ' är ' + word + ' ' + OBJECTS[objectKey].name + '.',
        choices: options.map(o => {
          const node = el('span', { class: 'scene' });
          node.innerHTML = scene(objectKey, o.word, o.animal.emoji);
          return { correct: !!o.correct, content: node };
        })
      };
    }

    const who = T.pick(WHO);
    const does = T.pick(DOES);
    const otherWhos = T.sample(WHO.filter(w => w !== who), 2);
    const options = level.key === 'Vem'
      // Fel: andra djur som gör samma sak – det räcker att läsa vem
      ? [{ who, does, correct: true }, { who: otherWhos[0], does }, { who: otherWhos[1], does }]
      // Fel: samma djur gör något annat, och ett annat djur gör samma sak
      : [{ who, does, correct: true }, { who, does: T.pick(DOES.filter(d => d !== does)) }, { who: otherWhos[0], does }];

    return {
      sentence: who.name + ' ' + does.text + '.',
      choices: T.shuffle(options).map(o => ({ correct: !!o.correct, content: actionPicture(o.who, o.does) }))
    };
  }

  T.quizGame({
    id: 'las-meningen',
    title: 'Läs meningen',
    grade: 1,
    subject: 'Svenska',
    icon: '📝',
    color: '#9b5de5',
    description: 'Läs meningen och hitta rätt bild.',
    intro: 'Läs meningen noga. Vilken bild passar?',
    hint: 'Läs meningen. Vilken bild passar?',
    levels: LEVELS,
    makeTasks: (level, n) => Array.from({ length: n }, () => makeTask(level)),
    report: { title: 'Meningar', keys: LEVELS.map(l => l.key) },
    render: (task, level) => ({
      prompt: el('div', { class: 'read-sentence', text: task.sentence }),
      say: 'Läs meningen. Vilken bild passar?',
      praise: task.sentence,
      item: level.key,
      choiceClass: 'scene-tile',
      choices: task.choices.map((c, i) => Object.assign({ label: 'Bild ' + (i + 1) }, c))
    })
  });
})();
