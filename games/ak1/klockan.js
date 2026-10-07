/*
 * Klockan – hel och halv timme. Lyssna på tiden och tryck på rätt klocka.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const HOURS = ['ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv'];
  const word = h => HOURS[(h - 1 + 12) % 12];

  const LEVELS = [
    { name: 'Hela timmar', icon: '🕒', sub: 'Klockan är tre', kinds: ['hel'] },
    { name: 'Halvtimmar', icon: '🕞', sub: 'Klockan är halv fyra', kinds: ['halv'] },
    { name: 'Blandat', icon: '🦅', sub: 'Hel och halv', kinds: ['hel', 'halv'] }
  ];

  // Tiden som man säger den: 3:00 = "tre", 3:30 = "halv fyra"
  function say(time) {
    return time.m === 0 ? word(time.h) : 'halv ' + word(time.h + 1);
  }

  function clock(time) {
    const ticks = HOURS.map((_, i) => {
      const a = (i + 1) * Math.PI / 6;
      const x = 80 + 56 * Math.sin(a);
      const y = 80 - 56 * Math.cos(a) + 6;
      return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-size="16" font-weight="700" text-anchor="middle" fill="#2b2140">' + (i + 1) + '</text>';
    }).join('');
    const hourAngle = ((time.h % 12) + time.m / 60) * 30;
    const minuteAngle = time.m * 6;
    const hand = (angle, length, width, color) => {
      const a = angle * Math.PI / 180;
      return '<line x1="80" y1="80" x2="' + (80 + length * Math.sin(a)).toFixed(1) + '" y2="' + (80 - length * Math.cos(a)).toFixed(1) +
        '" stroke="' + color + '" stroke-width="' + width + '" stroke-linecap="round"/>';
    };
    return '<svg viewBox="0 0 160 160" aria-hidden="true">' +
      '<circle cx="80" cy="80" r="74" fill="#fff" stroke="#2b2140" stroke-width="5"/>' + ticks +
      hand(hourAngle, 36, 8, '#2b2140') + hand(minuteAngle, 58, 5, '#ff5d73') +
      '<circle cx="80" cy="80" r="5" fill="#2b2140"/></svg>';
  }

  const key = t => t.h + ':' + t.m;

  function makeTask(level) {
    const kind = T.pick(level.kinds);
    const h = T.rand(1, 12);
    const time = { h, m: kind === 'hel' ? 0 : 30 };
    const next = h % 12 + 1;
    // Vanliga fel: "halv fyra" läses som 4:30, och hel timme i stället för halv
    const likely = kind === 'halv'
      ? [{ h: next, m: 30 }, { h: next, m: 0 }, { h, m: 0 }]
      : [{ h: next, m: 0 }, { h: (h + 10) % 12 + 1, m: 0 }, { h, m: 30 }];
    const count = level.kinds.length > 1 ? 4 : 3;
    const wrong = T.sample(likely, count - 1);
    return { time, kind, options: T.shuffle([time, ...wrong]) };
  }

  T.quizGame({
    id: 'klockan',
    title: 'Klockan',
    grade: 1,
    subject: 'Matematik',
    icon: '🕒',
    color: '#4cc9f0',
    description: 'Hel och halv timme.',
    intro: 'Den korta visaren visar timmen. Den långa röda visaren pekar rakt upp på hel timme och rakt ner på halv.',
    hint: 'Vilken klocka visar rätt tid?',
    levels: LEVELS,
    makeTasks: (level, n) => {
      const tasks = [];
      while (tasks.length < n) {
        const task = makeTask(level);
        if (!tasks.some(t => key(t.time) === key(task.time))) tasks.push(task);
      }
      return tasks;
    },
    report: { title: 'Klockan', keys: ['Hel timme', 'Halvtimme'] },
    render: task => {
      const sentence = 'Klockan är ' + say(task.time) + '.';
      return {
        prompt: el('div', { class: 'read-sentence', text: sentence }),
        say: sentence + ' Vilken klocka visar det?',
        retry: sentence,
        praise: 'Ja! ' + sentence,
        item: task.kind === 'hel' ? 'Hel timme' : 'Halvtimme',
        choiceClass: 'clock-tile',
        choices: task.options.map((t, i) => ({
          label: 'Klocka ' + (i + 1),
          correct: t === task.time,
          content: T.picture({ svg: clock(t) }, 'scene')
        }))
      };
    }
  });
})();
