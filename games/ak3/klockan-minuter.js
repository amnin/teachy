/*
 * Klockan – kvart och fem minuter, och hur lång tid som gått.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const HOURS = ['ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv'];
  const word = h => HOURS[(h - 1 + 12) % 12];

  const LEVELS = [
    { name: 'Kvart över och kvart i', icon: '🕒', sub: 'Kvart över tre', minutes: [0, 15, 30, 45], kind: 'read' },
    { name: 'Fem minuter', icon: '🕔', sub: 'Fem i halv fyra', minutes: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55], kind: 'read' },
    { name: 'Hur lång tid?', icon: '⏱️', sub: 'Från tre till halv fyra', kind: 'duration' }
  ];

  // Tiden som man säger den, t.ex. 3:25 = "fem i halv fyra"
  function say({ h, m }) {
    const now = word(h), next = word(h + 1);
    return {
      0: now, 5: 'fem över ' + now, 10: 'tio över ' + now, 15: 'kvart över ' + now, 20: 'tjugo över ' + now,
      25: 'fem i halv ' + next, 30: 'halv ' + next, 35: 'fem över halv ' + next, 40: 'tjugo i ' + next,
      45: 'kvart i ' + next, 50: 'tio i ' + next, 55: 'fem i ' + next
    }[m];
  }

  function clock({ h, m }) {
    const ticks = HOURS.map((_, i) => {
      const a = (i + 1) * Math.PI / 6;
      return '<text x="' + (80 + 56 * Math.sin(a)).toFixed(1) + '" y="' + (80 - 56 * Math.cos(a) + 6).toFixed(1) +
        '" font-size="16" font-weight="700" text-anchor="middle" fill="#2b2140">' + (i + 1) + '</text>';
    }).join('');
    const marks = Array.from({ length: 60 }, (_, i) => {
      const a = i * Math.PI / 30, r1 = i % 5 ? 70 : 66;
      return '<line x1="' + (80 + r1 * Math.sin(a)).toFixed(1) + '" y1="' + (80 - r1 * Math.cos(a)).toFixed(1) +
        '" x2="' + (80 + 73 * Math.sin(a)).toFixed(1) + '" y2="' + (80 - 73 * Math.cos(a)).toFixed(1) +
        '" stroke="#2b2140" stroke-width="' + (i % 5 ? 1 : 2.5) + '"/>';
    }).join('');
    const hand = (angle, length, width, color) => {
      const a = angle * Math.PI / 180;
      return '<line x1="80" y1="80" x2="' + (80 + length * Math.sin(a)).toFixed(1) + '" y2="' + (80 - length * Math.cos(a)).toFixed(1) +
        '" stroke="' + color + '" stroke-width="' + width + '" stroke-linecap="round"/>';
    };
    return '<svg viewBox="0 0 160 160" aria-hidden="true">' +
      '<circle cx="80" cy="80" r="74" fill="#fff" stroke="#2b2140" stroke-width="5"/>' + marks + ticks +
      hand(((h % 12) + m / 60) * 30, 36, 8, '#2b2140') + hand(m * 6, 58, 5, '#ff5d73') +
      '<circle cx="80" cy="80" r="5" fill="#2b2140"/></svg>';
  }

  const same = (a, b) => a.h === b.h && a.m === b.m;
  const add = ({ h, m }, minutes) => {
    const total = (h * 60 + m + minutes) % 720;
    return { h: Math.floor(total / 60) || 12, m: total % 60 };
  };

  function makeTask(level) {
    const time = { h: T.rand(1, 12), m: level.kind === 'duration' ? T.pick([0, 15, 30, 45]) : T.pick(level.minutes) };
    if (level.kind === 'duration') {
      const minutes = T.pick([15, 30, 45, 60, 90]);
      return { kind: 'duration', from: time, to: add(time, minutes), answer: minutes };
    }
    // Vanliga förväxlingar: kvart i / kvart över, och fel timme vid "halv"
    const likely = [add(time, 30), add(time, 60), add(time, -60), { h: time.h, m: (60 - time.m) % 60 }]
      .filter(t => !same(t, time));
    const wrong = [];
    for (const t of T.shuffle(likely)) if (wrong.length < 3 && !wrong.some(w => same(w, t))) wrong.push(t);
    return { kind: 'read', time, options: T.shuffle([time, ...wrong]) };
  }

  const durationName = m => (m === 60 ? 'en timme' : m === 90 ? 'en och en halv timme' : m + ' minuter');

  T.quizGame({
    id: 'klockan-minuter',
    title: 'Klockan',
    grade: 3,
    subject: 'Matematik',
    icon: '🕔',
    color: '#4cc9f0',
    description: 'Kvart, fem minuter och hur lång tid.',
    intro: 'Den långa röda visaren visar minuterna. Varje siffra är fem minuter: på 3 är det kvart över, på 9 är det kvart i.',
    hint: 'Vad är klockan?',
    levels: LEVELS,
    makeTasks: (level, n) => {
      const tasks = [];
      for (let tries = 0; tasks.length < n && tries < 300; tries++) {
        const t = makeTask(level);
        const key = t.kind === 'read' ? say(t.time) : say(t.from) + t.answer;
        if (!tasks.some(o => o.key === key)) tasks.push(Object.assign(t, { key }));
      }
      return tasks;
    },
    report: { title: 'Klockan', keys: LEVELS.map(l => l.name) },
    render: (task, level) => {
      if (task.kind === 'duration') {
        const question = 'Hur lång tid är det från ' + say(task.from) + ' till ' + say(task.to) + '?';
        const options = T.shuffle([task.answer, ...T.sample([15, 30, 45, 60, 90, 120].filter(m => m !== task.answer), 2)]);
        return {
          prompt: el('div', { class: 'fact-task' }, [
            el('div', { class: 'clock-pair' }, [
              T.picture({ svg: clock(task.from) }, 'scene'), el('span', { class: 'math-op', text: '→' }), T.picture({ svg: clock(task.to) }, 'scene')
            ]),
            el('p', { class: 'read-sentence', text: question })
          ]),
          say: question + ' ' + T.orList(options.map(durationName)) + '?',
          retry: question,
          praise: 'Det är ' + durationName(task.answer) + '!',
          item: level.name,
          choiceClass: 'word-tile',
          choices: options.map(m => ({ label: durationName(m), correct: m === task.answer, content: el('span', { class: 'tile-word', text: durationName(m) }) }))
        };
      }
      return {
        prompt: el('div', { class: 'clock-big' }, [T.picture({ svg: clock(task.time) }, 'scene')]),
        say: 'Vad är klockan? ' + T.orList(task.options.map(say)) + '?',
        retry: 'Vad är klockan?',
        praise: 'Klockan är ' + say(task.time) + '!',
        item: level.name,
        choiceClass: 'word-tile',
        choices: task.options.map(t => ({ label: say(t), correct: t === task.time, content: el('span', { class: 'tile-word', text: say(t) }) }))
      };
    }
  });
})();
