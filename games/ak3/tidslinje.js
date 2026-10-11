/*
 * Tidslinjen – förr, nu och framtid. Lägg sakerna i ordning från äldst till nyast.
 */
(function () {
  'use strict';

  const T = Teachy;

  const step = (caption, emoji) => ({ label: caption, caption, emoji });

  const LINES = [
    { name: 'Forntiden', group: 'forntid', say: 'Forntiden. Vad kom först?',
      praise: 'Stenåldern, bronsåldern, järnåldern och sist vikingatiden!',
      steps: [step('stenåldern', '🪨'), step('bronsåldern', '🥉'), step('järnåldern', '⚒️'), step('vikingatiden', '⛵')] },
    { name: 'Människans liv', group: 'forntid', say: 'Hur levde människor? Vad kom först?',
      praise: 'Först jagade och samlade man, sedan började man odla, och till slut byggde man städer!',
      steps: [step('jaga och samla', '🏹'), step('odla jorden', '🌾'), step('bo i byar', '🛖'), step('bygga städer', '🏙️')] },
    { name: 'Resor', group: 'saker', say: 'Hur har människor rest? Vad kom först?',
      praise: 'Först gick man, sedan red man på hästar, sedan kom tåget, bilen och flygplanet!',
      steps: [step('gå', '🚶'), step('häst', '🐎'), step('tåg', '🚂'), step('bil', '🚗'), step('flygplan', '✈️')] },
    { name: 'Ljus', group: 'saker', say: 'Hur har människor fått ljus? Vad kom först?',
      praise: 'Först eld, sedan stearinljus, fotogenlampa och till sist glödlampan!',
      steps: [step('eld', '🔥'), step('stearinljus', '🕯️'), step('fotogenlampa', '🏮'), step('glödlampa', '💡')] },
    { name: 'Prata på avstånd', group: 'saker', say: 'Hur har människor pratat på avstånd? Vad kom först?',
      praise: 'Brev, sedan telefon med sladd, och nu mobiltelefoner!',
      steps: [step('brev', '✉️'), step('telefon', '☎️'), step('mobiltelefon', '📱')] },
    { name: 'Musik', group: 'saker', say: 'Hur har människor lyssnat på musik? Vad kom först?',
      praise: 'Grammofon, radio, och nu musik i mobilen!',
      steps: [step('grammofon', '📯'), step('radio', '📻'), step('mobilen', '📱')] },
    { name: 'Dåtid, nutid, framtid', group: 'tid', say: 'Igår, idag och i morgon. Vad kommer först?',
      praise: 'Dåtid är det som har hänt, nutid är nu, och framtid är det som ska hända!',
      steps: [step('igår – dåtid', '⏪'), step('idag – nutid', '⏺️'), step('i morgon – framtid', '⏩')] },
    { name: 'Ett liv', group: 'tid', say: 'Ett människoliv. Vad kommer först?',
      praise: 'Bebis, barn, tonåring, vuxen och till sist gammal!',
      steps: [step('bebis', '👶'), step('barn', '🧒'), step('tonåring', '🧑'), step('vuxen', '🧔'), step('gammal', '🧓')] },
    { name: 'Min skolgång', group: 'tid', say: 'Skolan. Vad kommer först?',
      praise: 'Förskola, förskoleklass, årskurs ett, och sedan fler och fler årskurser!',
      steps: [step('förskola', '🧸'), step('förskoleklass', '🖍️'), step('årskurs 1', '1️⃣'), step('årskurs 3', '3️⃣')] }
  ];

  T.orderGame({
    id: 'tidslinje',
    title: 'Tidslinjen',
    grade: 3,
    subject: 'SO',
    icon: '⏳',
    color: '#9b5de5',
    description: 'Förr, nu och framtid i rätt ordning.',
    intro: 'En tidslinje visar vad som hände först och sist. Tryck på bilderna i rätt ordning – det äldsta först!',
    hint: 'Det äldsta först – tryck i rätt ordning',
    levels: [
      { name: 'Förr och nu', icon: '🕰️', sub: 'Resor, ljus, telefoner', group: 'saker' },
      { name: 'Tid och liv', icon: '⏩', sub: 'Dåtid, nutid, framtid', group: 'tid' },
      { name: 'Forntiden', icon: '🪨', sub: 'Sten, brons, järn, vikingar', group: 'forntid' }
    ],
    makeTasks: level => T.shuffle(LINES.filter(l => l.group === level.group)),
    report: { title: 'Tidslinjer', keys: LINES.map(l => l.name) },
    render: line => ({
      say: line.say,
      retry: 'Vad kommer sen?',
      praise: line.praise,
      item: line.name,
      arrows: true,
      speakSteps: true,
      steps: line.steps
    })
  });
})();
