/*
 * Lägesord – lyssna på meningen ("Katten är under bordet") och tryck på rätt bild.
 */
(function () {
  'use strict';

  const GAME_ID = 'lagesord';
  const ROUND_LENGTH = 10;

  const ANIMALS = [
    { emoji: '🐈', name: 'Katten' },
    { emoji: '🐕', name: 'Hunden' },
    { emoji: '🐇', name: 'Kaninen' },
    { emoji: '🐁', name: 'Musen' },
    { emoji: '🦆', name: 'Ankan' }
  ];

  // ---------- Bilder (SVG, 200×160, golvet vid y=135) ----------

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

  const ALL_WORDS = ['på', 'under', 'bredvid', 'bakom', 'framför'];

  const LEVELS = [
    { name: 'Bordet', icon: '🍽️', sub: 'på, under, bredvid', objects: ['bord'], choices: 3 },
    { name: 'Lådan', icon: '📦', sub: 'på, bakom, framför, bredvid', objects: ['låda'], choices: 3 },
    { name: 'Blandat', icon: '🦅', sub: 'Alla lägesord', objects: ['bord', 'låda'], choices: 4 }
  ];

  function scene(objectKey, word, emoji) {
    return '<svg viewBox="0 0 200 160" aria-hidden="true">' + FLOOR + OBJECTS[objectKey].draw(word, emoji) + '</svg>';
  }

  function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function makeTasks(level, n) {
    const tasks = [];
    let last = null;
    while (tasks.length < n) {
      const objectKey = level.objects[rand(0, level.objects.length - 1)];
      const words = OBJECTS[objectKey].words;
      const word = words[rand(0, words.length - 1)];
      if (objectKey + word === last) continue;
      last = objectKey + word;
      const count = Math.min(level.choices, words.length);
      const options = Teachy.shuffle([word, ...Teachy.sample(words.filter(w => w !== word), count - 1)]);
      tasks.push({ objectKey, word, options, animal: ANIMALS[rand(0, ANIMALS.length - 1)] });
    }
    return tasks;
  }

  Teachy.registerGame({
    id: GAME_ID,
    title: 'Lägesord',
    subject: 'Matematik',
    icon: '📦',
    color: '#4361ee',
    description: 'På, under, bakom – var är djuret?',

    renderProgress(progress, T) {
      return T.accuracyReport(ALL_WORDS, progress.items, 'Lägesord');
    },

    mount(root, T) {
      const { el } = T;
      const timer = T.timers();

      function showLevels() {
        timer.clear();
        T.levelScreen(root, {
          icon: '📦',
          title: 'Lägesord',
          text: 'Lyssna på var djuret är och tryck på rätt bild!',
          levels: LEVELS,
          onPick: startRound
        });
      }

      function startRound(level) {
        timer.clear();
        T.quizRound(root, {
          gameId: GAME_ID,
          level,
          tasks: makeTasks(level, ROUND_LENGTH),
          hint: 'Lyssna och tryck på rätt bild',
          timer,
          onReplay: () => startRound(level),
          onLevels: showLevels,
          render: task => {
            const sentence = task.animal.name + ' är ' + task.word + ' ' + OBJECTS[task.objectKey].name + '.';
            return {
              prompt: el('div', { class: 'quiz-sentence' }, [
                el('span', { class: 'quiz-sentence-emoji', text: task.animal.emoji }),
                el('span', { text: sentence })
              ]),
              say: sentence,
              praise: 'Ja! ' + sentence,
              item: task.word,
              choiceClass: 'scene-tile',
              choices: task.options.map(word => {
                const picture = el('span', { class: 'scene' });
                picture.innerHTML = scene(task.objectKey, word, task.animal.emoji);
                return { label: word, correct: word === task.word, content: picture };
              })
            };
          }
        });
      }

      showLevels();
      return timer.clear;
    }
  });
})();
