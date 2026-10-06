/*
 * Sortera – dra bilden till rätt grupp (djur, frukt & grönsaker, årstider).
 */
(function () {
  'use strict';

  const GAME_ID = 'sortera';
  const ROUND_LENGTH = 10;

  function items(list) {
    return list.map(([name, emoji]) => ({ name, emoji }));
  }

  // Varje nivå är ett tema med grupper ("lådor") att sortera till.
  // Gruppens ikon får inte vara en av bilderna som ska sorteras.
  const LEVELS = [
    {
      name: 'Djur', icon: '🐾', sub: 'Simmar, går eller flyger?',
      question: 'Simmar det, går det eller flyger det?',
      bins: [
        { label: 'Simmar', icon: '🌊', items: items([['fisk', '🐟'], ['delfin', '🐬'], ['bläckfisk', '🐙'], ['haj', '🦈'], ['val', '🐋'], ['säl', '🦭']]) },
        { label: 'Går', icon: '👣', items: items([['hund', '🐶'], ['katt', '🐱'], ['ko', '🐮'], ['häst', '🐴'], ['gris', '🐷'], ['lejon', '🦁'], ['elefant', '🐘'], ['björn', '🐻'], ['räv', '🦊']]) },
        { label: 'Flyger', icon: '☁️', items: items([['fågel', '🐦'], ['fjäril', '🦋'], ['örn', '🦅'], ['bi', '🐝'], ['uggla', '🦉'], ['papegoja', '🦜']]) }
      ]
    },
    {
      name: 'Frukt och grönsaker', icon: '🧺', sub: 'Frukt eller grönsak?',
      question: 'Är det en frukt eller en grönsak?',
      bins: [
        { label: 'Frukt', icon: '🍒', items: items([['äpple', '🍎'], ['banan', '🍌'], ['päron', '🍐'], ['apelsin', '🍊'], ['jordgubbe', '🍓'], ['vindruvor', '🍇'], ['vattenmelon', '🍉'], ['ananas', '🍍'], ['kiwi', '🥝'], ['citron', '🍋']]) },
        { label: 'Grönsak', icon: '🥬', items: items([['morot', '🥕'], ['gurka', '🥒'], ['broccoli', '🥦'], ['majs', '🌽'], ['potatis', '🥔'], ['lök', '🧅'], ['paprika', '🫑'], ['aubergine', '🍆']]) }
      ]
    },
    {
      name: 'Årstider', icon: '🍂', sub: 'Vår, sommar, höst eller vinter?',
      question: 'Vilken årstid hör det till?',
      bins: [
        { label: 'Vår', icon: '🌷', items: items([['påskkyckling', '🐣'], ['grodd', '🌱'], ['körsbärsblommor', '🌸']]) },
        { label: 'Sommar', icon: '☀️', items: items([['strand', '🏖️'], ['glass', '🍦'], ['baddräkt', '🩱'], ['jordgubbar', '🍓'], ['solglasögon', '🕶️']]) },
        { label: 'Höst', icon: '🍁', items: items([['svamp', '🍄'], ['pumpa', '🎃'], ['höstlöv', '🍂'], ['kastanj', '🌰']]) },
        { label: 'Vinter', icon: '❄️', items: items([['snögubbe', '⛄'], ['skidor', '🎿'], ['pulka', '🛷'], ['vantar', '🧤'], ['julgran', '🎄']]) }
      ]
    }
  ];

  Teachy.registerGame({
    id: GAME_ID,
    title: 'Sortera',
    grade: 0,
    subject: 'Natur och samhälle',
    icon: '🧺',
    color: '#06a77d',
    description: 'Djur, frukt och grönsaker, årstider.',

    renderProgress(progress, T) {
      const labels = LEVELS.flatMap(level => level.bins.map(b => b.label));
      return T.accuracyReport(labels, progress.items, 'Grupper');
    },

    mount(root, T) {
      const { el } = T;
      const timer = T.timers();

      function showLevels() {
        timer.clear();
        T.levelScreen(root, {
          icon: '🧺',
          title: 'Sortera',
          text: 'Dra bilden till rätt grupp! Tryck på bilden för att höra vad det är.',
          levels: LEVELS,
          onPick: startRound
        });
      }

      function startRound(level) {
        timer.clear();
        const pool = level.bins.flatMap(bin => bin.items.map(item => ({ item, bin })));
        const tasks = T.sample(pool, ROUND_LENGTH);
        const tracker = T.roundTracker(tasks.length);
        let index = 0;
        let mistakes = 0;
        let locked = false;
        let current = null;

        const card = el('div', { class: 'pic-card', role: 'img' });
        const caption = el('div', { class: 'sort-caption', 'aria-live': 'polite' });
        const bins = level.bins.map(bin => {
          const node = el('button', {
            class: 'bin', type: 'button', 'aria-label': bin.label,
            onclick: () => choose(node)
          }, [
            el('span', { class: 'bin-icon', text: bin.icon }),
            el('span', { class: 'bin-label', text: bin.label })
          ]);
          node.dataset.label = bin.label;
          return node;
        });

        root.replaceChildren(el('div', { class: 'screen sortera' }, [
          tracker.bar,
          el('p', { class: 'hint', text: level.question }),
          el('div', { class: 'pic-zone' }, [card, caption,
            el('button', { class: 'btn btn-listen', type: 'button', text: '🔊 Lyssna', onclick: () => T.speak(current.item.name) })
          ]),
          el('div', { class: 'bins' }, bins)
        ]));

        // Säg gruppernas namn en gång i början av rundan
        timer.later(() => T.speak(level.question), 300);

        const dragger = T.draggable(card, {
          targets: () => bins,
          enabled: () => !locked,
          onDrop: bin => choose(bin),
          onTap: () => T.speak(current.item.name)
        });

        function show(first) {
          current = tasks[index];
          mistakes = 0;
          locked = false;
          tracker.current(index);
          card.textContent = current.item.emoji;
          card.setAttribute('aria-label', current.item.name);
          caption.textContent = '';
          bins.forEach(b => b.classList.remove('right', 'nudge'));
          dragger.reset();
          if (!first) timer.later(() => T.speak(current.item.name), 400);
        }

        function choose(binNode) {
          if (locked) return;
          const label = binNode.dataset.label;

          if (label === current.bin.label) {
            locked = true;
            binNode.classList.add('right');
            dragger.flyInto(binNode);
            T.chime('right');
            T.progress.recordAnswer(GAME_ID, label, mistakes === 0);
            tracker.mark(index, mistakes === 0);
            caption.textContent = current.item.name + ' – ' + label.toLowerCase();
            timer.later(() => T.speak(current.item.name + '. ' + label), 350);
            timer.later(next, 2200);
          } else {
            mistakes++;
            T.chime('wrong');
            T.replayClass(binNode, 'wrong');
            dragger.snapBack();
            timer.later(() => T.speak(current.item.name), 350);
            if (mistakes >= 2) {
              const right = bins.find(b => b.dataset.label === current.bin.label);
              if (right) right.classList.add('nudge');
            }
          }
        }

        function next() {
          index++;
          if (index < tasks.length) {
            show(false);
            return;
          }
          timer.clear();
          T.resultScreen(root, {
            gameId: GAME_ID,
            level,
            score: tracker.stars,
            total: tasks.length,
            onReplay: () => startRound(level),
            onLevels: showLevels
          });
        }

        // Första bilden: frågan läses först, sedan bildens namn
        show(true);
        timer.later(() => T.speak(current.item.name), 2600);
      }

      showLevels();
      return timer.clear;
    }
  });
})();
