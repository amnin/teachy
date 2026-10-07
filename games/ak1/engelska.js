/*
 * English words – lyssna på ett engelskt ord och tryck på rätt bild.
 * Uppläsningen sker med engelsk röst (en-GB) om enheten har en.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const TOPICS = {
    Colours: [['red', '🔴'], ['blue', '🔵'], ['yellow', '🟡'], ['green', '🟢'], ['black', '⚫'], ['white', '⚪'], ['orange', '🟠'], ['purple', '🟣'], ['brown', '🟤']],
    Numbers: [['one', '1'], ['two', '2'], ['three', '3'], ['four', '4'], ['five', '5'], ['six', '6'], ['seven', '7'], ['eight', '8'], ['nine', '9'], ['ten', '10']],
    Animals: [['dog', '🐶'], ['cat', '🐱'], ['cow', '🐮'], ['pig', '🐷'], ['horse', '🐴'], ['bird', '🐦'], ['fish', '🐟'], ['mouse', '🐭'], ['rabbit', '🐰'], ['lion', '🦁'], ['bear', '🐻'], ['duck', '🦆'], ['frog', '🐸'], ['monkey', '🐵']],
    Food: [['apple', '🍎'], ['banana', '🍌'], ['bread', '🍞'], ['milk', '🥛'], ['cake', '🎂'], ['egg', '🥚'], ['cheese', '🧀'], ['ice cream', '🍦'], ['pizza', '🍕'], ['carrot', '🥕']]
  };

  const LEVELS = [
    { topic: 'Colours', name: 'Colours – färger', icon: '🎨', sub: 'red, blue, yellow …' },
    { topic: 'Numbers', name: 'Numbers – siffror', icon: '🔢', sub: 'one, two, three …' },
    { topic: 'Animals', name: 'Animals – djur', icon: '🐶', sub: 'dog, cat, cow …' },
    { topic: 'Food', name: 'Food – mat', icon: '🍎', sub: 'apple, bread, milk …' }
  ];

  T.quizGame({
    id: 'engelska',
    title: 'English words',
    grade: 1,
    subject: 'Engelska',
    icon: '🇬🇧',
    color: '#3a86ff',
    description: 'Lyssna på engelska ord.',
    intro: 'Lyssna på det engelska ordet och tryck på rätt bild. Listen and tap!',
    hint: 'Lyssna på det engelska ordet',
    levels: LEVELS,
    makeTasks: (level, n) => {
      const words = TOPICS[level.topic];
      return T.sample(words, n).map(word => ({
        word,
        options: T.shuffle([word, ...T.sample(words.filter(w => w !== word), 3)])
      }));
    },
    report: { title: 'Ämnen', keys: Object.keys(TOPICS) },
    render: (task, level) => ({
      prompt: el('div', { class: 'quiz-card' }, [
        el('span', { class: 'quiz-emoji small', text: '🔊' }),
        el('span', { class: 'quiz-word', text: task.word[0] })
      ]),
      say: task.word[0],
      lang: 'en-GB',
      praise: 'Yes! ' + task.word[0] + '!',
      item: level.topic,
      choiceClass: level.topic === 'Numbers' ? 'num-tile' : 'emoji-tile',
      choices: task.options.map(w => ({
        label: w[0],
        correct: w === task.word,
        content: el('span', { class: level.topic === 'Numbers' ? 'tile-up' : 'tile-emoji', text: w[1] })
      }))
    })
  });
})();
