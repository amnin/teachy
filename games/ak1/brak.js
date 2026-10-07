/*
 * Halvor och fjärdedelar – enkla bråk som del av en helhet.
 * Felsvaren är bland annat bilder med OLIKA stora delar, så att man lär sig
 * att en halv betyder två LIKA stora delar.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const FRACTIONS = {
    2: { name: 'en halv', key: 'En halv', parts: 'två' },
    3: { name: 'en tredjedel', key: 'En tredjedel', parts: 'tre' },
    4: { name: 'en fjärdedel', key: 'En fjärdedel', parts: 'fyra' }
  };
  // Olika stora delar (andelar av helheten) för "fel"-bilderna
  const UNEQUAL = { 2: [0.3, 0.7], 3: [0.2, 0.3, 0.5], 4: [0.1, 0.2, 0.3, 0.4] };

  const LEVELS = [
    { name: 'En halv', icon: '🍕', sub: 'Två lika stora delar', targets: [2], others: [4] },
    { name: 'Halv eller fjärdedel', icon: '🍫', sub: '½ och ¼', targets: [2, 4], others: [2, 4] },
    { name: 'Blandat', icon: '🦅', sub: '½, ⅓ och ¼', targets: [2, 3, 4], others: [2, 3, 4] }
  ];

  const SHADE = '#ff8a3d';
  const PLAIN = '#ffe8c7';
  const LINE = '#7a5230';

  // Cirkel ("pizza") delad i delar med givna andelar; första delen är färgad
  function pie(shares) {
    const cx = 80, cy = 80, r = 70;
    let angle = -Math.PI / 2;
    const paths = shares.map((share, i) => {
      const a1 = angle;
      const a2 = angle + share * 2 * Math.PI;
      angle = a2;
      const large = share > 0.5 ? 1 : 0;
      const p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)].map(v => v.toFixed(1));
      const p2 = [cx + r * Math.cos(a2), cy + r * Math.sin(a2)].map(v => v.toFixed(1));
      return '<path d="M' + cx + ',' + cy + ' L' + p1 + ' A' + r + ',' + r + ' 0 ' + large + ' 1 ' + p2 + ' Z" fill="' +
        (i === 0 ? SHADE : PLAIN) + '" stroke="' + LINE + '" stroke-width="3"/>';
    });
    return '<svg viewBox="0 0 160 160" aria-hidden="true">' + paths.join('') + '</svg>';
  }

  // Rektangel ("chokladkaka") delad i lodräta delar
  function bar(shares) {
    let x = 10;
    const rects = shares.map((share, i) => {
      const w = share * 180;
      const rect = '<rect x="' + x.toFixed(1) + '" y="30" width="' + w.toFixed(1) + '" height="100" fill="' +
        (i === 0 ? SHADE : PLAIN) + '" stroke="' + LINE + '" stroke-width="3"/>';
      x += w;
      return rect;
    });
    return '<svg viewBox="0 0 200 160" aria-hidden="true">' + rects.join('') + '</svg>';
  }

  const equal = n => Array.from({ length: n }, () => 1 / n);

  function makeTask(level) {
    const n = T.pick(level.targets);
    const draw = T.pick([pie, bar]);
    const other = T.pick(level.others.filter(o => o !== n));
    return {
      n,
      options: T.shuffle([
        { svg: draw(equal(n)), correct: true },
        { svg: draw(UNEQUAL[n]) },                 // rätt antal delar, men olika stora
        { svg: draw(equal(other)) }                // lika stora delar, men fel antal
      ])
    };
  }

  T.quizGame({
    id: 'brak',
    title: 'Halvor och fjärdedelar',
    grade: 1,
    subject: 'Matematik',
    icon: '🍕',
    color: '#ff5d73',
    description: 'Vilken bild visar en halv?',
    intro: 'En halv är en av två LIKA stora delar. En fjärdedel är en av fyra lika stora delar.',
    hint: 'Titta på den färgade delen',
    levels: LEVELS,
    makeTasks: (level, n) => Array.from({ length: n }, () => makeTask(level)),
    report: { title: 'Bråk', keys: ['En halv', 'En tredjedel', 'En fjärdedel'] },
    render: task => {
      const f = FRACTIONS[task.n];
      return {
        prompt: el('div', { class: 'read-sentence', text: 'Var är ' + f.name + ' färgad?' }),
        say: 'Vilken bild visar ' + f.name + '? Titta på den färgade delen.',
        praise: 'Ja! ' + f.parts.charAt(0).toUpperCase() + f.parts.slice(1) + ' lika stora delar. En del är ' + f.name + '.',
        item: f.key,
        choiceClass: 'scene-tile',
        choices: task.options.map((o, i) => ({
          label: 'Bild ' + (i + 1),
          correct: !!o.correct,
          content: T.picture(o, 'scene')
        }))
      };
    }
  });
})();
