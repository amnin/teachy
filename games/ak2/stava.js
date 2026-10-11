/*
 * Stava rätt – kort vokal ger dubbel konsonant: katt, boll, glass.
 */
(function () {
  'use strict';

  Teachy.factGame({
    id: 'stava-dubbel',
    title: 'Stava rätt',
    grade: 2,
    subject: 'Svenska',
    icon: '✏️',
    color: '#ff8a3d',
    description: 'Katt eller kat? Dubbelteckning.',
    intro: 'Låter vokalen kort skriver man ofta två konsonanter efter: katt, boll, glass. Låter den lång blir det en: hus, sol, bil.',
    hint: 'Hur stavas ordet?',
    reportTitle: 'Stavning',
    readOptions: false,
    levels: [
      {
        name: 'Kort eller lång?', icon: '🐱', sub: 'katt – kat, sol – soll',
        questions: [
          [['Hur stavas ordet?', 'Hur stavas katt?'], '🐱', 'katt', 'kat', 'kkat'],
          [['Hur stavas ordet?', 'Hur stavas boll?'], '⚽', 'boll', 'bol', 'bboll'],
          [['Hur stavas ordet?', 'Hur stavas glass?'], '🍦', 'glass', 'glas', 'glasss'],
          [['Hur stavas ordet?', 'Hur stavas sol?'], '☀️', 'sol', 'soll', 'sool'],
          [['Hur stavas ordet?', 'Hur stavas hus?'], '🏠', 'hus', 'huss', 'hhus'],
          [['Hur stavas ordet?', 'Hur stavas bil?'], '🚗', 'bil', 'bill', 'biil'],
          [['Hur stavas ordet?', 'Hur stavas hatt?'], '🎩', 'hatt', 'hat', 'hatd'],
          [['Hur stavas ordet?', 'Hur stavas mus?'], '🐭', 'mus', 'muss', 'muus'],
          [['Hur stavas ordet?', 'Hur stavas kaka?'], '🍪', 'kaka', 'kakka', 'kakaa'],
          [['Hur stavas ordet?', 'Hur stavas snäcka?'], '🐚', 'snäcka', 'snäka', 'snäcca'],
          [['Hur stavas ordet?', 'Hur stavas eld?'], '🔥', 'eld', 'elld', 'eeld'],
          [['Hur stavas ordet?', 'Hur stavas ägg?'], '🥚', 'ägg', 'äg', 'äggg']
        ]
      },
      {
        name: 'Svårare ord', icon: '🦅', sub: 'hammare, docka, mössa',
        questions: [
          [['Hur stavas ordet?', 'Hur stavas hammare?'], '🔨', 'hammare', 'hamare', 'hammarre'],
          [['Hur stavas ordet?', 'Hur stavas docka?'], '🪆', 'docka', 'doka', 'dokka'],
          [['Hur stavas ordet?', 'Hur stavas keps?'], '🧢', 'keps', 'kepps', 'käps'],
          [['Hur stavas ordet?', 'Hur stavas orm?'], '🐍', 'orm', 'ormm', 'oorm'],
          [['Hur stavas ordet?', 'Hur stavas måne?'], '🌙', 'måne', 'månne', 'måånne'],
          [['Hur stavas ordet?', 'Hur stavas tand?'], '🦷', 'tand', 'tannd', 'tandd'],
          [['Hur stavas ordet?', 'Hur stavas äpple?'], '🍎', 'äpple', 'äple', 'äpplle'],
          [['Hur stavas ordet?', 'Hur stavas vante?'], '🧤', 'vante', 'vannte', 'vantte'],
          [['Hur stavas ordet?', 'Hur stavas groda?'], '🐸', 'groda', 'grodda', 'grooda'],
          [['Hur stavas ordet?', 'Hur stavas ryggsäck?'], '🎒', 'ryggsäck', 'rygsäck', 'ryggsäk'],
          [['Hur stavas ordet?', 'Hur stavas pojke?'], '🧒', 'pojke', 'pojjke', 'poike'],
          [['Hur stavas ordet?', 'Hur stavas fågel?'], '🐦', 'fågel', 'fåggel', 'fågell']
        ]
      }
    ]
  });
})();
