/*
 * Svåra ljud – sj-ljud, tj-ljud, j-ljud och ng-ljud kan stavas på många sätt.
 */
(function () {
  'use strict';

  // [ord, bild, felstavningar …]
  const SJ = [
    ['sjö', '🏞️', 'shö', 'skö'], ['skjorta', '👕', 'sjorta', 'chorta'], ['stjärna', '⭐', 'sjärna', 'skjärna'],
    ['sked', '🥄', 'sjed', 'skjed'], ['choklad', '🍫', 'sjoklad', 'skoklad'], ['dusch', '🚿', 'dusj', 'dush'],
    ['skinka', '🍖', 'sjinka', 'chinka'], ['sju', '7️⃣', 'shu', 'skju'], ['skål', '🥣', 'sjål', 'skjål']
  ];
  const TJ = [
    ['kyrka', '⛪', 'tjyrka', 'cyrka'], ['tjugo', '2️⃣0️⃣', 'kjugo', 'chugo'], ['kök', '🍳', 'tjök', 'kjök'],
    ['kjol', '👗', 'tjol', 'chol'], ['kex', '🍪', 'tjex', 'chex']
  ];
  const J = [
    ['hjärta', '❤️', 'järta', 'gjärta'], ['gem', '📎', 'jem', 'hjem'], ['ljus', '🕯️', 'jus', 'gjus'],
    ['djur', '🐾', 'jur', 'gjur'], ['göra', '🛠️', 'jöra', 'hjöra'], ['hjul', '🛞', 'djul', 'gjul']
  ];
  const NG = [
    ['ring', '💍', 'rinng', 'rign'], ['bank', '🏦', 'bangk', 'bannk'], ['säng', '🛏️', 'sänng', 'sägn'],
    ['finger', '☝️', 'fingger', 'figner'], ['tunga', '👅', 'tungga', 'tunnga'], ['pingvin', '🐧', 'pinngvin', 'pigvin']
  ];

  const toQuestions = list => list.map(([word, emoji, ...wrong]) =>
    [['Hur stavas ordet?', 'Hur stavas ' + word + '?'], emoji, word, ...wrong]);

  Teachy.factGame({
    id: 'stava-ljud',
    title: 'Svåra ljud',
    grade: 3,
    subject: 'Svenska',
    icon: '🔤',
    color: '#ff8a3d',
    description: 'Sj-, tj-, j- och ng-ljud.',
    intro: 'Vissa ljud kan stavas på flera sätt. Sj-ljudet kan vara sj, skj, stj, sk eller ch. Lyssna och titta noga!',
    hint: 'Hur stavas ordet?',
    reportTitle: 'Ljud',
    readOptions: false,
    levels: [
      { name: 'Sj-ljudet', icon: '🌊', sub: 'sjö, skjorta, stjärna', questions: toQuestions(SJ) },
      { name: 'Tj-ljudet', icon: '⛪', sub: 'kyrka, tjugo, kjol', questions: toQuestions(TJ) },
      { name: 'J-ljudet', icon: '❤️', sub: 'hjärta, ljus, djur', questions: toQuestions(J) },
      { name: 'Ng-ljudet', icon: '💍', sub: 'ring, bank, säng', questions: toQuestions(NG) },
      { name: 'Blandat', icon: '🦅', sub: 'Alla svåra ljud', questions: toQuestions(SJ.concat(TJ, J, NG)) }
    ]
  });
})();
