/*
 * Former – sortera saker efter form: klot, kon, cylinder, rätblock,
 * och plana former: cirkel, triangel, kvadrat, rektangel.
 */
(function () {
  'use strict';

  const T = Teachy;

  const svg = (inner, w, h) => '<svg viewBox="0 0 ' + (w || 100) + ' ' + (h || 100) + '" aria-hidden="true">' + inner + '</svg>';
  const STROKE = 'stroke="#2b2140" stroke-width="3"';

  // ---------- Kroppar (tre dimensioner) – ikoner till grupperna ----------

  const SOLIDS = {
    klot: svg('<circle cx="50" cy="50" r="40" fill="#9bc7ff" ' + STROKE + '/><ellipse cx="36" cy="36" rx="10" ry="7" fill="#fff" opacity=".7"/>'),
    kon: svg('<path d="M50 8 L84 80 A34 12 0 0 1 16 80 Z" fill="#ffd27a" ' + STROKE + '/>'),
    cylinder: svg('<path d="M22 22 V78 A28 10 0 0 0 78 78 V22" fill="#b5e8c9" ' + STROKE + '/><ellipse cx="50" cy="22" rx="28" ry="10" fill="#d9f5e4" ' + STROKE + '/>'),
    rätblock: svg('<polygon points="14,34 64,34 64,86 14,86" fill="#ffb3c1" ' + STROKE + '/><polygon points="14,34 34,16 84,16 64,34" fill="#ffd1da" ' + STROKE + '/><polygon points="64,34 84,16 84,68 64,86" fill="#f28fa3" ' + STROKE + '/>')
  };

  const items = list => list.map(([name, emoji]) => ({ name, emoji }));

  const SOLID_LEVEL = {
    name: 'Klot, kon, cylinder, rätblock', icon: '⚽', sub: 'Saker i vardagen',
    question: 'Vilken form har den?',
    bins: [
      { label: 'Klot', svg: SOLIDS.klot, items: items([['fotboll', '⚽'], ['basketboll', '🏀'], ['jordglob', '🌍'], ['apelsin', '🍊'], ['kristallkula', '🔮']]) },
      { label: 'Kon', svg: SOLIDS.kon, items: items([['glasstrut', '🍦'], ['julgran', '🎄'], ['vulkan', '🌋']]) },
      { label: 'Cylinder', svg: SOLIDS.cylinder, items: items([['konservburk', '🥫'], ['stearinljus', '🕯️'], ['batteri', '🔋'], ['trumma', '🥁'], ['toarulle', '🧻']]) },
      { label: 'Rätblock', svg: SOLIDS.rätblock, items: items([['kartong', '📦'], ['tegelsten', '🧱'], ['smörpaket', '🧈'], ['bok', '📕'], ['juicepaket', '🧃']]) }
    ]
  };

  // ---------- Plana former (två dimensioner) ----------

  const COLORS = [['röda', '#ff5d73'], ['blå', '#4cc9f0'], ['gula', '#ffb627'], ['gröna', '#2bb673']];

  const FLAT = {
    cirkel: (c, k) => svg('<circle cx="50" cy="50" r="' + [40, 30, 36][k % 3] + '" fill="' + c + '" ' + STROKE + '/>'),
    triangel: (c, k) => svg(['<polygon points="50,12 90,86 10,86"', '<polygon points="20,15 88,50 20,85"', '<polygon points="15,85 85,85 30,20"'][k % 3] + ' fill="' + c + '" ' + STROKE + '/>'),
    kvadrat: (c, k) => svg(['<rect x="15" y="15" width="70" height="70"', '<rect x="25" y="25" width="50" height="50"', '<rect x="20" y="20" width="60" height="60" transform="rotate(20 50 50)"'][k % 3] + ' fill="' + c + '" ' + STROKE + '/>'),
    rektangel: (c, k) => svg(['<rect x="5" y="30" width="90" height="40"', '<rect x="32" y="5" width="36" height="90"', '<rect x="10" y="35" width="80" height="30" transform="rotate(-15 50 50)"'][k % 3] + ' fill="' + c + '" ' + STROKE + '/>')
  };

  const outline = shape => FLAT[shape]('#fff', 0);

  const FLAT_LEVEL = {
    name: 'Plana former', icon: '🔺', sub: 'Cirkel, triangel, kvadrat, rektangel',
    question: 'Vilken form är det?',
    bins: Object.keys(FLAT).map(shape => ({
      label: shape.charAt(0).toUpperCase() + shape.slice(1),
      svg: outline(shape),
      // Namnet säger färgen, inte formen – annars avslöjar uppläsningen svaret
      items: COLORS.flatMap(([colorName, color], k) => [
        { name: 'den ' + colorName + ' formen', svg: FLAT[shape](color, k) }
      ])
    }))
  };

  T.sortGame({
    id: 'former',
    title: 'Former',
    grade: 1,
    subject: 'Matematik',
    icon: '🔷',
    color: '#3a86ff',
    description: 'Klot, kon, cylinder och rätblock.',
    intro: 'Dra varje sak till formen den liknar!',
    levels: [SOLID_LEVEL, FLAT_LEVEL]
  });
})();
