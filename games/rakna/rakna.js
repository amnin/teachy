/*
 * Räkna – enkla plus- och minusuppgifter. På de lättare nivåerna kan barnet
 * trycka på "Visa hjälp" för att få bilder att räkna på, på den svåraste
 * finns bara siffror.
 */
(function () {
  'use strict';

  const ROUND_LENGTH = 10;
  const LEVELS = [
    { name: 'Plus till 5', icon: '🍎', ops: ['+'], max: 5, pictures: true, choices: 3 },
    { name: 'Plus till 10', icon: '🍓', ops: ['+'], max: 10, pictures: true, choices: 4 },
    { name: 'Minus till 10', icon: '🎈', ops: ['-'], max: 10, pictures: true, choices: 4 },
    { name: 'Plus & minus till 20', icon: '🚀', ops: ['+', '-'], max: 20, pictures: false, choices: 4 }
  ];
  const THINGS = ['🍎', '🍓', '⭐', '🐞', '🎈', '🐟', '🍪', '🌸', '🚗', '🐥'];

  // Visa riktigt minustecken (−) men spara med vanligt (-)
  const SIGN = { '+': '+', '-': '−' };
  const WORD = { '+': 'plus', '-': 'minus' };

  function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function makeProblem(level) {
    const op = level.ops[rand(0, level.ops.length - 1)];
    let a, b, answer;
    if (op === '+') {
      answer = rand(2, level.max);
      a = rand(1, answer - 1);
      b = answer - a;
    } else {
      a = rand(2, level.max);
      b = rand(1, a - 1);
      answer = a - b;
    }
    return { a, b, op, answer, key: a + op + b };
  }

  function makeProblems(level, n) {
    const seen = new Set();
    const list = [];
    for (let tries = 0; list.length < n && tries < 500; tries++) {
      const p = makeProblem(level);
      if (seen.has(p.key)) continue;
      seen.add(p.key);
      list.push(p);
    }
    return list;
  }

  // Svarsalternativ: rätt svar plus närliggande tal, sorterade i storleksordning
  function makeChoices(answer, level) {
    const near = [];
    for (let d = 1; near.length < 8 && d <= level.max; d++) {
      if (answer - d >= 0) near.push(answer - d);
      if (answer + d <= level.max) near.push(answer + d);
    }
    const others = Teachy.sample(near.slice(0, 4), level.choices - 1);
    return [answer, ...others].sort((x, y) => x - y);
  }

  Teachy.registerGame({
    id: 'rakna',
    title: 'Räkna',
    grade: [0, 1],
    subject: 'Matematik',
    icon: '➕',
    color: '#2bb673',
    description: 'Plus och minus – med bilder eller siffror.',

    // Framstegssidan: träffsäkerhet för plus och minus, och vilka tal som är svårast
    renderProgress(progress, T) {
      const { el } = T;
      const entries = Object.entries(progress.items);
      const rate = s => s.right / (s.right + s.wrong);

      const summary = ['+', '-'].map(op => {
        const own = entries.filter(([key]) => key.includes(op));
        const right = own.reduce((sum, [, s]) => sum + s.right, 0);
        const wrong = own.reduce((sum, [, s]) => sum + s.wrong, 0);
        if (!right && !wrong) {
          return el('div', { class: 'letter-stat none' }, [el('strong', { text: SIGN[op] }), el('span', { text: '–' })]);
        }
        const r = right / (right + wrong);
        return el('div', {
          class: 'letter-stat ' + (r >= 0.8 ? 'good' : r >= 0.5 ? 'ok' : 'bad'),
          title: right + ' rätt, ' + wrong + ' med fel'
        }, [el('strong', { text: SIGN[op] }), el('span', { text: Math.round(r * 100) + '%' })]);
      });

      const hardest = entries
        .filter(([, s]) => s.wrong > 0)
        .sort((x, y) => rate(x[1]) - rate(y[1]) || y[1].wrong - x[1].wrong)
        .slice(0, 8);

      return el('div', null, [
        el('h3', { text: 'Plus och minus' }),
        el('p', { class: 'muted small', text: 'Andel rätt på första försöket.' }),
        el('div', { class: 'letter-stats' }, summary),
        hardest.length ? el('h3', { text: 'Svåraste uppgifterna' }) : null,
        hardest.length ? el('div', { class: 'problem-stats' }, hardest.map(([key, s]) => {
          const op = key.includes('+') ? '+' : '-';
          const [a, b] = key.split(op);
          return el('div', {
            class: 'letter-stat ' + (rate(s) >= 0.5 ? 'ok' : 'bad'),
            title: s.right + ' rätt, ' + s.wrong + ' med fel'
          }, [
            el('strong', { text: a + ' ' + SIGN[op] + ' ' + b }),
            el('span', { text: s.wrong + ' fel' })
          ]);
        })) : null
      ]);
    },

    mount(root, T) {
      const { el } = T;
      const timer = T.timers();

      // Bildhjälp av/på – sparas per profil
      const picturesKey = 'rakna:pictures:' + T.profiles.current().id;
      const picturesOn = () => T.store.get(picturesKey, true);

      // ---------- Välj nivå ----------

      function showLevels() {
        timer.clear();
        const on = picturesOn();
        T.levelScreen(root, {
          icon: '➕',
          title: 'Räkna',
          text: 'Räkna ut svaret och tryck på rätt siffra!',
          levels: LEVELS.map(level => Object.assign({}, level, {
            sub: !level.pictures ? 'Bara siffror' : on ? 'Hjälp med bilder' : 'Utan bilder'
          })),
          onPick: startRound,
          options: el('div', { class: 'options' }, [
            T.toggle('Bilder som hjälp', on, value => {
              T.store.set(picturesKey, value);
              showLevels();
            })
          ])
        });
      }

      // ---------- En runda ----------

      function startRound(level) {
        timer.clear();
        const problems = makeProblems(level, ROUND_LENGTH);
        const showPictures = level.pictures && picturesOn();
        const tracker = T.roundTracker(problems.length);
        let index = 0;
        let mistakes = 0;
        let locked = false;
        let current = null;
        let tiles = [];
        let helped = false;

        const pictures = el('div', { class: 'math-pictures', 'aria-hidden': 'true' });
        const answerBox = el('span', { class: 'math-answer', text: '?' });
        const equation = el('div', { class: 'math-equation' });
        const choices = el('div', { class: 'letters' });
        const listen = el('button', {
          class: 'btn btn-listen', type: 'button', text: '🔊 Lyssna',
          onclick: () => T.speak(spoken(current))
        });
        const help = el('button', {
          class: 'btn btn-help', type: 'button', text: '💡 Visa hjälp',
          onclick: showHelp
        });

        root.replaceChildren(el('div', { class: 'screen rakna' }, [
          tracker.bar,
          el('div', { class: 'math-zone' }, [
            pictures, equation,
            el('div', { class: 'math-buttons' }, [listen, help])
          ]),
          choices
        ]));

        function spoken(p) {
          return p.a + ' ' + WORD[p.op] + ' ' + p.b;
        }

        // Bildstöd: plus = två grupper, minus = en grupp där några "försvinner"
        function group(count, thing, goneFrom) {
          const node = el('div', { class: 'math-group' });
          node.style.setProperty('--cols', String(Math.min(count, 5)));
          for (let i = 0; i < count; i++) {
            node.append(el('span', { class: goneFrom != null && i >= goneFrom ? 'gone' : null, text: thing }));
          }
          return node;
        }

        // Bilderna visas först när barnet ber om hjälp, så att talet räknas
        // ut i huvudet i stället för att bara räkna bilderna
        function showHelp() {
          if (helped || locked) return;
          helped = true;
          const thing = THINGS[rand(0, THINGS.length - 1)];
          pictures.replaceChildren(...(current.op === '+'
            ? [group(current.a, thing), el('span', { class: 'math-sign', text: '+' }), group(current.b, thing)]
            : [group(current.a, thing, current.a - current.b)]));
          pictures.hidden = false;
          T.replayClass(pictures, 'pop-in');
          help.hidden = true;
        }

        function showProblem() {
          current = problems[index];
          mistakes = 0;
          locked = false;
          helped = false;
          tracker.current(index);

          pictures.replaceChildren();
          pictures.hidden = true;
          help.hidden = !showPictures;

          answerBox.textContent = '?';
          answerBox.className = 'math-answer';
          equation.replaceChildren(
            el('span', { text: current.a }),
            el('span', { class: 'math-op', text: SIGN[current.op] }),
            el('span', { text: current.b }),
            el('span', { class: 'math-op', text: '=' }),
            answerBox
          );
          T.replayClass(equation, 'pop-in');

          tiles = makeChoices(current.answer, level).map(n => {
            const tile = el('button', {
              class: 'tile num-tile', type: 'button', 'aria-label': String(n),
              onclick: () => choose(tile, n)
            }, [el('span', { class: 'tile-up', text: n })]);
            tile.dataset.value = n;
            return tile;
          });
          choices.replaceChildren(...tiles);

          timer.later(() => T.speak(spoken(current)), 400);
        }

        function choose(tile, n) {
          if (locked || tile.disabled) return;

          if (n === current.answer) {
            locked = true;
            tile.classList.add('right');
            answerBox.textContent = n;
            answerBox.className = 'math-answer right';
            T.chime('right');

            // Med hjälp räknas det inte som rätt på första försöket
            const clean = mistakes === 0 && !helped;
            T.progress.recordAnswer('rakna', current.key, clean);
            tracker.mark(index, clean);
            help.hidden = true;

            timer.later(() => T.speak(spoken(current) + ' är ' + current.answer), 350);
            timer.later(next, 2200);
          } else {
            mistakes++;
            T.chime('wrong');
            T.replayClass(tile, 'wrong');
            tile.disabled = true;
            timer.later(() => T.speak(spoken(current)), 350);

            // Efter två fel: visa var rätt svar är
            if (mistakes >= 2) {
              const right = tiles.find(t => Number(t.dataset.value) === current.answer);
              if (right) right.classList.add('nudge');
            }
          }
        }

        function next() {
          index++;
          if (index < problems.length) {
            showProblem();
            return;
          }
          timer.clear();
          T.resultScreen(root, {
            gameId: 'rakna',
            // Märk rundor där bildstödet var avstängt, så det syns i historiken
            level: level.pictures && !showPictures ? { name: level.name + ' (utan bilder)' } : level,
            score: tracker.stars,
            total: problems.length,
            onReplay: () => startRound(level),
            onLevels: showLevels
          });
        }

        showProblem();
      }

      showLevels();
      return timer.clear;
    }
  });
})();
