/*
 * Bilder till lägesord: ett djur på, under, bredvid, bakom eller framför
 * ett bord eller en låda. Används av Lägesord och Läs meningen.
 * Ritas som SVG (200×160, golvet vid y=135).
 */
(function () {
  'use strict';

  const ANIMALS = [
    { emoji: '🐈', name: 'Katten' },
    { emoji: '🐕', name: 'Hunden' },
    { emoji: '🐇', name: 'Kaninen' },
    { emoji: '🐁', name: 'Musen' },
    { emoji: '🦆', name: 'Ankan' }
  ];

  const FLOOR = '<line x1="0" y1="135" x2="200" y2="135" stroke="#e5d9c4" stroke-width="3"/>';

  function animal(emoji, x, y, size) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" text-anchor="middle">' + emoji + '</text>';
  }

  const TABLE =
    '<rect x="40" y="70" width="120" height="10" rx="3" fill="#b07a4a"/>' +
    '<rect x="48" y="80" width="8" height="55" fill="#8d5f37"/>' +
    '<rect x="144" y="80" width="8" height="55" fill="#8d5f37"/>';

  const BOX =
    '<polygon points="60,75 140,75 156,61 76,61" fill="#ddb07a" stroke="#7a5230" stroke-width="2"/>' +
    '<polygon points="140,75 156,61 156,121 140,135" fill="#a8743f" stroke="#7a5230" stroke-width="2"/>' +
    '<rect x="60" y="75" width="80" height="60" fill="#c8955c" stroke="#7a5230" stroke-width="2"/>';

  const OBJECTS = {
    bord: {
      name: 'bordet',
      words: ['på', 'under', 'bredvid'],
      draw(word, a) {
        if (word === 'på') return TABLE + animal(a, 100, 67, 40);
        if (word === 'under') return TABLE + animal(a, 100, 130, 40);
        return TABLE + animal(a, 178, 130, 40);
      }
    },
    låda: {
      name: 'lådan',
      words: ['på', 'bakom', 'framför', 'bredvid'],
      draw(word, a) {
        if (word === 'på') return BOX + animal(a, 108, 64, 40);
        // Bakom: djuret ritas först så att lådan skymmer det
        if (word === 'bakom') return animal(a, 112, 64, 36) + BOX;
        // Framför: djuret ritas sist, lite större och längre fram
        if (word === 'framför') return BOX + animal(a, 98, 153, 46);
        return BOX + animal(a, 180, 130, 40);
      }
    }
  };

  function scene(objectKey, word, emoji) {
    return '<svg viewBox="0 0 200 160" aria-hidden="true">' + FLOOR + OBJECTS[objectKey].draw(word, emoji) + '</svg>';
  }

  Teachy.data.scenes = { ANIMALS, OBJECTS, scene };
})();
