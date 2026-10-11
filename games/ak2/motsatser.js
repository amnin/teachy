/*
 * Motsatser – ord som betyder det motsatta, t.ex. stor och liten.
 */
(function () {
  'use strict';

  Teachy.factGame({
    id: 'motsatser',
    title: 'Motsatser',
    grade: 2,
    subject: 'Svenska',
    icon: '↔️',
    color: '#f15bb5',
    description: 'Stor – liten, varm – kall.',
    intro: 'En motsats är ett ord som betyder det motsatta. Motsatsen till stor är liten!',
    hint: 'Vad är motsatsen?',
    reportTitle: 'Motsatser',
    levels: [
      {
        name: 'Lätta motsatser', icon: '🐘', sub: 'stor – liten, varm – kall',
        questions: [
          ['Vad är motsatsen till stor?', '🐘', 'liten', 'tung', 'hög', 'bred'],
          ['Vad är motsatsen till varm?', '🔥', 'kall', 'het', 'blöt', 'mjuk'],
          ['Vad är motsatsen till glad?', '😀', 'ledsen', 'snäll', 'arg', 'trött'],
          ['Vad är motsatsen till upp?', '⬆️', 'ner', 'ut', 'in', 'fram'],
          ['Vad är motsatsen till lång?', '🦒', 'kort', 'smal', 'tjock', 'liten'],
          ['Vad är motsatsen till snabb?', '🐆', 'långsam', 'trött', 'liten', 'svag'],
          ['Vad är motsatsen till dag?', '☀️', 'natt', 'kväll', 'morgon', 'mörk'],
          ['Vad är motsatsen till öppen?', '🚪', 'stängd', 'trasig', 'tom', 'smal'],
          ['Vad är motsatsen till ny?', '✨', 'gammal', 'smutsig', 'trasig', 'billig'],
          ['Vad är motsatsen till full?', '🥛', 'tom', 'liten', 'lätt', 'halv']
        ]
      },
      {
        name: 'Svårare motsatser', icon: '🦉', sub: 'modig – rädd, tidig – sen',
        questions: [
          ['Vad är motsatsen till modig?', '🦁', 'rädd', 'stark', 'snäll', 'arg'],
          ['Vad är motsatsen till tidig?', '⏰', 'sen', 'långsam', 'trött', 'kort'],
          ['Vad är motsatsen till blöt?', '💧', 'torr', 'varm', 'ren', 'hård'],
          ['Vad är motsatsen till mjuk?', '🧸', 'hård', 'tung', 'kall', 'vass'],
          ['Vad är motsatsen till ljus?', '💡', 'mörk', 'svart', 'natt', 'grå'],
          ['Vad är motsatsen till vinna?', '🏆', 'förlora', 'spela', 'tävla', 'sluta'],
          ['Vad är motsatsen till fråga?', '❓', 'svara', 'säga', 'prata', 'ropa'],
          ['Vad är motsatsen till börja?', '🏁', 'sluta', 'vila', 'stanna', 'gå'],
          ['Vad är motsatsen till billig?', '💰', 'dyr', 'rik', 'stor', 'fin'],
          ['Vad är motsatsen till ren?', '🧼', 'smutsig', 'blöt', 'trasig', 'gammal']
        ]
      }
    ]
  });
})();
