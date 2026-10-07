/*
 * Flyter eller sjunker? – och fastnar det på en magnet?
 * Material kan sorteras efter egenskaper.
 */
(function () {
  'use strict';

  const items = list => list.map(([name, emoji]) => ({ name, emoji }));

  Teachy.sortGame({
    id: 'flyter',
    title: 'Flyter eller sjunker?',
    grade: 1,
    subject: 'NO',
    icon: '🛟',
    color: '#4cc9f0',
    description: 'Flyter det? Fastnar det på en magnet?',
    intro: 'Vad händer om du lägger saken i vatten? Och fastnar den på en magnet? Dra den till rätt grupp!',
    levels: [
      {
        name: 'Flyter eller sjunker?', icon: '🌊', sub: 'Saker i vatten',
        question: 'Flyter den eller sjunker den?',
        bins: [
          { label: 'Flyter', icon: '⬆️', items: items([['anka', '🦆'], ['löv', '🍃'], ['träbit', '🪵'], ['tvättsvamp', '🧽'], ['fjäder', '🪶'], ['äpple', '🍎'], ['båt', '⛵'], ['livboj', '🛟']]) },
          { label: 'Sjunker', icon: '⬇️', items: items([['sten', '🪨'], ['nyckel', '🔑'], ['mynt', '🪙'], ['gem', '📎'], ['sked', '🥄'], ['ankare', '⚓'], ['skruv', '🔩'], ['ring', '💍']]) }
        ]
      },
      {
        name: 'Magnetisk?', icon: '🧲', sub: 'Fastnar den på en magnet?',
        question: 'Fastnar den på en magnet?',
        bins: [
          // Bara saker av järn eller stål fastnar
          { label: 'Fastnar', icon: '🧲', items: items([['gem', '📎'], ['skruv', '🔩'], ['säkerhetsnål', '🧷'], ['konservburk', '🥫'], ['sax', '✂️'], ['skiftnyckel', '🔧']]) },
          { label: 'Fastnar inte', icon: '🚫', items: items([['träbit', '🪵'], ['sten', '🪨'], ['nalle', '🧸'], ['plastmugg', '🥤'], ['penna', '✏️'], ['papper', '📄'], ['strumpa', '🧦'], ['äpple', '🍎']]) }
        ]
      }
    ]
  });
})();
