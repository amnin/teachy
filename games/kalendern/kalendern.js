/*
 * Kalendern – veckodagar, månader och år.
 *
 * Färgerna är desamma överallt så att barnet kan känna igen dem:
 * varje veckodag har en egen färg (helgen är lila med 🎉), och varje månad
 * har sin årstids färg. Året ritas som ett årshjul med tolv tårtbitar.
 *
 * Startsidan visar dagens datum som ett kalenderblad, veckan och årshjulet.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  // ---------- Data ----------

  // Måndag först, som i svenska kalendrar
  const DAYS = [
    { name: 'måndag', short: 'Må', color: '#ffb3be' },
    { name: 'tisdag', short: 'Ti', color: '#ffd199' },
    { name: 'onsdag', short: 'On', color: '#ffe98a' },
    { name: 'torsdag', short: 'To', color: '#a8ecc9' },
    { name: 'fredag', short: 'Fr', color: '#a9e4f7' },
    { name: 'lördag', short: 'Lö', color: '#d4bdf7', weekend: true },
    { name: 'söndag', short: 'Sö', color: '#d4bdf7', weekend: true }
  ];

  const SEASONS = {
    vinter: { name: 'Vinter', the: 'vintern', icon: '❄️', color: '#bfe0ff' },
    vår: { name: 'Vår', the: 'våren', icon: '🌸', color: '#c6f0c2' },
    sommar: { name: 'Sommar', the: 'sommaren', icon: '☀️', color: '#ffe98a' },
    höst: { name: 'Höst', the: 'hösten', icon: '🍂', color: '#ffcc99' }
  };

  const MONTHS = [
    ['⛄', 'vinter'], ['⛷️', 'vinter'], ['🌱', 'vår'], ['🐣', 'vår'], ['🌸', 'vår'], ['🍓', 'sommar'],
    ['🏖️', 'sommar'], ['🎒', 'sommar'], ['🍎', 'höst'], ['🎃', 'höst'], ['🕯️', 'höst'], ['🎄', 'vinter']
  ].map(([emoji, season], i) => ({
    name: T.MONTH_NAMES[i], short: T.MONTH_NAMES[i].slice(0, 3), emoji, season, color: SEASONS[season].color
  }));

  // JavaScript räknar söndag som dag 0 – här är måndag 0
  const weekday = date => (date.getDay() + 6) % 7;
  const cap = text => text.charAt(0).toUpperCase() + text.slice(1);

  function todaySentence() {
    const now = new Date();
    return 'Idag är det ' + DAYS[weekday(now)].name + ' den ' + now.getDate() + ' ' +
      MONTHS[now.getMonth()].name + ' ' + now.getFullYear() + '.';
  }

  // ---------- Bilder: veckoremsa, kalenderblad och årshjul ----------

  // Veckans sju dagar i rad. mark = dagen som ska lysa (index), label = text under den
  function weekStrip(mark, label) {
    return el('div', { class: 'cal-week' }, DAYS.map((day, i) =>
      el('span', { class: 'cal-week-day' + (i === mark ? ' marked' : ''), style: 'background:' + day.color }, [
        el('strong', { text: day.short }),
        day.weekend ? el('span', { class: 'cal-week-emoji', text: '🎉' }) : null,
        i === mark && label ? el('span', { class: 'cal-week-label', text: label }) : null
      ])));
  }

  function calendarSheet(date) {
    const day = DAYS[weekday(date)];
    const month = MONTHS[date.getMonth()];
    return el('div', { class: 'cal-sheet' }, [
      el('div', { class: 'cal-sheet-top', style: 'background:' + day.color }, [
        cap(day.name), day.weekend ? ' 🎉' : null
      ]),
      el('div', { class: 'cal-sheet-date', text: String(date.getDate()) }),
      el('div', { class: 'cal-sheet-month', style: 'background:' + month.color, text: month.emoji + ' ' + month.name }),
      el('div', { class: 'cal-sheet-year', text: String(date.getFullYear()) })
    ]);
  }

  // Årshjulet: januari överst, sedan medsols som på en klocka.
  // mark = månaden som lyfts fram (t.ex. nu), birthday = månad med 🎂
  function yearWheel({ mark, birthday, year } = {}) {
    const R = 100, r = 40;
    const point = (radius, deg) => {
      const a = (deg - 90) * Math.PI / 180;
      return [(radius * Math.cos(a)).toFixed(1), (radius * Math.sin(a)).toFixed(1)];
    };
    const parts = MONTHS.map((month, i) => {
      const out = i === mark ? R + 10 : R;
      const from = i * 30 - 15, to = i * 30 + 15;
      const [x1, y1] = point(out, from), [x2, y2] = point(out, to);
      const [x3, y3] = point(r, to), [x4, y4] = point(r, from);
      const [ex, ey] = point((out + r) / 2 + 8, i * 30);
      const [tx, ty] = point((out + r) / 2 - 22, i * 30);
      const [bx, by] = point(out + 12, i * 30);
      return '<path d="M' + x1 + ' ' + y1 + ' A' + out + ' ' + out + ' 0 0 1 ' + x2 + ' ' + y2 +
        ' L' + x3 + ' ' + y3 + ' A' + r + ' ' + r + ' 0 0 0 ' + x4 + ' ' + y4 + 'Z" fill="' + month.color + '"' +
        ' stroke="' + (i === mark ? '#2b2140' : '#fff') + '" stroke-width="' + (i === mark ? 4 : 2) + '"/>' +
        '<text x="' + ex + '" y="' + ey + '" font-size="20" text-anchor="middle" dominant-baseline="central">' + month.emoji + '</text>' +
        '<text x="' + tx + '" y="' + ty + '" font-size="11" font-weight="800" fill="#2b2140" text-anchor="middle" dominant-baseline="central">' + month.short + '</text>' +
        (i === birthday ? '<text x="' + bx + '" y="' + by + '" font-size="20" text-anchor="middle" dominant-baseline="central">🎂</text>' : '');
    }).join('');
    const center = year
      ? '<text x="0" y="0" font-size="20" font-weight="800" fill="#2b2140" text-anchor="middle" dominant-baseline="central">' + year + '</text>'
      : '';
    const node = el('div', { class: 'cal-wheel', role: 'img', 'aria-label': 'Årshjulet med årets tolv månader' });
    node.innerHTML = '<svg viewBox="-126 -126 252 252">' + parts + center + '</svg>';
    return node;
  }

  // Ett färgat kort med en dag eller månad, för svarsknappar
  function dayCard(day) {
    return el('span', { class: 'cal-card', style: 'background:' + day.color }, [
      day.weekend ? el('span', { class: 'cal-card-emoji', text: '🎉' }) : null,
      el('span', { class: 'cal-card-name', text: day.name })
    ]);
  }

  function monthCard(month) {
    return el('span', { class: 'cal-card', style: 'background:' + month.color }, [
      el('span', { class: 'cal-card-emoji', text: month.emoji }),
      el('span', { class: 'cal-card-name', text: month.name })
    ]);
  }

  function seasonCard(season) {
    return el('span', { class: 'cal-card', style: 'background:' + season.color }, [
      el('span', { class: 'cal-card-emoji', text: season.icon }),
      el('span', { class: 'cal-card-name', text: season.name.toLowerCase() })
    ]);
  }

  const birthdayMonth = () => {
    const b = (T.profiles.current() || {}).birthday;
    return b ? b.month : null;
  };

  // ---------- Nivå 1: Veckans dagar ----------

  // En följd av dagar i rätt ordning: hela veckan, eller några dagar i rad
  function daysTasks() {
    const parts = [0, 1, 2].map(() => {
      const length = T.rand(3, 4);
      const start = T.rand(0, 7 - length);
      return DAYS.slice(start, start + length);
    });
    return [DAYS, ...parts, DAYS];
  }

  const daysLevel = {
    name: 'Veckans dagar', icon: '🗓️', sub: 'Måndag, tisdag, onsdag …', round: 'order',
    hint: 'Vilken dag kommer först? Tryck i rätt ordning',
    makeTasks: daysTasks,
    render: days => ({
      say: days.length === 7
        ? 'Lägg veckans dagar i rätt ordning. Veckan börjar på måndag.'
        : 'Vilken dag kommer först? Tryck i rätt ordning.',
      retry: 'Vilken dag kommer sen?',
      praise: days.length === 7
        ? 'Måndag, tisdag, onsdag, torsdag, fredag, lördag, söndag. Bra!'
        : days.map(d => d.name).join(', ') + '. Bra!',
      item: 'Veckodagar',
      speakSteps: true,
      tileClass: 'cal-tile',
      steps: days.map(day => ({
        label: day.name, color: day.color,
        emoji: day.weekend ? '🎉' : null, text: day.weekend ? null : day.short, caption: day.name
      }))
    })
  };

  // ---------- Nivå 2: Igår, idag, imorgon ----------

  function nearTasks(level, n) {
    const tasks = [];
    const seen = new Set();
    while (tasks.length < n) {
      const today = T.rand(0, 6);
      const kind = T.pick(['imorgon', 'igår']);
      if (seen.has(today + kind)) continue;
      seen.add(today + kind);
      tasks.push({ today, kind, answer: (today + (kind === 'imorgon' ? 1 : 6)) % 7 });
    }
    return tasks;
  }

  const nearLevel = {
    name: 'Igår, idag, imorgon', icon: '⬅️', sub: 'Vilken dag är det imorgon?', round: 'quiz',
    hint: 'Tryck på rätt dag',
    makeTasks: nearTasks,
    render: task => {
      const today = DAYS[task.today];
      const question = 'Vilken dag är det ' + task.kind + '?';
      // Rätt svar, idag och dagen på andra sidan – blandade, så att svaret inte alltid ligger på samma plats
      const options = T.shuffle([(task.today + 6) % 7, task.today, (task.today + 1) % 7]);
      const help = weekStrip(task.today, 'idag');
      return {
        prompt: el('div', { class: 'cal-task' }, [
          el('div', { class: 'read-sentence' }, ['Idag är det ', dayCard(today)]),
          help,
          el('p', { class: 'read-sentence', text: question })
        ]),
        say: 'Idag är det ' + today.name + '. ' + question + ' ' + T.orList(options.map(i => DAYS[i].name)) + '?',
        retry: question,
        praise: cap(task.kind) + ' är det ' + DAYS[task.answer].name + '!',
        item: cap(task.kind),
        help,
        choiceClass: 'cal-choice',
        choices: options.map(i => ({ label: DAYS[i].name, correct: i === task.answer, content: dayCard(DAYS[i]) }))
      };
    }
  };

  // ---------- Nivå 3: Årstiderna ----------

  const items = list => list.map(([name, emoji]) => ({ name, emoji }));

  const seasonLevel = {
    name: 'Årstiderna', icon: '🌸', sub: 'Vinter, vår, sommar, höst', round: 'sort',
    question: 'Vilken årstid hör det till?',
    bins: [
      { label: 'Vinter', icon: '❄️', items: items([['snögubbe', '⛄'], ['pulka', '🛷'], ['skridskor', '⛸️'], ['vantar', '🧤'], ['julgran', '🎄']]) },
      { label: 'Vår', icon: '🌸', items: items([['tulpaner', '🌷'], ['påskkyckling', '🐣'], ['det börjar växa', '🌱'], ['körsbärsblommor', '🌸']]) },
      { label: 'Sommar', icon: '☀️', items: items([['bada', '🏖️'], ['jordgubbar', '🍓'], ['glass', '🍦'], ['baddräkt', '🩱']]) },
      { label: 'Höst', icon: '🍂', items: items([['löven faller', '🍂'], ['svamp', '🍄'], ['pumpa', '🎃'], ['paraply', '☂️']]) }
    ]
  };

  // ---------- Nivå 4: Årets månader ----------

  function monthTasks() {
    const parts = [0, 1, 2, 3].map(() => {
      const length = T.rand(3, 4);
      const start = T.rand(0, 12 - length);
      return MONTHS.slice(start, start + length);
    });
    return [...parts, MONTHS];
  }

  const monthLevel = {
    name: 'Årets månader', icon: '🎡', sub: 'Januari, februari, mars …', round: 'order',
    hint: 'Vilken månad kommer först? Tryck i rätt ordning',
    makeTasks: monthTasks,
    render: months => ({
      prompt: months.length === 12 ? el('p', { class: 'read-sentence', text: 'Hela året – börja med januari!' }) : null,
      say: months.length === 12
        ? 'Lägg alla årets månader i rätt ordning. Året börjar med januari.'
        : 'Vilken månad kommer först? Tryck i rätt ordning.',
      retry: 'Vilken månad kommer sen?',
      praise: months.length === 12 ? 'Ett helt år – tolv månader. Jättebra!' : months.map(m => m.name).join(', ') + '. Bra!',
      item: 'Månader',
      speakSteps: true,
      tileClass: 'cal-tile',
      steps: months.map(month => ({ label: month.name, color: month.color, emoji: month.emoji, caption: month.name }))
    })
  };

  // ---------- Nivå 5: När händer det? ----------

  // Frågor där svaret är en månad: [fråga, månad (0–11), beröm]
  const MONTH_QUESTIONS = [
    ['I vilken månad är det jul?', 11, 'Julafton är i december!'],
    ['I vilken månad firar vi midsommar?', 5, 'Midsommar är i juni!'],
    ['Vilken månad är årets första?', 0, 'Året börjar med januari!'],
    ['Vilken månad är årets sista?', 11, 'December är årets sista månad!'],
    ['I vilken månad är det halloween?', 9, 'Halloween är i oktober!'],
    ['I vilken månad börjar skolan efter sommarlovet?', 7, 'Skolan börjar i augusti!']
  ];

  function whenTasks(level, n) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const birthday = birthdayMonth();
    const pool = MONTH_QUESTIONS.map(([question, answer, praise]) => ({ type: 'month', question, answer, praise }));

    // Vad kommer efter …? – utan att gå runt till nästa år
    const after = T.rand(0, 10);
    pool.push({ type: 'month', question: 'Vilken månad kommer efter ' + MONTHS[after].name + '?', answer: after + 1,
      praise: 'Efter ' + MONTHS[after].name + ' kommer ' + MONTHS[after + 1].name + '!' });

    const seasonMonth = T.rand(0, 11);
    pool.push({ type: 'season', question: 'Vilken årstid är det i ' + MONTHS[seasonMonth].name + '?',
      answer: MONTHS[seasonMonth].season,
      praise: cap(MONTHS[seasonMonth].name) + ' är på ' + SEASONS[MONTHS[seasonMonth].season].the + '!' });

    pool.push({ type: 'number', question: 'Hur många dagar har en vecka?', answer: 7, praise: 'En vecka har sju dagar!' });
    pool.push({ type: 'number', question: 'Hur många månader har ett år?', answer: 12, praise: 'Ett år har tolv månader!' });
    pool.push({ type: 'year', question: 'Vilket år är det nu?', answer: year, praise: 'Nu är det år ' + year + '!' });
    pool.push({ type: 'year', question: 'Vilket år blir det nästa år?', answer: year + 1, praise: 'Nästa år är det ' + (year + 1) + '!' });

    // De här kommer alltid med: vilken månad det är nu, och när barnet fyller år
    const always = [{ type: 'month', question: 'Vilken månad är det nu?', answer: month, praise: 'Nu är det ' + MONTHS[month].name + '!' }];
    if (birthday != null) {
      always.push({ type: 'month', question: 'I vilken månad fyller du år?', answer: birthday,
        praise: 'Du fyller år i ' + MONTHS[birthday].name + '! 🎂' });
    }
    return T.shuffle(always.concat(T.sample(pool, n - always.length)));
  }

  // Två grannar till rätt månad som felsvar, så att barnet måste tänka på ordningen
  function monthOptions(answer) {
    const others = T.sample([answer - 2, answer - 1, answer + 1, answer + 2, answer + 6]
      .map(m => (m + 12) % 12).filter(m => m !== answer), 2);
    return T.shuffle([answer, ...others]);
  }

  const whenLevel = {
    name: 'När händer det?', icon: '🎄', sub: 'Jul, midsommar, år', round: 'quiz',
    hint: 'Tryck på rätt svar',
    makeTasks: whenTasks,
    render: task => {
      const now = new Date();
      let options, help;
      let choiceClass = 'cal-choice';
      if (task.type === 'month') {
        options = monthOptions(task.answer).map(m => ({ label: MONTHS[m].name, correct: m === task.answer, content: monthCard(MONTHS[m]) }));
        help = yearWheel({ mark: now.getMonth(), birthday: birthdayMonth() });
      } else if (task.type === 'season') {
        options = Object.keys(SEASONS).map(key => ({
          label: SEASONS[key].name.toLowerCase(), correct: key === task.answer, content: seasonCard(SEASONS[key])
        }));
        help = yearWheel({});
      } else if (task.type === 'number') {
        options = T.numberOptions(task.answer, 3, 1, 14, [task.answer === 7 ? 12 : 7]);
        choiceClass = 'num-tile';
        help = task.answer === 7 ? weekStrip(null) : yearWheel({});
      } else {
        options = [task.answer - 1, task.answer, task.answer + 1].map(y => ({
          label: String(y), correct: y === task.answer, content: el('span', { class: 'cal-year', text: y })
        }));
        help = yearWheel({ mark: now.getMonth(), year: now.getFullYear() });
      }
      return {
        prompt: el('div', { class: 'cal-task' }, [help, el('p', { class: 'read-sentence', text: task.question })]),
        say: task.question + ' ' + T.orList(options.map(o => o.label)) + '?',
        retry: task.question,
        praise: task.praise,
        item: { month: 'Månader', season: 'Årstider', number: 'Antal', year: 'År' }[task.type],
        help,
        choiceClass,
        choices: options
      };
    }
  };

  const LEVELS = [daysLevel, nearLevel, seasonLevel, monthLevel, whenLevel];
  const ROUNDS = { order: T.orderRound, quiz: T.quizRound, sort: T.sortRound };

  T.registerGame({
    id: 'kalendern',
    title: 'Kalendern',
    grade: 0,
    subject: 'Matematik',
    icon: '📅',
    color: '#ff9f1c',
    description: 'Veckodagar, månader och år.',

    renderProgress: p => T.accuracyReport(
      ['Veckodagar', 'Imorgon', 'Igår', 'Vinter', 'Vår', 'Sommar', 'Höst', 'Månader', 'Årstider', 'Antal', 'År'],
      p.items, 'Kalendern'),

    mount(root) {
      const timer = T.timers();

      // Startkortet: dagens datum, veckan och året
      function todayCard() {
        const now = new Date();
        const profile = T.profiles.current();
        const birthdayBox = el('div', { class: 'cal-birthday' });

        function drawBirthday() {
          const b = (T.profiles.current() || {}).birthday;
          if (!b) {
            birthdayBox.replaceChildren(el('button', {
              class: 'btn', type: 'button', text: '🎂 När fyller du år?',
              onclick: () => birthdayBox.replaceChildren(T.birthdayPicker(profile, showLevels))
            }));
            return;
          }
          const left = (b.month - now.getMonth() + 12) % 12;
          const isToday = left === 0 && b.day === now.getDate();
          birthdayBox.replaceChildren(el('p', { class: 'cal-birthday-text', text: isToday
            ? '🎉 Grattis på födelsedagen, ' + profile.name + '! 🎂'
            : '🎂 Du fyller år den ' + b.day + ' ' + MONTHS[b.month].name +
              (left === 0 ? b.day > now.getDate() ? ' – den här månaden!' : '.' : ' – om ' + left + (left === 1 ? ' månad.' : ' månader.')) }));
        }
        drawBirthday();

        const b = profile && profile.birthday;
        return el('div', { class: 'cal-today' }, [
          el('div', { class: 'cal-today-row' }, [
            calendarSheet(now),
            yearWheel({ mark: now.getMonth(), birthday: b ? b.month : null, year: now.getFullYear() })
          ]),
          weekStrip(weekday(now), 'idag'),
          el('button', { class: 'btn btn-listen', type: 'button', text: '🔊 Lyssna', onclick: () => T.speak(todaySentence()) }),
          birthdayBox
        ]);
      }

      function showLevels() {
        timer.clear();
        T.levelScreen(root, {
          icon: '📅',
          title: 'Kalendern',
          text: 'En vecka har sju dagar och ett år har tolv månader. Vad är det för dag idag?',
          levels: LEVELS,
          onPick: startRound,
          options: todayCard()
        });
        timer.later(() => T.speak(todaySentence()), 500);
      }

      function startRound(level) {
        timer.clear();
        const roundLength = 8;
        ROUNDS[level.round](root, {
          gameId: 'kalendern',
          level,
          timer,
          roundLength,
          tasks: level.makeTasks ? level.makeTasks(level, roundLength) : null,
          hint: level.hint,
          render: level.render ? task => level.render(task, level) : null,
          onReplay: () => startRound(level),
          onLevels: showLevels
        });
      }

      showLevels();
      return timer.clear;
    }
  });
})();
