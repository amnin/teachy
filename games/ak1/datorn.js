/*
 * Datorns delar – inmatning och utmatning, och saker som styrs av program.
 */
(function () {
  'use strict';

  const items = list => list.map(([name, emoji]) => ({ name, emoji }));

  Teachy.sortGame({
    id: 'datorn',
    title: 'Datorns delar',
    grade: 1,
    subject: 'Teknik',
    icon: '💻',
    color: '#9b5de5',
    description: 'In i datorn eller ut från datorn?',
    intro: 'Med vissa delar skickar man saker IN i datorn, till exempel när man skriver. Andra delar visar eller spelar upp saker UT från datorn.',
    levels: [
      {
        name: 'In eller ut?', icon: '⌨️', sub: 'Inmatning och utmatning',
        question: 'Går det in i datorn eller ut från datorn?',
        bins: [
          { label: 'In i datorn', icon: '📥', items: items([['tangentbord', '⌨️'], ['mus', '🖱️'], ['mikrofon', '🎤'], ['kamera', '📷'], ['styrspak', '🕹️']]) },
          { label: 'Ut från datorn', icon: '📤', items: items([['skärm', '🖥️'], ['högtalare', '🔈'], ['skrivare', '🖨️'], ['hörlurar', '🎧'], ['projektor', '📽️']]) }
        ]
      },
      {
        name: 'Styrs av ett program?', icon: '🤖', sub: 'Programmerade saker i vardagen',
        question: 'Styrs den av ett program?',
        bins: [
          { label: 'Program', icon: '⚙️', items: items([['mobiltelefon', '📱'], ['robot', '🤖'], ['spelkonsol', '🎮'], ['trafikljus', '🚦'], ['smartklocka', '⌚'], ['bankomat', '🏧']]) },
          { label: 'Inget program', icon: '✋', items: items([['hammare', '🔨'], ['sked', '🥄'], ['cykel', '🚲'], ['penna', '✏️'], ['stol', '🪑'], ['bok', '📖'], ['nalle', '🧸']]) }
        ]
      }
    ]
  });
})();
