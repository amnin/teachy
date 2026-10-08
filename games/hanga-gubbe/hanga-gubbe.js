/*
 * Hänga gubbe – gissa bokstäverna i ordet innan gubben är färdigritad.
 *
 * Snäll variant för de minsta: bilden på ordet syns (utom på sista nivån,
 * där den finns bakom "Visa hjälp"), gubben har tio delar så att man får
 * många försök, och klarar man ordet blir gubben räddad och glad.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const ROUND_LENGTH = 6;
  const ALPHABET = 'abcdefghijklmnopqrstuvwxyzåäö'.split('');

  const LEVELS = [
    { name: 'Korta ord', icon: '🐣', sub: '2–3 bokstäver – med bild', min: 2, max: 3, picture: true },
    { name: 'Längre ord', icon: '🐥', sub: '4–5 bokstäver – med bild', min: 4, max: 5, picture: true },
    { name: 'Gissa ordet', icon: '🦅', sub: 'Bilden finns bakom Visa hjälp', min: 3, max: 5, picture: false }
  ];

  // Gubbens delar i den ordning de ritas: först ställningen, sedan gubben
  const PARTS = [
    '<line x1="10" y1="190" x2="110" y2="190"/>',
    '<line x1="35" y1="190" x2="35" y2="15"/>',
    '<line x1="35" y1="15" x2="120" y2="15"/>',
    '<line x1="35" y1="45" x2="65" y2="15"/>',
    '<line x1="120" y1="15" x2="120" y2="40"/>',
    '<circle cx="120" cy="58" r="18" fill="#fff"/><circle cx="114" cy="55" r="2.5" fill="#2b2140" stroke="none"/>' +
      '<circle cx="126" cy="55" r="2.5" fill="#2b2140" stroke="none"/><path d="M112 64 Q120 70 128 64" stroke-width="3"/>',
    '<line x1="120" y1="76" x2="120" y2="130"/>',
    '<line x1="120" y1="90" x2="98" y2="112"/>',
    '<line x1="120" y1="90" x2="142" y2="112"/>',
    '<line x1="120" y1="130" x2="102" y2="162"/><line x1="120" y1="130" x2="138" y2="162"/>'
  ];
  const MAX_WRONG = PARTS.length;

  // Gubben räddad: står glad på marken och vinkar
  const SAVED = '<line x1="10" y1="190" x2="190" y2="190"/>' +
    '<circle cx="100" cy="72" r="18" fill="#fff"/><circle cx="94" cy="69" r="2.5" fill="#2b2140" stroke="none"/>' +
    '<circle cx="106" cy="69" r="2.5" fill="#2b2140" stroke="none"/><path d="M90 77 Q100 88 110 77" stroke-width="3"/>' +
    '<line x1="100" y1="90" x2="100" y2="144"/><line x1="100" y1="104" x2="76" y2="80"/><line x1="100" y1="104" x2="124" y2="80"/>' +
    '<line x1="100" y1="144" x2="84" y2="188"/><line x1="100" y1="144" x2="116" y2="188"/>' +
    '<text x="150" y="60" font-size="34" stroke="none">🎉</text>';

  function drawing(wrong, saved) {
    return '<svg viewBox="0 0 200 200" fill="none" stroke="#2b2140" stroke-width="5" stroke-linecap="round" aria-hidden="true">' +
      (saved ? SAVED : PARTS.slice(0, wrong).join('')) + '</svg>';
  }

  function wordsFor(level) {
    return T.data.words.filter(w => /^[a-zåäö]+$/.test(w.word) && w.word.length >= level.min && w.word.length <= level.max);
  }

  T.registerGame({
    id: 'hanga-gubbe',
    title: 'Hänga gubbe',
    grade: 0,
    subject: 'Svenska',
    icon: '🔡',
    color: '#9b5de5',
    description: 'Gissa bokstäverna i ordet.',

    mount(root) {
      const timer = T.timers();

      function showLevels() {
        timer.clear();
        T.levelScreen(root, {
          icon: '🔡',
          title: 'Hänga gubbe',
          text: 'Vilka bokstäver finns i ordet? Tryck på en bokstav. Blir det fel ritas en bit av gubben – klura ut ordet innan han är klar!',
          levels: LEVELS,
          onPick: startRound
        });
      }

      function startRound(level) {
        timer.clear();
        const words = T.sample(wordsFor(level), ROUND_LENGTH);
        const tracker = T.roundTracker(words.length);
        let index = 0;
        let current = null;
        let guessed = new Set();
        let wrong = 0;
        let locked = false;
        let helped = false;

        const art = el('div', { class: 'hang-art' });
        const pic = el('div', { class: 'hang-picture', 'aria-hidden': 'true' });
        const slots = el('div', { class: 'hang-word' });
        const tries = el('p', { class: 'hang-tries' });
        const listen = el('button', {
          class: 'btn btn-listen', type: 'button', text: '🔊 Lyssna',
          onclick: () => T.speak(current.word)
        });
        const help = el('button', {
          class: 'btn btn-help', type: 'button', text: '💡 Visa hjälp',
          onclick: () => showPicture(true)
        });
        const keyboard = el('div', { class: 'hang-keys' });

        root.replaceChildren(el('div', { class: 'screen' }, [
          tracker.bar,
          el('p', { class: 'hint', text: 'Vilka bokstäver finns i ordet?' }),
          el('div', { class: 'quiz-zone hang-zone' }, [
            el('div', { class: 'hang-top' }, [art, pic]),
            slots,
            tries,
            el('div', { class: 'quiz-buttons' }, [listen, help])
          ]),
          keyboard
        ]));

        function showPicture(byHelp) {
          if (byHelp) {
            if (helped || locked) return;
            helped = true;
            T.speak(current.word);
          }
          pic.textContent = current.emoji;
          pic.hidden = false;
          listen.hidden = false;
          help.hidden = true;
          T.replayClass(pic, 'pop-in');
        }

        function drawWord(reveal) {
          slots.replaceChildren(...current.word.split('').map(ch => el('span', {
            class: 'hang-letter' + (guessed.has(ch) ? ' found' : reveal ? ' revealed' : ''),
            text: guessed.has(ch) || reveal ? ch.toLocaleUpperCase('sv-SE') : ''
          })));
        }

        function drawTries() {
          const left = MAX_WRONG - wrong;
          tries.textContent = left === MAX_WRONG ? '' : 'Fel kvar: ' + '❤️'.repeat(left) + '🤍'.repeat(wrong);
        }

        function show() {
          current = words[index];
          guessed = new Set();
          wrong = 0;
          locked = false;
          helped = false;
          tracker.current(index);

          art.innerHTML = drawing(0);
          pic.hidden = true;
          listen.hidden = true;
          help.hidden = level.picture;
          if (level.picture) showPicture(false);
          drawWord(false);
          drawTries();

          keyboard.replaceChildren(...ALPHABET.map(ch => {
            const key = el('button', {
              class: 'hang-key', type: 'button', text: ch.toLocaleUpperCase('sv-SE'), 'aria-label': ch,
              onclick: () => guess(key, ch)
            });
            return key;
          }));

          timer.later(() => T.speak(level.picture
            ? current.word + '. Vilka bokstäver finns i ' + current.word + '?'
            : 'Ordet har ' + current.word.length + ' bokstäver. Gissa en bokstav!'), 400);
        }

        function guess(key, ch) {
          if (locked || key.disabled) return;
          key.disabled = true;
          guessed.add(ch);

          if (current.word.includes(ch)) {
            key.classList.add('right');
            T.chime('right');
            drawWord(false);
            if (current.word.split('').every(c => guessed.has(c))) {
              finish(true);
            } else {
              T.speak(ch);
            }
          } else {
            wrong++;
            key.classList.add('wrong');
            T.chime('wrong');
            art.innerHTML = drawing(wrong);
            drawTries();
            if (wrong >= MAX_WRONG) finish(false);
            else T.speak(ch + '. Den finns inte i ordet.');
          }
        }

        function finish(solved) {
          locked = true;
          // Stjärna om ordet klarades – med hjälp räknas det inte som stjärna
          const star = solved && !helped;
          T.progress.recordAnswer('hanga-gubbe', current.word, star);
          tracker.mark(index, star);
          showPicture(false);
          if (solved) {
            art.innerHTML = drawing(0, true);
            T.replayClass(art, 'pop-in');
            timer.later(() => T.speak('Du räddade gubben! Ordet är ' + current.word + '!'), 350);
          } else {
            drawWord(true);
            timer.later(() => T.speak('Ordet var ' + current.word + '. Bra försök!'), 350);
          }
          timer.later(next, 3200);
        }

        function next() {
          index++;
          if (index < words.length) {
            show();
            return;
          }
          timer.clear();
          T.resultScreen(root, {
            gameId: 'hanga-gubbe', level, score: tracker.stars, total: words.length,
            onReplay: () => startRound(level), onLevels: showLevels
          });
        }

        show();
      }

      showLevels();
      return timer.clear;
    }
  });
})();
