/*
 * Robotvägen – gör ett program med pilar som tar roboten till stjärnan.
 * Grund för programmering: entydiga stegvisa instruktioner.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const GAME_ID = 'robot';
  const SIZE = 5;
  const ROUND_LENGTH = 6;
  const MAX_STEPS = 12;
  const STEP_MS = 450;

  const DIRS = {
    up: { dx: 0, dy: -1, icon: '⬆️', word: 'upp' },
    left: { dx: -1, dy: 0, icon: '⬅️', word: 'vänster' },
    down: { dx: 0, dy: 1, icon: '⬇️', word: 'ner' },
    right: { dx: 1, dy: 0, icon: '➡️', word: 'höger' }
  };

  const LEVELS = [
    { name: 'Lätt', icon: '🐣', sub: 'Kort väg', min: 2, max: 3, rocks: 0 },
    { name: 'Mellan', icon: '🐥', sub: 'Längre väg', min: 4, max: 6, rocks: 0 },
    { name: 'Svår', icon: '🦅', sub: 'Stenar i vägen', min: 4, max: 8, rocks: 4 }
  ];

  const key = (x, y) => x + ',' + y;
  const randomCell = () => ({ x: T.rand(0, SIZE - 1), y: T.rand(0, SIZE - 1) });
  const inside = (x, y) => x >= 0 && y >= 0 && x < SIZE && y < SIZE;

  // Kortaste vägen (bredden först). Ger rutorna efter start, eller null.
  function shortestPath(start, goal, rocks) {
    const prev = new Map([[key(start.x, start.y), null]]);
    const queue = [start];
    while (queue.length) {
      const cur = queue.shift();
      if (cur.x === goal.x && cur.y === goal.y) {
        const path = [];
        for (let c = cur; c && key(c.x, c.y) !== key(start.x, start.y); c = prev.get(key(c.x, c.y))) path.unshift(c);
        return path;
      }
      for (const d of Object.values(DIRS)) {
        const n = { x: cur.x + d.dx, y: cur.y + d.dy };
        const k = key(n.x, n.y);
        if (inside(n.x, n.y) && !rocks.has(k) && !prev.has(k)) {
          prev.set(k, cur);
          queue.push(n);
        }
      }
    }
    return null;
  }

  function makeBoard(level) {
    for (;;) {
      const start = randomCell();
      const goal = randomCell();
      if (key(start.x, start.y) === key(goal.x, goal.y)) continue;
      const rocks = new Set();
      while (rocks.size < level.rocks) {
        const r = randomCell();
        const k = key(r.x, r.y);
        if (k !== key(start.x, start.y) && k !== key(goal.x, goal.y)) rocks.add(k);
      }
      const path = shortestPath(start, goal, rocks);
      if (!path || path.length < level.min || path.length > level.max) continue;
      // Med stenar: de ska faktiskt stå i vägen, så att man måste gå runt
      const direct = Math.abs(start.x - goal.x) + Math.abs(start.y - goal.y);
      if (level.rocks && path.length === direct) continue;
      return { start, goal, rocks, path };
    }
  }

  T.registerGame({
    id: GAME_ID,
    title: 'Robotvägen',
    grade: 1,
    subject: 'Matematik',
    icon: '🤖',
    color: '#3a86ff',
    description: 'Programmera roboten med pilar.',

    renderProgress: progress => T.accuracyReport(LEVELS.map(l => l.name), progress.items, 'Nivåer'),

    mount(root) {
      const timer = T.timers();

      function showLevels() {
        timer.clear();
        T.levelScreen(root, {
          icon: '🤖',
          title: 'Robotvägen',
          text: 'Tryck på pilarna för att göra ett program. Tryck sedan på ▶️ Kör – kommer roboten fram till stjärnan?',
          levels: LEVELS,
          onPick: startRound
        });
      }

      function startRound(level) {
        timer.clear();
        const boards = Array.from({ length: ROUND_LENGTH }, () => makeBoard(level));
        const tracker = T.roundTracker(boards.length);
        let index = 0;
        let mistakes = 0;
        let running = false;
        let done = false;
        let board = null;
        let program = [];
        let robot = null;

        const cells = [];
        const grid = el('div', { class: 'robot-grid', style: '--size:' + SIZE });
        for (let y = 0; y < SIZE; y++) {
          cells.push([]);
          for (let x = 0; x < SIZE; x++) {
            const cell = el('span', { class: 'robot-cell' });
            cells[y].push(cell);
            grid.append(cell);
          }
        }
        const programRow = el('div', { class: 'robot-program', 'aria-live': 'polite' });
        const arrows = Object.entries(DIRS).map(([dir, d]) =>
          el('button', { class: 'tile robot-arrow', type: 'button', 'aria-label': d.word, onclick: () => add(dir) },
            [el('span', { class: 'tile-emoji', text: d.icon })]));

        root.replaceChildren(el('div', { class: 'screen' }, [
          tracker.bar,
          el('p', { class: 'hint', text: 'Gör ett program som tar roboten 🤖 till stjärnan ⭐' }),
          el('div', { class: 'quiz-zone' }, [grid, programRow]),
          el('div', { class: 'robot-controls' }, arrows),
          el('div', { class: 'result-actions' }, [
            el('button', { class: 'btn btn-big btn-ghost', type: 'button', text: '⌫ Ångra', onclick: undo }),
            el('button', { class: 'btn btn-big', type: 'button', text: '▶️ Kör', onclick: run })
          ])
        ]));

        function draw() {
          const hint = mistakes >= 2 ? new Set(board.path.map(p => key(p.x, p.y))) : new Set();
          for (let y = 0; y < SIZE; y++) {
            for (let x = 0; x < SIZE; x++) {
              const k = key(x, y);
              const cell = cells[y][x];
              const isRobot = robot.x === x && robot.y === y;
              const isGoal = board.goal.x === x && board.goal.y === y;
              cell.textContent = isRobot ? '🤖' : isGoal ? '⭐' : board.rocks.has(k) ? '🪨' : '';
              cell.classList.toggle('goal', isGoal);
              cell.classList.toggle('hint', hint.has(k) && !isRobot && !isGoal);
            }
          }
        }

        function renderProgram(active) {
          programRow.replaceChildren(...(program.length
            ? program.map((dir, i) => el('span', { class: 'robot-step' + (i === active ? ' active' : ''), text: DIRS[dir].icon }))
            : [el('span', { class: 'robot-empty', text: 'Tryck på pilarna här under' })]));
        }

        function show() {
          board = boards[index];
          mistakes = 0;
          program = [];
          running = false;
          done = false;
          robot = Object.assign({}, board.start);
          tracker.current(index);
          draw();
          renderProgram();
          timer.later(() => T.speak('Hjälp roboten till stjärnan!'), 400);
        }

        function add(dir) {
          if (running || done || program.length >= MAX_STEPS) return;
          program.push(dir);
          T.speak(DIRS[dir].word);
          renderProgram();
        }

        function undo() {
          if (running || done) return;
          program.pop();
          renderProgram();
        }

        function run() {
          if (running || done || !program.length) return;
          running = true;
          robot = Object.assign({}, board.start);
          draw();
          let i = 0;
          const step = () => {
            if (i >= program.length) {
              finish();
              return;
            }
            renderProgram(i);
            const d = DIRS[program[i]];
            const nx = robot.x + d.dx;
            const ny = robot.y + d.dy;
            if (!inside(nx, ny) || board.rocks.has(key(nx, ny))) {
              fail('Aj! Roboten krockade.');
              return;
            }
            robot = { x: nx, y: ny };
            draw();
            i++;
            timer.later(step, STEP_MS);
          };
          timer.later(step, 300);
        }

        function finish() {
          renderProgram();
          if (robot.x === board.goal.x && robot.y === board.goal.y) {
            done = true;
            running = false;
            cells[robot.y][robot.x].classList.add('right');
            T.chime('right');
            T.progress.recordAnswer(GAME_ID, level.name, mistakes === 0);
            tracker.mark(index, mistakes === 0);
            timer.later(() => T.speak(T.praise()), 300);
            timer.later(next, 2200);
          } else {
            fail('Roboten kom inte fram till stjärnan.');
          }
        }

        // Programmet sparas, så att man kan rätta det. Efter två fel visas vägen.
        function fail(message) {
          mistakes++;
          T.chime('wrong');
          T.replayClass(grid, 'wrong');
          T.speak(message + ' Försök igen!');
          timer.later(() => {
            robot = Object.assign({}, board.start);
            running = false;
            draw();
            renderProgram();
          }, 1200);
        }

        function next() {
          cells.flat().forEach(c => c.classList.remove('right'));
          index++;
          if (index < boards.length) {
            show();
            return;
          }
          timer.clear();
          T.resultScreen(root, {
            gameId: GAME_ID,
            level,
            score: tracker.stars,
            total: boards.length,
            onReplay: () => startRound(level),
            onLevels: showLevels
          });
        }

        show();
      }

      showLevels();
      return timer.clear;
    }
  });
})();
