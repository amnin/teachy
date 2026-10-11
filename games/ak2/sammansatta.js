/*
 * Sammansatta ord – två ord som blir ett nytt: sol + glasögon = solglasögon.
 */
(function () {
  'use strict';

  // [första, andra, hela ordet, bild]
  const WORDS = [
    ['sol', 'glasögon', 'solglasögon', '🕶️'], ['fot', 'boll', 'fotboll', '⚽'], ['snö', 'gubbe', 'snögubbe', '⛄'],
    ['jord', 'gubbe', 'jordgubbe', '🍓'], ['regn', 'båge', 'regnbåge', '🌈'], ['brand', 'bil', 'brandbil', '🚒'],
    ['tand', 'borste', 'tandborste', '🪥'], ['flyg', 'plan', 'flygplan', '✈️'], ['is', 'björn', 'isbjörn', '🐻‍❄️'],
    ['nyckel', 'piga', 'nyckelpiga', '🐞'], ['sol', 'ros', 'solros', '🌻'],
    ['blå', 'bär', 'blåbär', '🫐'], ['glas', 'ögon', 'glasögon', '👓'], ['snö', 'flinga', 'snöflinga', '❄️'],
    ['kyl', 'skåp', 'kylskåp', '🧊']
  ];

  const pick = (list, n) => Teachy.sample(list, n);

  Teachy.factGame({
    id: 'sammansatta',
    title: 'Sammansatta ord',
    grade: 2,
    subject: 'Svenska',
    icon: '🧩',
    color: '#9b5de5',
    description: 'Sol + glasögon = solglasögon.',
    intro: 'Två ord kan sättas ihop till ett nytt ord. Sol och glasögon blir solglasögon!',
    hint: 'Sätt ihop orden',
    reportTitle: 'Sammansatta ord',
    levels: [
      {
        name: 'Sätt ihop', icon: '➕', sub: 'sol + glasögon = ?',
        questions: WORDS.map(([a, b, whole, emoji], i) => {
          const others = pick(WORDS.filter((_, j) => j !== i), 3).map(w => w[2]);
          return [a + ' + ' + b + ' = ?', emoji, whole, b + a, ...others];
        })
      },
      {
        name: 'Dela upp', icon: '✂️', sub: 'Vilka två ord finns i fotboll?',
        questions: WORDS.map(([a, b, whole, emoji], i) => {
          const other = WORDS[(i + 3) % WORDS.length];
          return ['Vilka två ord finns i ' + whole + '?', emoji, a + ' + ' + b, other[0] + ' + ' + b, a + ' + ' + other[1]];
        })
      }
    ]
  });
})();
