/*
 * Ordklasser – substantiv, verb och adjektiv.
 */
(function () {
  'use strict';

  const T = Teachy;

  const WORDS = {
    substantiv: ['katt', 'boll', 'skola', 'bil', 'äpple', 'lärare', 'hus', 'cykel', 'blomma', 'penna', 'snö', 'hund'],
    verb: ['springa', 'äter', 'hoppar', 'skriva', 'sover', 'läser', 'simma', 'skrattar', 'cyklar', 'sjunga', 'leker', 'måla'],
    adjektiv: ['glad', 'stor', 'röd', 'snabb', 'mjuk', 'kall', 'liten', 'söt', 'trött', 'blå', 'lång', 'arg']
  };
  const ABOUT = {
    substantiv: 'Substantiv är namn på saker, djur och människor – en katt, en boll.',
    verb: 'Verb är något man gör – springa, äter.',
    adjektiv: 'Adjektiv beskriver hur något är – glad, stor, röd.'
  };
  const SENTENCES = [
    ['Hunden', 'springer', 'snabbt', 'verb', 'springer'], ['Den', 'röda', 'bilen', 'adjektiv', 'röda'],
    ['Lisa', 'läser', 'en bok', 'verb', 'läser'], ['Katten', 'är', 'trött', 'adjektiv', 'trött'],
    ['Vi', 'äter', 'glass', 'substantiv', 'glass'], ['Den', 'stora', 'elefanten', 'substantiv', 'elefanten'],
    ['Pappa', 'sjunger', 'högt', 'verb', 'sjunger'], ['Snön', 'är', 'kall', 'adjektiv', 'kall'],
    ['Barnen', 'leker', 'ute', 'substantiv', 'Barnen'], ['Fågeln', 'flyger', 'högt', 'verb', 'flyger']
  ];

  const kinds = Object.keys(WORDS);

  T.factGame({
    id: 'ordklasser',
    title: 'Ordklasser',
    grade: 3,
    subject: 'Svenska',
    icon: '🏷️',
    color: '#9b5de5',
    description: 'Substantiv, verb och adjektiv.',
    intro: 'Substantiv är saker (en katt). Verb är något man gör (springa). Adjektiv beskriver hur något är (glad). Tips: kan du säga "en" eller "ett" före är det ett substantiv!',
    hint: 'Vilken ordklass?',
    reportTitle: 'Ordklasser',
    levels: [
      {
        name: 'Vilken ordklass?', icon: '🏷️', sub: 'katt, springa, glad',
        questions: kinds.flatMap(kind => WORDS[kind].map(word =>
          ['Vilken ordklass är "' + word + '"?', null, [null, kind, '"' + word + '" är ett ' + kind + '. ' + ABOUT[kind]], ...kinds.filter(k => k !== kind)]))
      },
      {
        name: 'Hitta ordet', icon: '🔎', sub: 'Vilket ord är ett verb?',
        questions: SENTENCES.map(([a, b, c, kind, right]) => {
          const words = [a, b, c];
          return ['"' + words.join(' ') + '." Vilket ord är ett ' + kind + '?', null, right, ...words.filter(w => w !== right)];
        })
      },
      {
        name: 'Hitta rätt ord', icon: '🦅', sub: 'Vilket ord är ett adjektiv?',
        questions: kinds.flatMap(kind => WORDS[kind].slice(0, 6).map(word =>
          ['Vilket ord är ett ' + kind + '?', null, word, ...kinds.filter(k => k !== kind).map(k => T.pick(WORDS[k]))]))
      }
    ]
  });
})();
