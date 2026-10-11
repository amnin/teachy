/*
 * Belöningar – sådant som gör att det är roligt att komma tillbaka:
 *
 * - Nivåer efter hur många stjärnor man har samlat (Nybörjare → Legend).
 * - Märken ("achievements") för t.ex. tre dagar i rad, alla rätt eller att ha
 *   provat alla spel i en årskurs. De flesta räknas fram ur sparade rundor.
 * - Dagens utmaning: ett nytt spel att prova varje dag, med bonusstjärnor.
 * - Veckans mål: spela några dagar i veckan.
 *
 * Allt är snällt: inga straff, inget som försvinner. Att missa en dag syns
 * bara som att man kan börja om – aldrig som något man förlorat.
 *
 * Sparas per profil i store:
 *   badges:<id>     = { <märke>: datum } – märken som barnet redan har sett
 *   challenge:<id>  = { date, gameId }   – dagens utmaning
 *   challenges:<id> = [datum, …]         – dagar då utmaningen klarades
 *   bonus:<id>      = antal bonusstjärnor
 *   level:<id>      = senast sedda nivå
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const CHALLENGE_BONUS = 5;
  const WEEK_GOAL = 4;

  // ---------- Datum ----------

  const pad = n => String(n).padStart(2, '0');
  const dayKey = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => dayKey(new Date());
  function addDays(key, n) {
    const [y, m, d] = key.split('-').map(Number);
    return dayKey(new Date(y, m - 1, d + n));
  }
  // Måndagen i veckan som dagen ligger i
  function mondayOf(key) {
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return addDays(key, -((date.getDay() + 6) % 7));
  }

  // ---------- Nivåer ----------

  const LEVELS = [
    [0, '🐣', 'Nybörjare'], [10, '🔍', 'Upptäckare'], [30, '🐿️', 'Nyfiken'], [60, '🦊', 'Klurig'],
    [100, '🦉', 'Smart'], [160, '⭐', 'Stjärna'], [250, '🌟', 'Superstjärna'], [375, '🚀', 'Raket'],
    [550, '🏅', 'Mästare'], [800, '🏆', 'Stormästare'], [1100, '👑', 'Kung av kunskap'], [1500, '🐉', 'Legend']
  ].map(([stars, icon, name], i) => ({ number: i + 1, stars, icon, name }));

  function levelFor(stars) {
    let level = LEVELS[0];
    for (const l of LEVELS) if (stars >= l.stars) level = l;
    const next = LEVELS[level.number] || null;
    return { level, next, toNext: next ? next.stars - stars : 0,
      share: next ? (stars - level.stars) / (next.stars - level.stars) : 1 };
  }

  // ---------- Statistik ur sparade rundor ----------

  function statsFor(profile) {
    const all = T.progress.all(profile.id);
    const games = T.allGames();
    const rounds = [];
    const starsBySubject = {};
    let gameStars = 0;

    for (const g of games) {
      const gp = all[g.id];
      if (!gp) continue;
      gameStars += gp.stars || 0;
      starsBySubject[g.subject] = (starsBySubject[g.subject] || 0) + (gp.stars || 0);
      (gp.rounds || []).forEach(r => rounds.push(Object.assign({ gameId: g.id }, r)));
    }
    rounds.sort((a, b) => (a.date < b.date ? -1 : 1));

    const days = new Set(rounds.map(r => dayKey(new Date(r.date))));
    const now = today();

    // Dagar i rad: räknas fram till idag, eller till igår om man inte hunnit spela idag än
    let streak = 0;
    for (let d = days.has(now) ? now : addDays(now, -1); days.has(d); d = addDays(d, -1)) streak++;

    const weeks = {};
    days.forEach(d => { const w = mondayOf(d); weeks[w] = (weeks[w] || 0) + 1; });
    const monday = mondayOf(now);
    const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i)).map(d => ({ day: d, played: days.has(d), today: d === now }));

    // Kämpe: fick F, spelade samma spel och nivå igen och gick bättre
    const comeback = rounds.some((r, i) => r.grade === 'F' &&
      rounds.slice(i + 1).some(o => o.gameId === r.gameId && o.level === r.level && o.score / o.total > r.score / r.total));

    const played = new Set(rounds.map(r => r.gameId));
    const birthday = profile.birthday;

    return {
      rounds,
      days,
      streak,
      playedToday: days.has(now),
      week,
      weeksDone: Object.values(weeks).filter(n => n >= WEEK_GOAL).length,
      stars: gameStars + T.store.get('bonus:' + profile.id, 0),
      starsBySubject,
      perfect: rounds.filter(r => r.score === r.total).length,
      aGrades: rounds.filter(r => r.grade === 'A').length,
      played,
      subjects: new Set(games.filter(g => played.has(g.id)).map(g => g.subject)),
      comeback,
      morning: rounds.some(r => new Date(r.date).getHours() < 9),
      weekend: rounds.some(r => [0, 6].includes(new Date(r.date).getDay())),
      birthdayPlay: !!birthday && rounds.some(r => {
        const d = new Date(r.date);
        return d.getMonth() === birthday.month && d.getDate() === birthday.day;
      }),
      challenges: T.store.get('challenges:' + profile.id, []).length,
      gradeDone: grade => {
        const own = games.filter(g => T.inGrade(g, grade.id));
        return { done: own.filter(g => played.has(g.id)).length, total: own.length };
      }
    };
  }

  // ---------- Märken ----------
  //
  // [id, ikon, namn, beskrivning, (stats) => [hur långt, mål]]

  const count = (id, icon, name, desc, value, goal) => ({ id, icon, name, desc, progress: s => [value(s), goal] });
  const subjectStars = (...subjects) => s => subjects.reduce((sum, sub) => sum + (s.starsBySubject[sub] || 0), 0);

  function badgeList() {
    const list = [
      count('first', '🌱', 'Första rundan', 'Spela klart en runda', s => s.rounds.length, 1),
      count('stars10', '⭐', '10 stjärnor', 'Samla 10 stjärnor', s => s.stars, 10),
      count('stars50', '🌟', '50 stjärnor', 'Samla 50 stjärnor', s => s.stars, 50),
      count('stars100', '💫', '100 stjärnor', 'Samla 100 stjärnor', s => s.stars, 100),
      count('stars250', '🌠', '250 stjärnor', 'Samla 250 stjärnor', s => s.stars, 250),
      count('stars500', '🌌', '500 stjärnor', 'Samla 500 stjärnor', s => s.stars, 500),
      count('stars1000', '🏆', '1000 stjärnor', 'Samla 1000 stjärnor', s => s.stars, 1000),

      count('perfect1', '💯', 'Alla rätt!', 'Få alla rätt i en runda', s => s.perfect, 1),
      count('perfect10', '🎯', 'Prickskytt', 'Få alla rätt i 10 rundor', s => s.perfect, 10),
      count('perfect50', '🏹', 'Mästerskytt', 'Få alla rätt i 50 rundor', s => s.perfect, 50),
      count('a5', '🅰️', 'A-samlare', 'Få betyget A fem gånger', s => s.aGrades, 5),
      count('a25', '🥇', 'A-mästare', 'Få betyget A 25 gånger', s => s.aGrades, 25),
      count('comeback', '💪', 'Kämpe', 'Spela samma nivå igen efter ett F – och gå bättre', s => (s.comeback ? 1 : 0), 1),

      count('streak3', '🔥', 'Tre dagar i rad', 'Spela tre dagar i rad', s => s.streak, 3),
      count('streak7', '☄️', 'En hel vecka', 'Spela sju dagar i rad', s => s.streak, 7),
      count('streak14', '🌋', 'Två veckor i rad', 'Spela 14 dagar i rad', s => s.streak, 14),
      count('days10', '📅', '10 speldagar', 'Spela på tio olika dagar', s => s.days.size, 10),
      count('days30', '🗓️', '30 speldagar', 'Spela på 30 olika dagar', s => s.days.size, 30),
      count('week1', '✅', 'Veckans mål', 'Spela ' + WEEK_GOAL + ' dagar samma vecka', s => s.weeksDone, 1),
      count('week5', '🏁', 'Fem veckomål', 'Klara veckans mål fem gånger', s => s.weeksDone, 5),
      count('challenge1', '🎲', 'Utmaningen antagen', 'Klara dagens utmaning', s => s.challenges, 1),
      count('challenge10', '🎖️', 'Utmanaren', 'Klara dagens utmaning tio gånger', s => s.challenges, 10),

      count('games5', '🧭', 'Upptäckare', 'Prova fem olika spel', s => s.played.size, 5),
      count('games15', '🗺️', 'Äventyrare', 'Prova 15 olika spel', s => s.played.size, 15),
      count('subjects3', '🌈', 'Allätare', 'Spela spel i tre olika ämnen', s => s.subjects.size, 3),

      count('swedish', '📚', 'Ordmästare', 'Samla 50 stjärnor i svenska', subjectStars('Svenska'), 50),
      count('math', '🧮', 'Räknegeni', 'Samla 50 stjärnor i matematik', subjectStars('Matematik'), 50),
      count('science', '🔬', 'Forskare', 'Samla 30 stjärnor i NO', subjectStars('NO', 'Natur och samhälle'), 30),
      count('society', '🌍', 'Världsmedborgare', 'Samla 30 stjärnor i SO', subjectStars('SO'), 30),
      count('english', '💂', 'English star', 'Samla 20 stjärnor i engelska', subjectStars('Engelska'), 20),

      count('morning', '🌅', 'Morgonpigg', 'Spela en runda före klockan nio', s => (s.morning ? 1 : 0), 1),
      count('weekend', '🎉', 'Helgplugg', 'Spela en runda på en lördag eller söndag', s => (s.weekend ? 1 : 0), 1),
      count('birthday', '🎂', 'Födelsedagskalas', 'Spela på din födelsedag', s => (s.birthdayPlay ? 1 : 0), 1)
    ];
    // Ett märke per årskurs: prova alla spel i årskursen
    T.GRADES.forEach(grade => list.push({
      id: 'grade' + grade.id, icon: '🎓', name: 'Hela ' + grade.name.toLowerCase(),
      desc: 'Prova alla spel i ' + grade.name.toLowerCase(),
      progress: s => { const g = s.gradeDone(grade); return [g.done, g.total]; }
    }));
    return list;
  }

  function evaluate(profile) {
    const stats = statsFor(profile);
    const seen = T.store.get('badges:' + profile.id, {});
    const badges = badgeList().map(b => {
      const [value, goal] = b.progress(stats);
      return Object.assign({}, b, { value: Math.min(value, goal), goal, unlocked: goal > 0 && value >= goal, date: seen[b.id] || null });
    });
    return { stats, badges, level: levelFor(stats.stars) };
  }

  // ---------- Dagens utmaning ----------

  // Ett spel per dag ur den valda årskursen – helst ett som inte spelats den senaste veckan
  function challengeFor(profile, grade) {
    const key = 'challenge:' + profile.id;
    const saved = T.store.get(key, null);
    const games = T.allGames();
    if (saved && saved.date === today() && games.some(g => g.id === saved.gameId)) return saved;

    const own = games.filter(g => T.inGrade(g, grade));
    if (!own.length) return null;
    const all = T.progress.all(profile.id);
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
    const fresh = own.filter(g => !(all[g.id] && all[g.id].rounds.some(r => r.date > weekAgo)));
    const pool = fresh.length ? fresh : own;
    // Samma val hela dagen, även om sidan laddas om
    const seed = [...(today() + profile.id)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
    const challenge = { date: today(), gameId: pool[seed % pool.length].id, grade };
    T.store.set(key, challenge);
    return challenge;
  }

  const challengeDone = profile => T.store.get('challenges:' + profile.id, []).includes(today());

  // ---------- Efter en runda ----------

  // Anropas av resultatskärmen. Ger det som är nytt sedan förra gången:
  // { badges: [...], level (om ny nivå), challenge (true om dagens utmaning klarades nu) }
  function afterRound(gameId) {
    const profile = T.profiles.current();
    if (!profile) return { badges: [] };

    let challenge = false;
    const saved = T.store.get('challenge:' + profile.id, null);
    if (saved && saved.date === today() && saved.gameId === gameId && !challengeDone(profile)) {
      T.store.set('challenges:' + profile.id, T.store.get('challenges:' + profile.id, []).concat(today()));
      T.store.set('bonus:' + profile.id, T.store.get('bonus:' + profile.id, 0) + CHALLENGE_BONUS);
      challenge = true;
    }

    const { badges, level } = evaluate(profile);
    const seen = T.store.get('badges:' + profile.id, {});
    const fresh = badges.filter(b => b.unlocked && !seen[b.id]);
    fresh.forEach(b => { seen[b.id] = new Date().toISOString(); });
    T.store.set('badges:' + profile.id, seen);

    const lastLevel = T.store.get('level:' + profile.id, 1);
    T.store.set('level:' + profile.id, level.level.number);

    return { badges: fresh, level: level.level.number > lastLevel ? level.level : null, challenge };
  }

  // Rutan på resultatskärmen med nya märken, ny nivå och klarad utmaning
  function resultNode(news) {
    const lines = [];
    if (news.challenge) lines.push(el('div', { class: 'reward-line' }, [el('span', { class: 'reward-icon', text: '🎲' }),
      el('span', null, [el('strong', { text: 'Dagens utmaning klar!' }), ' +' + CHALLENGE_BONUS + ' bonusstjärnor'])]));
    if (news.level) lines.push(el('div', { class: 'reward-line' }, [el('span', { class: 'reward-icon', text: news.level.icon }),
      el('span', null, [el('strong', { text: 'Ny nivå! ' }), 'Du är nu ' + news.level.name + ' (nivå ' + news.level.number + ')'])]));
    news.badges.slice(0, 3).forEach(b => lines.push(el('div', { class: 'reward-line' }, [el('span', { class: 'reward-icon', text: b.icon }),
      el('span', null, [el('strong', { text: 'Nytt märke: ' + b.name }), el('span', { class: 'muted', text: ' – ' + b.desc })])])));
    if (news.badges.length > 3) lines.push(el('p', { class: 'muted', text: '… och ' + (news.badges.length - 3) + ' märken till! Titta under 📊 Framsteg.' }));
    return lines.length ? el('div', { class: 'reward-box' }, lines) : null;
  }

  // Det som läses upp om nyheterna
  function resultSpeech(news) {
    const parts = [];
    if (news.challenge) parts.push('Du klarade dagens utmaning!');
    if (news.level) parts.push('Du är nu ' + news.level.name + '!');
    if (news.badges.length === 1) parts.push('Du fick ett nytt märke: ' + news.badges[0].name + '!');
    if (news.badges.length > 1) parts.push('Du fick ' + news.badges.length + ' nya märken!');
    return parts.join(' ');
  }

  // ---------- Startsidan ----------

  function levelBar(info, small) {
    return el('div', { class: 'level-card' + (small ? ' small' : '') }, [
      el('span', { class: 'level-card-icon', text: info.level.icon }),
      el('div', { class: 'level-card-body' }, [
        el('div', { class: 'level-card-name' }, [el('strong', { text: info.level.name }), el('span', { class: 'muted', text: ' · nivå ' + info.level.number })]),
        el('div', { class: 'level-track' }, [el('span', { class: 'level-fill', style: 'width:' + Math.round(info.share * 100) + '%' })]),
        el('div', { class: 'muted small', text: info.next ? info.toNext + ' ⭐ kvar till ' + info.next.icon + ' ' + info.next.name : 'Högsta nivån! 🎉' })
      ])
    ]);
  }

  function weekDots(stats) {
    const names = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];
    const done = stats.week.filter(d => d.played).length;
    return el('div', { class: 'week-goal' }, [
      el('div', { class: 'week-goal-head' }, [
        el('strong', { text: 'Veckans mål' }),
        el('span', { class: 'muted', text: done >= WEEK_GOAL ? ' klart! ✅' : ' ' + done + ' av ' + WEEK_GOAL + ' dagar' })
      ]),
      el('div', { class: 'week-dots' }, stats.week.map((d, i) =>
        el('span', { class: 'week-dot' + (d.played ? ' played' : '') + (d.today ? ' today' : ''), title: d.day }, [
          el('span', { text: d.played ? '⭐' : names[i] })
        ])))
    ]);
  }

  // Märket som är närmast att låsas upp – något att sikta på
  function nextBadge(badges) {
    return badges.filter(b => !b.unlocked && b.goal > 1 && b.value > 0)
      .sort((a, b) => b.value / b.goal - a.value / a.goal)[0] ||
      badges.find(b => !b.unlocked) || null;
  }

  function hubPanel(profile, grade) {
    const { stats, badges, level } = evaluate(profile);
    const challenge = challengeFor(profile, grade);
    const game = challenge && T.allGames().find(g => g.id === challenge.gameId);
    const done = challengeDone(profile);
    const next = nextBadge(badges);

    return el('section', { class: 'hub-rewards' }, [
      levelBar(level),
      el('div', { class: 'hub-rewards-row' }, [
        game ? el('a', { class: 'challenge-card' + (done ? ' done' : ''), href: '#/' + game.id, style: '--accent:' + (game.color || '#7c5cff') }, [
          el('span', { class: 'challenge-label', text: done ? '🎲 Dagens utmaning – klar! ✅' : '🎲 Dagens utmaning' }),
          el('span', { class: 'challenge-game' }, [el('span', { class: 'challenge-icon', text: game.icon }), el('strong', { text: game.title })]),
          el('span', { class: 'muted small', text: done ? 'Kom tillbaka i morgon för en ny!' : 'Spela en runda: +' + CHALLENGE_BONUS + ' bonusstjärnor' })
        ]) : null,
        el('div', { class: 'hub-rewards-side' }, [
          weekDots(stats),
          stats.streak >= 2 ? el('div', { class: 'streak' }, [
            el('span', { text: '🔥 ' + stats.streak + ' dagar i rad' }),
            stats.playedToday ? null : el('span', { class: 'muted small', text: ' – spela idag för att fortsätta!' })
          ]) : null,
          next ? el('a', { class: 'next-badge', href: '#/framsteg' }, [
            el('span', { class: 'next-badge-icon', text: next.icon }),
            el('span', null, [el('strong', { text: 'Nästa märke: ' + next.name }), el('span', { class: 'muted small', text: ' ' + next.value + '/' + next.goal })])
          ]) : null
        ])
      ])
    ]);
  }

  // ---------- Framstegssidan ----------

  // De senaste fem veckorna som rutor, en per dag
  function calendar(stats) {
    const monday = mondayOf(today());
    const start = addDays(monday, -28);
    const cells = Array.from({ length: 35 }, (_, i) => {
      const d = addDays(start, i);
      const future = d > today();
      return el('span', { class: 'cal-cell' + (stats.days.has(d) ? ' played' : '') + (d === today() ? ' today' : '') + (future ? ' future' : ''), title: d });
    });
    return el('div', { class: 'play-calendar' }, [
      ...['M', 'T', 'O', 'T', 'F', 'L', 'S'].map(n => el('span', { class: 'cal-head', text: n })),
      ...cells
    ]);
  }

  function progressPanel(profile) {
    const { stats, badges, level } = evaluate(profile);
    const unlocked = badges.filter(b => b.unlocked).length;

    return el('div', { class: 'rewards-page' }, [
      el('section', { class: 'panel' }, [
        el('h2', { text: '🏅 Nivå' }),
        levelBar(level),
        el('div', { class: 'level-ladder' }, LEVELS.map(l => el('span', {
          class: 'ladder-step' + (l.number <= level.level.number ? ' reached' : ''), title: l.name + ' – ' + l.stars + ' ⭐'
        }, [l.icon])))
      ]),
      el('section', { class: 'panel' }, [
        el('h2', { text: '📅 Speldagar' }),
        el('p', { class: 'muted small', text: stats.days.size + ' dagar totalt' + (stats.streak >= 2 ? ' · 🔥 ' + stats.streak + ' dagar i rad' : '') + ' · ' + stats.weeksDone + ' veckomål klara' }),
        weekDots(stats),
        calendar(stats)
      ]),
      el('section', { class: 'panel' }, [
        el('h2', { text: '🎖️ Märken – ' + unlocked + ' av ' + badges.length }),
        el('div', { class: 'badge-grid' }, badges.map(b => el('div', {
          class: 'badge' + (b.unlocked ? ' unlocked' : ''), title: b.desc
        }, [
          el('span', { class: 'badge-icon', text: b.icon }),
          el('strong', { class: 'badge-name', text: b.name }),
          el('span', { class: 'badge-desc', text: b.desc }),
          b.unlocked
            ? el('span', { class: 'badge-date', text: b.date ? T.formatDate(b.date).replace(/ \d\d:\d\d$/, '') : '✓' })
            : el('span', { class: 'badge-progress' }, [
              el('span', { class: 'badge-progress-fill', style: 'width:' + Math.round(b.value / b.goal * 100) + '%' }),
              el('span', { class: 'badge-progress-text', text: b.value + '/' + b.goal })
            ])
        ])))
      ])
    ]);
  }

  T.rewards = { afterRound, resultNode, resultSpeech, hubPanel, progressPanel, totalStars: profile => statsFor(profile).stars };
})();
