/*
 * Återvinning – sortera skräpet i rätt kärl.
 */
(function () {
  'use strict';

  const items = list => list.map(([name, emoji]) => ({ name, emoji }));

  Teachy.sortGame({
    id: 'atervinning',
    title: 'Återvinning',
    grade: 2,
    subject: 'NO',
    icon: '♻️',
    color: '#2bb673',
    description: 'Papper, plast, metall, glas eller mat?',
    intro: 'Det mesta vi slänger kan bli nya saker – om det hamnar i rätt kärl. Dra skräpet till rätt kärl!',
    levels: [
      {
        name: 'Sortera skräpet', icon: '🗑️', sub: 'Papper, plast, metall, glas',
        question: 'Var ska det slängas?',
        bins: [
          { label: 'Papper', icon: '📦', items: items([['tidning', '📰'], ['kartong', '📦'], ['mjölkpaket', '🥛'], ['pappkasse', '🛍️']]) },
          { label: 'Plast', icon: '🧴', items: items([['schampoflaska', '🧴'], ['plastpåse', '🛍️'], ['yoghurtburk', '🥣'], ['plastmugg', '🥤']]) },
          { label: 'Metall', icon: '🥫', items: items([['konservburk', '🥫'], ['lock', '⚪'], ['folieform', '🥧'], ['kapsyl', '🍾']]) },
          { label: 'Glas', icon: '🫙', items: items([['syltburk', '🫙'], ['glasflaska', '🍾'], ['saftflaska', '🧃']]) }
        ]
      },
      {
        name: 'Mat eller pant?', icon: '🍌', sub: 'Matavfall och pantburkar',
        question: 'Var ska det slängas?',
        bins: [
          { label: 'Matavfall', icon: '🍌', items: items([['bananskal', '🍌'], ['äppelskrutt', '🍎'], ['äggskal', '🥚'], ['potatisskal', '🥔'], ['fiskben', '🐟']]) },
          { label: 'Pant', icon: '🥫', items: items([['läskburk', '🥫'], ['plastflaska med pant', '🧃'], ['vattenflaska', '💧']]) },
          { label: 'Batterier', icon: '🔋', items: items([['batteri', '🔋'], ['gammal lampa', '💡'], ['trasig leksak med batteri', '🧸']]) }
        ]
      }
    ]
  });
})();
