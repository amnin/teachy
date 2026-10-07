/*
 * Sortera – dra bilden till rätt grupp (djur, frukt & grönsaker, årstider).
 */
(function () {
  'use strict';

  const GAME_ID = 'sortera';

  function items(list) {
    return list.map(([name, emoji]) => ({ name, emoji }));
  }

  // Varje nivå är ett tema med grupper ("lådor") att sortera till.
  // Gruppens ikon får inte vara en av bilderna som ska sorteras.
  const LEVELS = [
    {
      name: 'Djur', icon: '🐾', sub: 'Simmar, går eller flyger?',
      question: 'Simmar det, går det eller flyger det?',
      bins: [
        { label: 'Simmar', icon: '🌊', items: items([['fisk', '🐟'], ['delfin', '🐬'], ['bläckfisk', '🐙'], ['haj', '🦈'], ['val', '🐋'], ['säl', '🦭']]) },
        { label: 'Går', icon: '👣', items: items([['hund', '🐶'], ['katt', '🐱'], ['ko', '🐮'], ['häst', '🐴'], ['gris', '🐷'], ['lejon', '🦁'], ['elefant', '🐘'], ['björn', '🐻'], ['räv', '🦊']]) },
        { label: 'Flyger', icon: '☁️', items: items([['fågel', '🐦'], ['fjäril', '🦋'], ['örn', '🦅'], ['bi', '🐝'], ['uggla', '🦉'], ['papegoja', '🦜']]) }
      ]
    },
    {
      name: 'Frukt och grönsaker', icon: '🧺', sub: 'Frukt eller grönsak?',
      question: 'Är det en frukt eller en grönsak?',
      bins: [
        { label: 'Frukt', icon: '🍒', items: items([['äpple', '🍎'], ['banan', '🍌'], ['päron', '🍐'], ['apelsin', '🍊'], ['jordgubbe', '🍓'], ['vindruvor', '🍇'], ['vattenmelon', '🍉'], ['ananas', '🍍'], ['kiwi', '🥝'], ['citron', '🍋']]) },
        { label: 'Grönsak', icon: '🥬', items: items([['morot', '🥕'], ['gurka', '🥒'], ['broccoli', '🥦'], ['majs', '🌽'], ['potatis', '🥔'], ['lök', '🧅'], ['paprika', '🫑'], ['aubergine', '🍆']]) }
      ]
    },
    {
      name: 'Årstider', icon: '🍂', sub: 'Vår, sommar, höst eller vinter?',
      question: 'Vilken årstid hör det till?',
      bins: [
        { label: 'Vår', icon: '🌷', items: items([['påskkyckling', '🐣'], ['grodd', '🌱'], ['körsbärsblommor', '🌸']]) },
        { label: 'Sommar', icon: '☀️', items: items([['strand', '🏖️'], ['glass', '🍦'], ['baddräkt', '🩱'], ['jordgubbar', '🍓'], ['solglasögon', '🕶️']]) },
        { label: 'Höst', icon: '🍁', items: items([['svamp', '🍄'], ['pumpa', '🎃'], ['höstlöv', '🍂'], ['kastanj', '🌰']]) },
        { label: 'Vinter', icon: '❄️', items: items([['snögubbe', '⛄'], ['skidor', '🎿'], ['pulka', '🛷'], ['vantar', '🧤'], ['julgran', '🎄']]) }
      ]
    }
  ];

  Teachy.sortGame({
    id: GAME_ID,
    title: 'Sortera',
    grade: 0,
    subject: 'Natur och samhälle',
    icon: '🧺',
    color: '#06a77d',
    description: 'Djur, frukt och grönsaker, årstider.',
    intro: 'Dra bilden till rätt grupp! Tryck på bilden för att höra vad det är.',
    levels: LEVELS
  });
})();
