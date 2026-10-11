/*
 * Högtider och symboler i kristendom, islam och judendom.
 */
(function () {
  'use strict';

  const items = list => list.map(([name, emoji]) => ({ name, emoji }));

  Teachy.sortGame({
    id: 'hogtider',
    title: 'Högtider',
    grade: 2,
    subject: 'SO',
    icon: '🕯️',
    color: '#ff8a3d',
    description: 'Kristendom, islam och judendom.',
    intro: 'Människor firar olika högtider. Här får du lära dig några högtider och symboler i kristendom, islam och judendom.',
    levels: [
      {
        name: 'Högtider', icon: '🎄', sub: 'Jul, id och hanukka',
        question: 'Vilken religion hör högtiden till?',
        bins: [
          { label: 'Kristendom', icon: '✝️', items: items([['jul – Jesus föds', '🎄'], ['påsk', '🐣'], ['advent', '⭐'], ['pingst', '🕊️']]) },
          { label: 'Islam', icon: '☪️', items: items([['ramadan – man fastar', '🌙'], ['id al-fitr – fest efter fastan', '🎉'], ['id al-adha', '🐑']]) },
          { label: 'Judendom', icon: '✡️', items: items([['hanukka – ljusens fest', '🕯️'], ['pesach', '🍷'], ['sabbat – vilodag', '🥖']]) }
        ]
      },
      {
        name: 'Symboler och byggnader', icon: '⛪', sub: 'Kyrka, moské och synagoga',
        question: 'Vilken religion hör det till?',
        bins: [
          { label: 'Kristendom', icon: '✝️', items: items([['kyrka', '⛪'], ['Bibeln', '📖'], ['kyrkklockor', '🔔']]) },
          { label: 'Islam', icon: '☪️', items: items([['moské', '🕌'], ['Koranen', '📗'], ['bönematta', '🧎']]) },
          { label: 'Judendom', icon: '✡️', items: items([['synagoga', '🕍'], ['Toran', '📜'], ['menora – ljusstaken', '🕎']]) }
        ]
      }
    ]
  });
})();
