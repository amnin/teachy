/*
 * Is, vatten, ånga – vattnets former: fast, flytande och gas.
 * Och smältning och stelning: smälter det eller fryser det?
 */
(function () {
  'use strict';

  const items = list => list.map(([name, emoji]) => ({ name, emoji }));

  Teachy.sortGame({
    id: 'vatten',
    title: 'Is, vatten, ånga',
    grade: 1,
    subject: 'NO',
    icon: '💧',
    color: '#3a86ff',
    description: 'Fast, flytande eller gas?',
    intro: 'Vatten kan vara fast som is, flytande som i havet, eller gas som ånga. Dra bilden till rätt grupp!',
    levels: [
      {
        name: 'Fast, flytande eller gas?', icon: '🧊', sub: 'Vattnets tre former',
        question: 'Är det fast, flytande eller gas?',
        bins: [
          { label: 'Fast', icon: '🧊', items: items([['snöflinga', '❄️'], ['snögubbe', '⛄'], ['hyvlad is', '🍧'], ['glaciär', '🏔️'], ['snöfall', '🌨️']]) },
          { label: 'Flytande', icon: '💧', items: items([['regn', '🌧️'], ['havet', '🌊'], ['duschvatten', '🚿'], ['mjölk', '🥛'], ['saft', '🧃']]) },
          { label: 'Gas', icon: '♨️', items: items([['ånga från tekannan', '🫖'], ['ånga i bastun', '🧖'], ['ånga från soppan', '🍜']]) }
        ]
      },
      {
        name: 'Smälter eller fryser?', icon: '☀️', sub: 'När det blir varmt eller kallt',
        question: 'Smälter det eller fryser det?',
        bins: [
          { label: 'Smälter', icon: '☀️', items: items([['glass i solen', '🍦'], ['snögubbe på våren', '⛄'], ['iskub i saften', '🧊'], ['choklad i handen', '🍫'], ['stearinljus som brinner', '🕯️']]) },
          { label: 'Fryser', icon: '🥶', items: items([['vatten i frysen', '💧'], ['sjön på vintern', '🏞️'], ['saft till isglass', '🧃'], ['vattenpöl en kall natt', '🌨️']]) }
        ]
      }
    ]
  });
})();
