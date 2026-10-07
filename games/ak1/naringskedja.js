/*
 * Vem äter vem? – bygg en enkel näringskedja: gräs → hare → räv.
 */
(function () {
  'use strict';

  const T = Teachy;

  const CHAINS = [
    { steps: [['gräs', '🌿'], ['hare', '🐇'], ['räv', '🦊']], praise: 'Haren äter gräs, och räven äter haren.' },
    { steps: [['frön', '🌾'], ['mus', '🐁'], ['uggla', '🦉']], praise: 'Musen äter frön, och ugglan äter musen.' },
    { steps: [['blad', '🍃'], ['larv', '🐛'], ['fågel', '🐦']], praise: 'Larven äter blad, och fågeln äter larven.' },
    { steps: [['blad', '🍃'], ['snigel', '🐌'], ['igelkott', '🦔']], praise: 'Snigeln äter blad, och igelkotten äter snigeln.' },
    { steps: [['gräs', '🌿'], ['rådjur', '🦌'], ['varg', '🐺']], praise: 'Rådjuret äter gräs, och vargen äter rådjuret.' },
    { steps: [['räka', '🦐'], ['fisk', '🐟'], ['säl', '🦭']], praise: 'Fisken äter räkor, och sälen äter fisken.' },
    { steps: [['blad', '🍃'], ['larv', '🐛'], ['fågel', '🐦'], ['örn', '🦅']], praise: 'Larven äter blad, fågeln äter larven och örnen äter fågeln.' },
    { steps: [['frön', '🌾'], ['mus', '🐁'], ['orm', '🐍'], ['örn', '🦅']], praise: 'Musen äter frön, ormen äter musen och örnen äter ormen.' },
    { steps: [['gräs', '🌿'], ['gräshoppa', '🦗'], ['groda', '🐸'], ['orm', '🐍']], praise: 'Gräshoppan äter gräs, grodan äter gräshoppan och ormen äter grodan.' }
  ];

  T.orderGame({
    id: 'naringskedja',
    title: 'Vem äter vem?',
    grade: 1,
    subject: 'NO',
    icon: '🦊',
    color: '#ff8a3d',
    description: 'Bygg en näringskedja.',
    intro: 'I en näringskedja äter djuren varandra. Börja med växten – vem äter den? Och vem äter sedan det djuret?',
    hint: 'Börja med växten. Vem äter vem?',
    levels: [
      { name: 'Tre i kedjan', icon: '🐣', sub: 'Gräs → hare → räv', size: 3 },
      { name: 'Fyra i kedjan', icon: '🦅', sub: 'Längre kedjor', size: 4 }
    ],
    makeTasks: level => T.shuffle(CHAINS.filter(c => c.steps.length === level.size)),
    report: { title: 'Kedjor', keys: ['3', '4'] },
    render: chain => ({
      say: 'Vem äter vem? Börja med den som blir uppäten först.',
      retry: 'Vem äter det?',
      praise: chain.praise,
      item: String(chain.steps.length),
      arrows: true,
      steps: chain.steps.map(([name, emoji]) => ({ label: name, caption: name, emoji }))
    })
  });
})();
