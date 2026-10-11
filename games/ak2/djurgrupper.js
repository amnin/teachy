/*
 * Djurgrupper – däggdjur, fåglar, fiskar och insekter.
 */
(function () {
  'use strict';

  const items = list => list.map(([name, emoji]) => ({ name, emoji }));

  Teachy.sortGame({
    id: 'djurgrupper',
    title: 'Djurgrupper',
    grade: 2,
    subject: 'NO',
    icon: '🦉',
    color: '#9b5de5',
    description: 'Däggdjur, fåglar, fiskar och insekter.',
    intro: 'Däggdjur har päls och dricker mjölk när de är små. Fåglar har fjädrar. Fiskar andas med gälar. Insekter har sex ben.',
    levels: [
      {
        name: 'Djur i Sverige', icon: '🦌', sub: 'Däggdjur, fåglar, fiskar, insekter',
        question: 'Vilken grupp hör djuret till?',
        bins: [
          { label: 'Däggdjur', icon: '🐻', items: items([['älg', '🫎'], ['räv', '🦊'], ['igelkott', '🦔'], ['hare', '🐇'], ['ekorre', '🐿️']]) },
          { label: 'Fåglar', icon: '🐦', items: items([['uggla', '🦉'], ['anka', '🦆'], ['örn', '🦅'], ['svan', '🦢']]) },
          { label: 'Fiskar', icon: '🐟', items: items([['abborre', '🐟'], ['gädda', '🐠'], ['lax', '🍣']]) },
          { label: 'Insekter', icon: '🐞', items: items([['nyckelpiga', '🐞'], ['bi', '🐝'], ['myra', '🐜'], ['fjäril', '🦋']]) }
        ]
      },
      {
        name: 'Kluriga djur', icon: '🐋', sub: 'Valen är inte en fisk!',
        question: 'Vilken grupp hör djuret till?',
        bins: [
          { label: 'Däggdjur', icon: '🐻', items: items([['val', '🐋'], ['delfin', '🐬'], ['fladdermus', '🦇'], ['säl', '🦭']]) },
          { label: 'Fåglar', icon: '🐦', items: items([['pingvin', '🐧'], ['struts', '🐦'], ['höna', '🐔']]) },
          { label: 'Fiskar', icon: '🐟', items: items([['haj', '🦈'], ['guldfisk', '🐠'], ['blåsfisk', '🐡']]) },
          { label: 'Insekter', icon: '🐞', items: items([['skalbagge', '🪲'], ['gräshoppa', '🦗'], ['fluga', '🪰']]) }
        ]
      }
    ]
  });
})();
