/*
 * Livscykeln – lägg stegen i rätt ordning: ägg → larv → puppa → fjäril.
 * Steg som saknar emoji (puppa, grodrom, grodyngel) ritas som SVG.
 */
(function () {
  'use strict';

  const T = Teachy;

  const svg = inner => '<svg viewBox="0 0 100 100" aria-hidden="true">' + inner + '</svg>';
  const PUPPA = svg('<line x1="20" y1="12" x2="80" y2="12" stroke="#7a5230" stroke-width="6" stroke-linecap="round"/>' +
    '<line x1="50" y1="12" x2="50" y2="24" stroke="#7a5230" stroke-width="3"/>' +
    '<ellipse cx="50" cy="56" rx="17" ry="32" fill="#8bbf5a" stroke="#4f7a2a" stroke-width="3"/>' +
    '<path d="M38 46 Q50 52 62 46 M37 62 Q50 68 63 62" stroke="#4f7a2a" stroke-width="2" fill="none"/>');
  const ROM = svg([[30, 35], [52, 28], [70, 42], [40, 58], [62, 62], [28, 74], [50, 80], [74, 74]]
    .map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="11" fill="#d9f0ff" stroke="#7fb8d8" stroke-width="2"/><circle cx="' + x + '" cy="' + y + '" r="4" fill="#2b2140"/>').join(''));
  const YNGEL = svg('<path d="M48 50 Q70 30 92 50 Q70 70 48 50" fill="#4a4a4a"/><circle cx="38" cy="50" r="18" fill="#2b2b2b"/><circle cx="31" cy="45" r="3" fill="#fff"/>');

  const step = (caption, picture) => (picture.startsWith('<svg')
    ? { label: caption, caption, svg: picture }
    : { label: caption, caption, emoji: picture });

  const CYCLES = [
    { name: 'Fjärilen', group: 'djur', praise: 'Först ett ägg, sedan en larv, sedan en puppa – och till sist en fjäril!',
      steps: [step('ägg', '🥚'), step('larv', '🐛'), step('puppa', PUPPA), step('fjäril', '🦋')] },
    { name: 'Grodan', group: 'djur', praise: 'Grodrom blir grodyngel, och grodyngel blir grodor!',
      steps: [step('grodrom', ROM), step('grodyngel', YNGEL), step('groda', '🐸')] },
    { name: 'Hönan', group: 'djur', praise: 'Ägget kläcks, kycklingen växer och blir en höna!',
      steps: [step('ägg', '🥚'), step('kläcks', '🐣'), step('kyckling', '🐥'), step('höna', '🐔')] },
    { name: 'Människan', group: 'djur', praise: 'Bebis, barn, vuxen och till sist gammal!',
      steps: [step('bebis', '👶'), step('barn', '🧒'), step('vuxen', '🧑'), step('gammal', '🧓')] },
    { name: 'Solrosen', group: 'växter', praise: 'Fröet gror, plantan växer och blir en blomma!',
      steps: [step('frö', '🫘'), step('grodd', '🌱'), step('planta', '🌿'), step('blomma', '🌻')] },
    { name: 'Äpplet', group: 'växter', praise: 'Först en blomma, sedan en liten kart, och till sist ett äpple!',
      steps: [step('blomma', '🌸'), step('kart', '🍏'), step('äpple', '🍎')] },
    { name: 'Eken', group: 'växter', praise: 'Ett litet ekollon kan bli ett stort träd!',
      steps: [step('ekollon', '🌰'), step('grodd', '🌱'), step('träd', '🌳')] }
  ];

  T.orderGame({
    id: 'livscykel',
    title: 'Livscykeln',
    grade: 1,
    subject: 'NO',
    icon: '🦋',
    color: '#2bb673',
    description: 'Ägg, larv, puppa, fjäril – i rätt ordning.',
    intro: 'Djur och växter förändras när de växer. Tryck på bilderna i rätt ordning – vad kommer först?',
    hint: 'Vad kommer först? Tryck i rätt ordning',
    levels: [
      { name: 'Djur', icon: '🐸', sub: 'Fjäril, groda, höna, människa', group: 'djur' },
      { name: 'Växter', icon: '🌻', sub: 'Solros, äpple, ek', group: 'växter' }
    ],
    // En runda = alla livscykler i gruppen, i blandad ordning
    makeTasks: level => T.shuffle(CYCLES.filter(c => c.group === level.group)),
    report: { title: 'Livscykler', keys: CYCLES.map(c => c.name) },
    render: cycle => ({
      say: cycle.name + '. Vad kommer först? Tryck i rätt ordning.',
      retry: 'Vad kommer sen?',
      praise: cycle.praise,
      item: cycle.name,
      arrows: true,
      steps: cycle.steps
    })
  });
})();
