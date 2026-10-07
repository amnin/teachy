/*
 * Teachy – gemensam kärna för alla spel.
 *
 * Ett spel registreras med Teachy.registerGame({ id, title, subject, icon, color,
 * description, mount(root, api), renderProgress(progress, api) }).
 * mount() ritar spelet i root och kan returnera en städfunktion som körs när man
 * lämnar spelet. renderProgress() är valfri och visar spelets egna detaljer på
 * framstegssidan.
 */
(function () {
  'use strict';

  // Årskurser – varje spel anger sin med grade: 0, 1, ...
  const GRADES = [
    { id: 0, name: 'Årskurs 0', sub: 'Förskoleklass' },
    { id: 1, name: 'Årskurs 1', sub: 'Första klass' }
  ];

  // Ordning för ämnena på startsidan
  const SUBJECTS = ['Svenska', 'Matematik', 'Natur och samhälle', 'NO', 'SO', 'Engelska', 'Teknik'];

  const games = [];
  let cleanup = null;

  // grade kan vara ett tal eller en lista, t.ex. [0, 1] för spel i båda årskurserna
  function inGrade(game, grade) {
    return [].concat(game.grade).includes(grade);
  }

  function registerGame(game) {
    games.push(game);
  }

  // ---------- DOM ----------

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value == null || value === false) continue;
      if (key === 'text') node.textContent = value;
      else if (key === 'class') node.className = value;
      else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value);
    }
    for (const child of children || []) {
      if (child != null) node.append(child);
    }
    return node;
  }

  // ---------- Slump ----------

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function sample(list, n) {
    return shuffle(list).slice(0, n);
  }

  // Heltal från min till max (båda inräknade)
  function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // ---------- Tal (svensk röst, eller annat språk t.ex. 'en-GB') ----------

  const canSpeak = 'speechSynthesis' in window;
  let voices = [];

  function loadVoices() {
    voices = speechSynthesis.getVoices();
  }

  if (canSpeak) {
    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
  }

  // Bästa rösten för ett språk: exakt match (en-GB) före samma språk (en-US),
  // och naturliga röster (Premium/Enhanced/Natural) före de enkla standardrösterna
  function voiceQuality(v) {
    // Safari kallar alla versioner bara "Alva" – kvaliteten syns i voiceURI,
    // t.ex. com.apple.voice.premium.sv-SE.Alva
    const name = (v.name + ' ' + v.voiceURI).toLowerCase();
    if (/natural|neural|premium/.test(name)) return 3;
    if (/enhanced|förbättrad|siri/.test(name)) return 2;
    if (v.localService === false) return 1; // nätröster låter oftast bättre
    return 0;
  }

  function voiceFor(lang) {
    const norm = v => v.lang.replace('_', '-').toLowerCase();
    const best = list => list.sort((a, b) => voiceQuality(b) - voiceQuality(a))[0] || null;
    return best(voices.filter(v => norm(v) === lang.toLowerCase())) ||
      best(voices.filter(v => norm(v).startsWith(lang.slice(0, 2).toLowerCase())));
  }

  // Alla svenska röster, bästa först – för inställningssidan
  function swedishVoices() {
    return voices
      .filter(v => v.lang.toLowerCase().startsWith('sv'))
      // Safari kan lista samma röst flera gånger
      .filter((v, i, list) => list.findIndex(o => o.voiceURI === v.voiceURI) === i)
      .sort((a, b) => voiceQuality(b) - voiceQuality(a) || a.name.localeCompare(b.name, 'sv'));
  }

  // Svensk röst vald i inställningarna, annars den bästa som finns
  function swedishVoice() {
    const chosen = store.get('voice', null);
    return voices.find(v => v.voiceURI === chosen) || voiceFor('sv-SE');
  }

  // Uppläsningstakt vald i inställningarna
  const RATES = [
    { id: 0.7, name: 'Långsamt' },
    { id: 0.8, name: 'Lagom' },
    { id: 0.95, name: 'Snabbt' }
  ];

  function speak(text, lang) {
    if (!canSpeak || isMuted()) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang || 'sv-SE';
    const voice = u.lang.toLowerCase().startsWith('sv') ? swedishVoice() : voiceFor(u.lang);
    if (voice) u.voice = voice;
    u.rate = store.get('rate', 0.8);
    speechSynthesis.speak(u);
  }

  // ---------- Ljudeffekter ----------

  let audioCtx = null;

  function chime(kind) {
    if (isMuted()) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const right = kind === 'right';
      const notes = right ? [660, 880, 1320] : [240, 190];
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const t = audioCtx.currentTime + i * 0.1;
        osc.type = right ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch (e) { /* inget ljud – inget problem */ }
  }

  // ---------- Sparad data ----------

  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem('teachy:' + key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem('teachy:' + key, JSON.stringify(value));
      } catch (e) { /* privat läge e.d. */ }
    },
    remove(key) {
      try {
        localStorage.removeItem('teachy:' + key);
      } catch (e) { /* ignorera */ }
    }
  };

  // ---------- Ljud av/på ----------

  function isMuted() {
    return store.get('muted', false);
  }

  function setMuted(muted) {
    store.set('muted', muted);
    if (muted && canSpeak) speechSynthesis.cancel();
    document.body.classList.toggle('muted', muted);
    document.querySelectorAll('.sound-toggle').forEach(updateSoundToggle);
  }

  function updateSoundToggle(btn) {
    const muted = isMuted();
    btn.textContent = muted ? '🔇' : '🔊';
    btn.title = muted ? 'Ljudet är av – tryck för att sätta på' : 'Ljudet är på – tryck för att stänga av';
    btn.setAttribute('aria-label', btn.title);
    btn.setAttribute('aria-pressed', String(muted));
  }

  function soundToggle() {
    const btn = el('button', {
      class: 'btn btn-small sound-toggle', type: 'button',
      onclick: () => setMuted(!isMuted())
    });
    updateSoundToggle(btn);
    return btn;
  }

  // ---------- Profiler ----------

  const AVATARS = ['🦄', '🐱', '🐶', '🦊', '🐼', '🐸', '🦁', '🐯', '🐵', '🐧', '🐙', '🦋', '🐢', '🐰', '🐨', '🦖'];

  const profiles = {
    list() {
      return store.get('profiles', []);
    },
    current() {
      const id = store.get('currentProfile', null);
      return this.list().find(p => p.id === id) || null;
    },
    select(id) {
      store.set('currentProfile', id);
    },
    create(name, avatar) {
      const profile = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name,
        avatar,
        created: new Date().toISOString()
      };
      store.set('profiles', [...this.list(), profile]);
      this.select(profile.id);
      return profile;
    },
    remove(id) {
      store.set('profiles', this.list().filter(p => p.id !== id));
      store.remove('progress:' + id);
      if (store.get('currentProfile', null) === id) store.set('currentProfile', null);
    }
  };

  // ---------- Framsteg (per profil och spel) ----------
  //
  // progress:<profilId> = {
  //   <spelId>: {
  //     stars: 12,
  //     rounds: [{ date, level, score, total, stars }],
  //     items:  { <t.ex. bokstav>: { right, wrong } }
  //   }
  // }

  const MAX_ROUNDS = 200;

  function emptyGameProgress() {
    return { stars: 0, rounds: [], items: {} };
  }

  const progress = {
    all(profileId) {
      return store.get('progress:' + profileId, {});
    },
    game(gameId, profileId) {
      const id = profileId || (profiles.current() || {}).id;
      return Object.assign(emptyGameProgress(), id ? this.all(id)[gameId] : null);
    },
    update(gameId, fn) {
      const profile = profiles.current();
      if (!profile) return;
      const all = this.all(profile.id);
      const g = Object.assign(emptyGameProgress(), all[gameId]);
      fn(g);
      all[gameId] = g;
      store.set('progress:' + profile.id, all);
    },
    // Ett svar på en sak som övas (t.ex. en bokstav). correct = rätt på första försöket.
    recordAnswer(gameId, item, correct) {
      this.update(gameId, g => {
        const s = g.items[item] || (g.items[item] = { right: 0, wrong: 0 });
        if (correct) s.right++;
        else s.wrong++;
      });
    },
    // En avslutad runda: { level, score, total, stars }
    recordRound(gameId, round) {
      this.update(gameId, g => {
        g.rounds.push(Object.assign({ date: new Date().toISOString() }, round));
        if (g.rounds.length > MAX_ROUNDS) g.rounds = g.rounds.slice(-MAX_ROUNDS);
        g.stars += round.stars || 0;
      });
    }
  };

  // ---------- Konfetti ----------

  function confetti() {
    const colors = ['#ff5d73', '#ffb627', '#3ddc97', '#4cc9f0', '#9b5de5', '#f15bb5'];
    const layer = el('div', { class: 'confetti', 'aria-hidden': 'true' });
    for (let i = 0; i < 60; i++) {
      const p = el('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.4 + 's';
      p.style.setProperty('--drift', Math.random() * 200 - 100 + 'px');
      p.style.setProperty('--spin', Math.random() * 1080 - 540 + 'deg');
      layer.append(p);
    }
    document.body.append(layer);
    setTimeout(() => layer.remove(), 2600);
  }

  // ---------- Formatering ----------

  function formatDate(iso) {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const time = d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === today.toDateString()) return 'Idag ' + time;
    if (d.toDateString() === yesterday.toDateString()) return 'Igår ' + time;
    return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }) + ' ' + time;
  }

  // ---------- Gemensamma spelbitar ----------
  //
  // Byggstenar som alla spel kan använda: nivåval, poängrad och resultatskärm.

  function timers() {
    let ids = [];
    return {
      later(fn, ms) { ids.push(setTimeout(fn, ms)); },
      clear() { ids.forEach(clearTimeout); ids = []; }
    };
  }

  // Startar om en CSS-animation, t.ex. "wrong" som skakar en knapp
  function replayClass(node, cls) {
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
  }

  function topBar(extra) {
    return el('header', { class: 'game-bar' }, [
      el('a', { class: 'btn btn-small', href: '#/', text: '← Hem' }),
      ...(extra || []),
      soundToggle()
    ]);
  }

  // levels = [{ name, icon, sub }, ...]. options = valfri nod med inställningar.
  function levelScreen(root, { icon, title, text, levels, onPick, options }) {
    root.replaceChildren(el('div', { class: 'screen' }, [
      topBar(),
      el('div', { class: 'intro' }, [
        el('div', { class: 'intro-icon', text: icon }),
        el('h1', { text: title }),
        el('p', { text: text })
      ]),
      options || null,
      el('div', { class: 'level-list' }, levels.map(level =>
        el('button', { class: 'level-btn', type: 'button', onclick: () => onPick(level) }, [
          el('span', { class: 'level-icon', text: level.icon }),
          el('span', { class: 'level-name', text: level.name }),
          el('span', { class: 'level-sub', text: level.sub })
        ])
      ))
    ]));
  }

  // Prickar (en per uppgift) och stjärnräknare som visas överst under en runda
  function roundTracker(total) {
    const dots = Array.from({ length: total }, () => el('span', { class: 'dot' }));
    const starCount = el('span', { class: 'star-count', text: '⭐ 0' });
    let stars = 0;
    return {
      bar: topBar([el('div', { class: 'dots' }, dots), starCount]),
      get stars() { return stars; },
      current(i) {
        dots.forEach((d, j) => d.classList.toggle('current', j === i));
      },
      mark(i, firstTry) {
        dots[i].classList.add(firstTry ? 'star' : 'done');
        if (firstTry) {
          stars++;
          starCount.textContent = '⭐ ' + stars;
        }
      }
    };
  }

  // Sparar rundan, firar och erbjuder att spela igen
  function resultScreen(root, { gameId, level, score, total, onReplay, onLevels }) {
    progress.recordRound(gameId, { level: level.name, score, total, stars: score });
    confetti();

    const name = profiles.current().name;
    const good = score >= total * 0.7;
    const message = score === total ? 'Alla rätt på första försöket, ' + name + '!'
      : good ? 'Jättebra jobbat, ' + name + '!'
      : 'Bra kämpat, ' + name + '! Öva lite till så blir du ännu bättre.';
    speak((good ? 'Jättebra jobbat, ' : 'Bra kämpat, ') + name + '!');

    root.replaceChildren(el('div', { class: 'screen' }, [
      topBar(),
      el('div', { class: 'result' }, [
        el('div', { class: 'result-icon', text: '🏆' }),
        el('h1', { text: message }),
        el('p', { class: 'result-stars', text: '⭐'.repeat(score) + '☆'.repeat(total - score) }),
        el('p', { text: 'Du fick ' + score + ' av ' + total + ' stjärnor.' }),
        el('div', { class: 'result-actions' }, [
          el('button', { class: 'btn btn-big', type: 'button', text: 'Spela igen', onclick: onReplay }),
          el('button', { class: 'btn btn-big btn-ghost', type: 'button', text: 'Byt nivå', onclick: onLevels })
        ])
      ])
    ]));
  }

  const PRAISE = ['Rätt!', 'Snyggt!', 'Bra!', 'Jättebra!', 'Toppen!'];

  function praise() {
    return PRAISE[Math.floor(Math.random() * PRAISE.length)];
  }

  // "a, b eller c"
  function orList(words) {
    return words.length < 2 ? words.join('') : words.slice(0, -1).join(', ') + ' eller ' + words[words.length - 1];
  }

  // Gör ett kort dragbart till ett antal mål (fungerar med mus, finger och penna).
  // targets() ger målen, onDrop(mål) anropas när kortet släpps på ett mål och
  // onTap() när kortet bara trycks på utan att dras.
  function draggable(card, { targets, enabled, onDrop, onTap }) {
    let drag = null;
    let pos = { x: 0, y: 0 };

    function move(x, y) {
      pos = { x, y };
      card.style.translate = x + 'px ' + y + 'px';
    }

    function targetAt(x, y) {
      const slack = 12;
      return targets().find(t => {
        const r = t.getBoundingClientRect();
        return x >= r.left - slack && x <= r.right + slack &&
               y >= r.top - slack && y <= r.bottom + slack;
      }) || null;
    }

    card.addEventListener('pointerdown', e => {
      if (drag || (enabled && !enabled())) return;
      e.preventDefault();
      card.setPointerCapture(e.pointerId);
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, over: null };
      card.classList.add('dragging');
    });

    card.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) > 8) drag.moved = true;
      move(dx, dy);

      const over = targetAt(e.clientX, e.clientY);
      if (over !== drag.over) {
        if (drag.over) drag.over.classList.remove('hover');
        if (over) over.classList.add('hover');
        drag.over = over;
      }
    });

    function end(e, cancelled) {
      if (!drag || e.pointerId !== drag.id) return;
      const { moved, over } = drag;
      drag = null;
      card.classList.remove('dragging');
      if (over) over.classList.remove('hover');

      if (!cancelled && over) {
        onDrop(over);
      } else {
        move(0, 0);
        if (!cancelled && !moved && onTap) onTap();
      }
    }

    card.addEventListener('pointerup', e => end(e, false));
    card.addEventListener('pointercancel', e => end(e, true));

    return {
      snapBack() {
        move(0, 0);
      },
      flyInto(target) {
        const c = card.getBoundingClientRect();
        const t = target.getBoundingClientRect();
        move(
          pos.x + (t.left + t.width / 2) - (c.left + c.width / 2),
          pos.y + (t.top + t.height / 2) - (c.top + c.height / 2)
        );
        card.style.scale = '0.25';
        card.style.opacity = '0';
      },
      // Nollställ kortet utan animation och låt det "poppa" in igen
      reset() {
        card.classList.add('dragging');
        card.style.translate = card.style.scale = card.style.opacity = '';
        pos = { x: 0, y: 0 };
        card.classList.remove('pop-in');
        void card.offsetWidth;
        card.classList.remove('dragging');
        card.classList.add('pop-in');
      }
    };
  }

  // En runda flervalsfrågor: en "fråga" överst och knappar att välja mellan.
  // render(task) ska returnera:
  //   prompt   – nod som visas överst
  //   say      – det som läses upp (och läses igen vid fel / 🔊 Lyssna)
  //   item     – vad som övas, för framstegssidan (t.ex. "-att" eller "7")
  //   choices  – [{ content, label, correct }]
  //   praise, choiceClass, onShow(), onRight(), onWrong() – valfria
  function quizRound(root, { gameId, level, tasks, hint, timer, render, onReplay, onLevels }) {
    const tracker = roundTracker(tasks.length);
    const promptBox = el('div', { class: 'quiz-prompt' });
    const choicesBox = el('div', { class: 'letters' });
    let index = 0;
    let mistakes = 0;
    let locked = false;
    let view = null;
    let tiles = [];

    root.replaceChildren(el('div', { class: 'screen' }, [
      tracker.bar,
      hint ? el('p', { class: 'hint', text: hint }) : null,
      el('div', { class: 'quiz-zone' }, [
        promptBox,
        el('button', { class: 'btn btn-listen', type: 'button', text: '🔊 Lyssna', onclick: () => speak(view.say, view.lang) })
      ]),
      choicesBox
    ]));

    function show() {
      mistakes = 0;
      locked = false;
      view = render(tasks[index]);
      tracker.current(index);
      promptBox.replaceChildren(view.prompt);
      replayClass(promptBox, 'pop-in');

      tiles = view.choices.map(choice => {
        const tile = el('button', {
          class: 'tile ' + (view.choiceClass || ''), type: 'button', 'aria-label': choice.label,
          onclick: () => choose(tile, choice)
        }, [].concat(choice.content));
        return tile;
      });
      choicesBox.replaceChildren(...tiles);

      if (view.onShow) view.onShow();
      timer.later(() => speak(view.say, view.lang), 400);
    }

    function choose(tile, choice) {
      if (locked || tile.disabled) return;

      if (choice.correct) {
        locked = true;
        tile.classList.add('right');
        chime('right');
        progress.recordAnswer(gameId, view.item, mistakes === 0);
        tracker.mark(index, mistakes === 0);
        if (view.onRight) view.onRight();
        timer.later(() => speak(view.praise || praise(), view.praise ? view.lang : null), 350);
        timer.later(next, 2400);
      } else {
        mistakes++;
        chime('wrong');
        replayClass(tile, 'wrong');
        tile.disabled = true;
        if (view.onWrong) view.onWrong();
        timer.later(() => speak(view.retry || view.say, view.lang), 350);

        // Efter två fel: visa var rätt svar är
        if (mistakes >= 2) tiles[view.choices.findIndex(c => c.correct)].classList.add('nudge');
      }
    }

    function next() {
      index++;
      if (index < tasks.length) {
        show();
        return;
      }
      timer.clear();
      resultScreen(root, { gameId, level, score: tracker.stars, total: tasks.length, onReplay, onLevels });
    }

    show();
  }

  // Svarsknappar för tal: rätt svar + troliga felsvar (extra) + närliggande tal,
  // i storleksordning. Ger färdiga choices till quizRound.
  function numberOptions(answer, count, min, max, extra) {
    const ok = n => Number.isInteger(n) && n >= min && n <= max && n !== answer;
    const picked = [];
    for (const n of shuffle((extra || []).filter(ok))) {
      if (!picked.includes(n) && picked.length < count - 1) picked.push(n);
    }
    for (let d = 1; picked.length < count - 1 && d <= max - min; d++) {
      for (const n of shuffle([answer - d, answer + d])) {
        if (ok(n) && !picked.includes(n) && picked.length < count - 1) picked.push(n);
      }
    }
    return [answer, ...picked].sort((a, b) => a - b).map(n => ({
      label: String(n),
      correct: n === answer,
      content: el('span', { class: 'tile-up', text: n })
    }));
  }

  // Tom "?"-ruta i en uppgift. fill(text) visar svaret när det är rätt.
  function slot(text) {
    const node = el('span', { class: 'pattern-slot', text: text || '?' });
    node.fill = value => {
      node.textContent = value;
      node.classList.add('right');
    };
    return node;
  }

  // Bild till ett kort: emoji, eller en SVG-sträng (svg) för egna ritningar
  function picture(item, cls) {
    const node = el('span', { class: cls || 'picture' });
    if (item.svg) node.innerHTML = item.svg;
    else node.textContent = item.emoji;
    return node;
  }

  // En runda där bilder dras till rätt grupp.
  // level = { question, bins: [{ label, icon | svg, items: [{ name, emoji | svg }] }] }
  function sortRound(root, { gameId, level, timer, roundLength, onReplay, onLevels }) {
    const pool = level.bins.flatMap(bin => bin.items.map(item => ({ item, bin })));
    const tasks = sample(pool, Math.min(roundLength, pool.length));
    const tracker = roundTracker(tasks.length);
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
        picture({ emoji: bin.icon, svg: bin.svg }, 'bin-icon'),
        el('span', { class: 'bin-label', text: bin.label })
      ]);
      node.dataset.label = bin.label;
      return node;
    });

    root.replaceChildren(el('div', { class: 'screen sortera' }, [
      tracker.bar,
      el('p', { class: 'hint', text: level.question }),
      el('div', { class: 'pic-zone' }, [card, caption,
        el('button', { class: 'btn btn-listen', type: 'button', text: '🔊 Lyssna', onclick: () => speak(current.item.name) })
      ]),
      el('div', { class: 'bins' }, bins)
    ]));

    // Frågan läses först, sedan den första bildens namn
    timer.later(() => speak(level.question), 300);

    const dragger = draggable(card, {
      targets: () => bins,
      enabled: () => !locked,
      onDrop: bin => choose(bin),
      onTap: () => speak(current.item.name)
    });

    function show(first) {
      current = tasks[index];
      mistakes = 0;
      locked = false;
      tracker.current(index);
      card.replaceChildren(picture(current.item, 'pic-card-picture'));
      card.setAttribute('aria-label', current.item.name);
      caption.textContent = '';
      bins.forEach(b => b.classList.remove('right', 'nudge'));
      dragger.reset();
      timer.later(() => speak(current.item.name), first ? 2600 : 400);
    }

    function choose(binNode) {
      if (locked) return;
      const label = binNode.dataset.label;

      if (label === current.bin.label) {
        locked = true;
        binNode.classList.add('right');
        dragger.flyInto(binNode);
        chime('right');
        progress.recordAnswer(gameId, label, mistakes === 0);
        tracker.mark(index, mistakes === 0);
        caption.textContent = current.item.name + ' – ' + label.toLowerCase();
        timer.later(() => speak(current.item.name + '. ' + label), 350);
        timer.later(next, 2200);
      } else {
        mistakes++;
        chime('wrong');
        replayClass(binNode, 'wrong');
        dragger.snapBack();
        timer.later(() => speak(current.item.name), 350);
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
      resultScreen(root, { gameId, level, score: tracker.stars, total: tasks.length, onReplay, onLevels });
    }

    show(true);
  }

  // En runda där man trycker i rätt ordning: bokstäverna i ett ord, stegen i en livscykel ...
  // render(task) ska returnera:
  //   steps  – [{ label, emoji | svg | text, caption }] i rätt ordning (samma label = utbytbara)
  //   say, item – som i quizRound
  //   prompt, retry, praise, lang, arrows (pilar mellan rutorna) – valfria
  function orderRound(root, { gameId, level, tasks, hint, timer, render, onReplay, onLevels }) {
    const tracker = roundTracker(tasks.length);
    const promptBox = el('div', { class: 'quiz-prompt' });
    const slotsBox = el('div', { class: 'order-slots' });
    const tilesBox = el('div', { class: 'letters' });
    let index = 0;
    let mistakes = 0;
    let pos = 0;
    let locked = false;
    let view = null;
    let tiles = [];
    let slots = [];

    root.replaceChildren(el('div', { class: 'screen' }, [
      tracker.bar,
      hint ? el('p', { class: 'hint', text: hint }) : null,
      el('div', { class: 'quiz-zone' }, [
        promptBox,
        slotsBox,
        el('button', { class: 'btn btn-listen', type: 'button', text: '🔊 Lyssna', onclick: () => speak(view.say, view.lang) })
      ]),
      tilesBox
    ]));

    function stepNode(step) {
      return el('span', { class: 'order-content' }, [
        step.text != null ? el('span', { class: 'order-text', text: step.text }) : picture(step, 'order-picture'),
        step.caption ? el('span', { class: 'order-caption', text: step.caption }) : null
      ]);
    }

    function show() {
      mistakes = 0;
      pos = 0;
      locked = false;
      view = render(tasks[index]);
      tracker.current(index);

      promptBox.replaceChildren(...(view.prompt ? [view.prompt] : []));
      promptBox.hidden = !view.prompt;
      replayClass(promptBox, 'pop-in');

      slots = view.steps.map(() => el('span', { class: 'order-slot' }));
      slotsBox.className = 'order-slots' + (view.arrows ? ' with-arrows' : '');
      slotsBox.replaceChildren(...slots.flatMap((slot, i) =>
        i && view.arrows ? [el('span', { class: 'order-arrow', text: '→' }), slot] : [slot]));

      tiles = shuffle(view.steps).map(step => {
        const tile = el('button', {
          class: 'tile order-tile', type: 'button', 'aria-label': step.label,
          onclick: () => choose(tile, step)
        }, [stepNode(step)]);
        tile.dataset.label = step.label;
        return tile;
      });
      tilesBox.replaceChildren(...tiles);

      timer.later(() => speak(view.say, view.lang), 400);
    }

    function choose(tile, step) {
      if (locked || tile.disabled) return;
      const expected = view.steps[pos];

      if (step.label === expected.label) {
        tile.disabled = true;
        tile.classList.add('used');
        tiles.forEach(t => t.classList.remove('nudge'));
        slots[pos].replaceChildren(stepNode(step));
        slots[pos].classList.add('filled');
        pos++;
        if (pos < view.steps.length) return;

        locked = true;
        slots.forEach(s => s.classList.add('right'));
        chime('right');
        progress.recordAnswer(gameId, view.item, mistakes === 0);
        tracker.mark(index, mistakes === 0);
        timer.later(() => speak(view.praise || praise(), view.praise ? view.lang : null), 350);
        timer.later(next, 2600);
      } else {
        mistakes++;
        chime('wrong');
        replayClass(tile, 'wrong');
        timer.later(() => speak(view.retry || view.say, view.lang), 350);
        if (mistakes >= 2) {
          const right = tiles.find(t => !t.disabled && t.dataset.label === expected.label);
          if (right) right.classList.add('nudge');
        }
      }
    }

    function next() {
      index++;
      if (index < tasks.length) {
        show();
        return;
      }
      timer.clear();
      resultScreen(root, { gameId, level, score: tracker.stars, total: tasks.length, onReplay, onLevels });
    }

    show();
  }

  // Registrerar ett vanligt spel: nivåval + en runda av vald typ.
  // def = { id, title, grade, subject, icon, color, description, intro, levels,
  //         makeTasks(level, n), render(task, level, timer), hint, roundLength,
  //         report: { title, keys } | renderProgress }
  function defineGame(def, round) {
    const report = def.report;
    registerGame({
      id: def.id,
      title: def.title,
      grade: def.grade,
      subject: def.subject,
      icon: def.icon,
      color: def.color,
      description: def.description,
      renderProgress: def.renderProgress || (report
        ? p => accuracyReport(typeof report.keys === 'function' ? report.keys() : report.keys, p.items, report.title)
        : null),
      mount(root) {
        const timer = timers();

        function showLevels() {
          timer.clear();
          levelScreen(root, { icon: def.icon, title: def.title, text: def.intro, levels: def.levels, onPick: startRound });
        }

        function startRound(level) {
          timer.clear();
          const roundLength = def.roundLength || 10;
          round(root, {
            gameId: def.id,
            level,
            timer,
            roundLength,
            tasks: def.makeTasks ? def.makeTasks(level, roundLength) : null,
            hint: typeof def.hint === 'function' ? def.hint(level) : def.hint,
            render: def.render ? task => def.render(task, level, timer) : null,
            onReplay: () => startRound(level),
            onLevels: showLevels
          });
        }

        showLevels();
        return timer.clear;
      }
    });
  }

  function quizGame(def) {
    defineGame(def, quizRound);
  }

  function orderGame(def) {
    defineGame(def, orderRound);
  }

  function sortGame(def) {
    const labels = () => [...new Set(def.levels.flatMap(l => l.bins.map(b => b.label)))];
    defineGame(Object.assign({ report: { title: 'Grupper', keys: labels } }, def), sortRound);
  }

  // Reglage av/på, t.ex. för en inställning på nivåsidan
  function toggle(label, on, onChange) {
    return el('button', {
      class: 'toggle' + (on ? ' on' : ''), type: 'button', role: 'switch', 'aria-checked': String(on),
      onclick: () => onChange(!on)
    }, [
      el('span', { class: 'toggle-track' }, [el('span', { class: 'toggle-knob' })]),
      el('span', { text: label }),
      el('strong', { text: on ? 'På' : 'Av' })
    ]);
  }

  // Framstegsrapport: träffsäkerhet per sak (t.ex. bokstav) som grönt/gult/rött
  // rutnät, plus en lista över det som behöver övas mest.
  function accuracyReport(keys, items, title) {
    const rate = s => s.right / (s.right + s.wrong);

    const tiles = keys.map(key => {
      const s = items[key];
      if (!s) {
        return el('div', { class: 'letter-stat none', title: 'Inte övad än' }, [
          el('strong', { text: key }), el('span', { text: '–' })
        ]);
      }
      const r = rate(s);
      return el('div', {
        class: 'letter-stat ' + (r >= 0.8 ? 'good' : r >= 0.5 ? 'ok' : 'bad'),
        title: s.right + ' rätt, ' + s.wrong + ' med fel'
      }, [
        el('strong', { text: key }),
        el('span', { text: Math.round(r * 100) + '%' })
      ]);
    });

    const practise = keys
      .filter(k => items[k] && items[k].right + items[k].wrong >= 2 && rate(items[k]) < 0.6)
      .sort((a, b) => rate(items[a]) - rate(items[b]));

    return el('div', null, [
      el('h3', { text: title }),
      el('p', { class: 'muted small', text: 'Andel rätt på första försöket. Grönt = sitter bra, gult = nästan, rött = behöver övas.' }),
      el('div', { class: 'letter-stats' }, tiles),
      practise.length
        ? el('p', { class: 'practise' }, ['Öva extra på: ', el('strong', { text: practise.join(', ') })])
        : null
    ]);
  }

  // ---------- Profilval ----------

  function renderProfiles(app) {
    const list = profiles.list();
    const current = profiles.current();

    if (list.length === 0) {
      app.append(el('div', { class: 'screen' }, [
        el('header', { class: 'hub-head' }, [
          el('h1', { text: 'Teachy' }),
          el('p', { text: 'Hej! Skapa din profil för att börja spela.' })
        ]),
        profileForm(false)
      ]));
      return;
    }

    const formSlot = el('div');
    const addBtn = el('button', {
      class: 'profile-btn profile-add', type: 'button',
      onclick: () => {
        addBtn.hidden = true;
        formSlot.replaceChildren(profileForm(true, () => {
          addBtn.hidden = false;
          formSlot.replaceChildren();
        }));
      }
    }, [el('span', { class: 'profile-avatar', text: '＋' }), el('span', { class: 'profile-name', text: 'Ny profil' })]);

    app.append(el('div', { class: 'screen' }, [
      current ? el('header', { class: 'game-bar' }, [el('a', { class: 'btn btn-small', href: '#/', text: '← Hem' })]) : null,
      el('header', { class: 'hub-head' }, [el('h1', { text: 'Vem spelar?' })]),
      el('div', { class: 'profile-grid' }, [
        ...list.map(p => el('button', {
          class: 'profile-btn' + (current && current.id === p.id ? ' selected' : ''), type: 'button',
          onclick: () => {
            profiles.select(p.id);
            speak('Hej ' + p.name + '!');
            go('#/');
          }
        }, [
          el('span', { class: 'profile-avatar', text: p.avatar }),
          el('span', { class: 'profile-name', text: p.name })
        ])),
        addBtn
      ]),
      formSlot
    ]));
  }

  function profileForm(cancellable, onCancel) {
    let avatar = AVATARS[0];
    const input = el('input', {
      class: 'name-input', type: 'text', maxlength: '20', autocomplete: 'off',
      placeholder: 'Ditt namn', 'aria-label': 'Namn'
    });
    const submit = el('button', { class: 'btn btn-big', type: 'submit', text: 'Klar!', disabled: 'disabled' });
    input.addEventListener('input', () => { submit.disabled = !input.value.trim(); });

    const avatarBtns = AVATARS.map(a => {
      const btn = el('button', {
        class: 'avatar-btn' + (a === avatar ? ' selected' : ''), type: 'button', 'aria-label': 'Välj ' + a,
        onclick: () => {
          avatar = a;
          avatarBtns.forEach(b => b.classList.toggle('selected', b === btn));
        }
      }, [a]);
      return btn;
    });

    const form = el('form', { class: 'profile-form' }, [
      el('h2', { text: 'Vad heter du?' }),
      input,
      el('h2', { text: 'Välj en figur' }),
      el('div', { class: 'avatar-grid' }, avatarBtns),
      el('div', { class: 'result-actions' }, [
        submit,
        cancellable ? el('button', { class: 'btn btn-big btn-ghost', type: 'button', text: 'Avbryt', onclick: onCancel }) : null
      ])
    ]);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = input.value.trim();
      if (!name) return;
      profiles.create(name, avatar);
      speak('Hej ' + name + '!');
      go('#/');
    });
    setTimeout(() => input.focus(), 0);
    return form;
  }

  // ---------- Startsida ----------

  function profileBar(profile) {
    return el('div', { class: 'profile-bar' }, [
      el('a', { class: 'profile-chip', href: '#/profiler', title: 'Byt profil' }, [
        el('span', { class: 'profile-chip-avatar', text: profile.avatar }),
        el('span', { text: profile.name })
      ]),
      el('div', { class: 'profile-bar-actions' }, [
        el('a', { class: 'btn btn-small', href: '#/framsteg', text: '📊 Framsteg' }),
        el('a', { class: 'btn btn-small', href: '#/installningar', text: '⚙️', title: 'Inställningar', 'aria-label': 'Inställningar' }),
        soundToggle()
      ])
    ]);
  }

  // Vald årskurs på startsidan – sparas per profil
  function selectedGrade(profile) {
    const id = store.get('grade:' + profile.id, GRADES[0].id);
    return GRADES.some(g => g.id === id) ? id : GRADES[0].id;
  }

  function renderHub(app, profile) {
    const grade = selectedGrade(profile);

    app.append(profileBar(profile));
    app.append(el('header', { class: 'hub-head' }, [
      el('h1', { text: 'Teachy' }),
      el('p', { text: 'Vad vill du spela idag, ' + profile.name + '?' })
    ]));

    app.append(el('nav', { class: 'grade-tabs', 'aria-label': 'Årskurs' }, GRADES.map(g =>
      el('button', {
        class: 'grade-tab' + (g.id === grade ? ' selected' : ''), type: 'button',
        'aria-pressed': String(g.id === grade),
        onclick: () => {
          store.set('grade:' + profile.id, g.id);
          route();
        }
      }, [
        el('span', { class: 'grade-tab-name', text: g.name }),
        el('span', { class: 'grade-tab-sub', text: g.sub })
      ])
    )));

    const gradeGames = games.filter(g => inGrade(g, grade));
    if (!gradeGames.length) {
      app.append(el('div', { class: 'empty-grade' }, [
        el('div', { class: 'intro-icon', text: '🚧' }),
        el('p', { text: 'Här kommer det snart spel!' })
      ]));
      return;
    }

    // Ämnen i fast ordning; okända ämnen hamnar sist
    const rank = subject => (SUBJECTS.includes(subject) ? SUBJECTS.indexOf(subject) : SUBJECTS.length);
    const subjects = [...new Set(gradeGames.map(g => g.subject))].sort((a, b) => rank(a) - rank(b));
    for (const subject of subjects) {
      const cards = gradeGames.filter(g => g.subject === subject).map(g => {
        const stars = progress.game(g.id, profile.id).stars;
        return el('a', { class: 'game-card', href: '#/' + g.id, style: '--accent:' + (g.color || '#7c5cff') }, [
          el('span', { class: 'game-card-icon', text: g.icon }),
          el('span', { class: 'game-card-title', text: g.title }),
          el('span', { class: 'game-card-desc', text: g.description }),
          stars ? el('span', { class: 'game-card-stars', text: '⭐ ' + stars }) : null
        ]);
      });
      app.append(el('section', { class: 'subject' }, [
        el('h2', { text: subject }),
        el('div', { class: 'game-grid' }, cards)
      ]));
    }
  }

  // ---------- Framstegssida ----------

  function renderProgress(app, profile) {
    const all = progress.all(profile.id);
    const played = games.filter(g => all[g.id] && all[g.id].rounds.length);
    const totalStars = games.reduce((sum, g) => sum + progress.game(g.id, profile.id).stars, 0);
    const totalRounds = played.reduce((sum, g) => sum + all[g.id].rounds.length, 0);
    const lastDate = played
      .map(g => all[g.id].rounds[all[g.id].rounds.length - 1].date)
      .sort()
      .pop();

    const stat = (icon, value, label) => el('div', { class: 'stat' }, [
      el('span', { class: 'stat-icon', text: icon }),
      el('span', { class: 'stat-value', text: String(value) }),
      el('span', { class: 'stat-label', text: label })
    ]);

    const sections = games.map(g => {
      const gp = progress.game(g.id, profile.id);
      const head = el('div', { class: 'progress-head' }, [
        el('span', { class: 'progress-icon', text: g.icon }),
        el('h2', { text: g.title }),
        el('span', { class: 'progress-subject', text: g.subject })
      ]);

      if (!gp.rounds.length && !Object.keys(gp.items).length) {
        return el('section', { class: 'panel', style: '--accent:' + (g.color || '#7c5cff') }, [
          head, el('p', { class: 'muted', text: 'Inte spelat än.' })
        ]);
      }

      const best = gp.rounds.reduce((b, r) => (!b || r.score / r.total > b.score / b.total ? r : b), null);
      const recent = gp.rounds.slice(-10).reverse();

      return el('section', { class: 'panel', style: '--accent:' + (g.color || '#7c5cff') }, [
        head,
        el('p', { class: 'muted', text:
          gp.rounds.length + ' rundor · ⭐ ' + gp.stars +
          (best ? ' · bästa: ' + best.score + '/' + best.total : '') }),
        g.renderProgress ? g.renderProgress(gp, api) : null,
        recent.length ? el('h3', { text: 'Senaste rundorna' }) : null,
        recent.length ? el('ul', { class: 'round-list' }, recent.map(r => el('li', null, [
          el('span', { text: formatDate(r.date) }),
          el('span', { class: 'muted', text: r.level || '' }),
          el('strong', { text: r.score + '/' + r.total })
        ]))) : null
      ]);
    });

    // Ta bort profil – två steg så att ingen raderar av misstag
    const danger = el('div', { class: 'danger-zone' });
    function showDelete() {
      danger.replaceChildren(el('button', {
        class: 'btn btn-small', type: 'button', text: 'Ta bort profil',
        onclick: () => danger.replaceChildren(
          el('span', { text: 'Ta bort ' + profile.name + ' och alla framsteg?' }),
          el('button', {
            class: 'btn btn-small btn-danger', type: 'button', text: 'Ja, ta bort',
            onclick: () => {
              profiles.remove(profile.id);
              go('#/profiler');
            }
          }),
          el('button', { class: 'btn btn-small', type: 'button', text: 'Avbryt', onclick: showDelete })
        )
      }));
    }
    showDelete();

    app.append(el('div', { class: 'screen' }, [
      el('header', { class: 'game-bar' }, [
        el('a', { class: 'btn btn-small', href: '#/', text: '← Hem' }),
        el('a', { class: 'btn btn-small', href: '#/profiler', text: 'Byt profil' })
      ]),
      el('header', { class: 'hub-head' }, [
        el('div', { class: 'intro-icon', text: profile.avatar }),
        el('h1', { text: profile.name + 's framsteg' })
      ]),
      el('div', { class: 'stats' }, [
        stat('⭐', totalStars, 'stjärnor'),
        stat('🎮', totalRounds, 'rundor'),
        stat('📅', lastDate ? formatDate(lastDate) : '–', 'senast spelat')
      ]),
      // Spelen grupperade per årskurs
      ...GRADES.flatMap(grade => {
        const own = games.filter(g => [].concat(g.grade)[0] === grade.id);
        if (!own.length) return [];
        return [
          el('h2', { class: 'grade-heading', text: grade.name }),
          ...own.map(g => sections[games.indexOf(g)])
        ];
      }),
      danger
    ]));
  }

  // ---------- Inställningar ----------

  function renderSettings(app) {
    const voiceList = el('div', { class: 'choice-list' });
    const rateList = el('div', { class: 'choice-list choice-row' });
    const sample = 'Hej! Så här låter jag när jag läser upp.';

    // Ett val i en lista: markeras när det är valt, med en knapp för att provlyssna
    function choice(label, sub, selected, onSelect, onTry) {
      return el('div', { class: 'choice' + (selected ? ' selected' : '') }, [
        el('button', {
          class: 'choice-pick', type: 'button', 'aria-pressed': String(selected), onclick: onSelect
        }, [
          el('span', { class: 'choice-mark', text: selected ? '●' : '○' }),
          el('span', { class: 'choice-label' }, [
            el('strong', { text: label }),
            sub ? el('span', { class: 'muted small', text: sub }) : null
          ])
        ]),
        onTry ? el('button', { class: 'btn btn-small', type: 'button', text: '▶ Prova', onclick: onTry }) : null
      ]);
    }

    function tryVoice(voice) {
      if (!canSpeak) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(sample);
      u.lang = 'sv-SE';
      if (voice) u.voice = voice;
      u.rate = store.get('rate', 0.8);
      speechSynthesis.speak(u);
    }

    // Hopfällbar instruktion med numrerade steg
    function howTo(title, steps) {
      return el('details', { class: 'how-to' }, [
        el('summary', { text: title }),
        el('ol', null, steps.map(step => el('li', { text: step })))
      ]);
    }

    function qualityName(v) {
      return ['Standard', 'Nätröst', 'Förbättrad', 'Naturlig'][voiceQuality(v)];
    }

    function drawVoices() {
      const list = swedishVoices();
      const chosen = store.get('voice', null);
      const isChosen = v => v.voiceURI === chosen;
      const auto = !list.some(isChosen);
      const select = uri => () => {
        if (uri) store.set('voice', uri);
        else store.remove('voice');
        drawVoices();
        speak(sample);
      };

      if (!canSpeak) {
        voiceList.replaceChildren(el('p', { class: 'muted', text: 'Den här webbläsaren kan inte läsa upp text.' }));
        return;
      }
      if (!list.length) {
        voiceList.replaceChildren(el('p', { class: 'muted', text: 'Hittar inga svenska röster ännu.' }));
        return;
      }
      voiceList.replaceChildren(
        choice('Automatisk', 'Bästa rösten just nu: ' + (voiceFor('sv-SE') || {}).name, auto, select(null),
          () => tryVoice(voiceFor('sv-SE'))),
        ...list.map(v => {
          // Flera röster med samma namn (vanligt i Safari) – visa det tekniska namnet så de går att skilja åt
          const twin = list.some(o => o !== v && o.name === v.name);
          const sub = qualityName(v) + (twin ? ' · ' + v.voiceURI : '');
          return choice(v.name, sub, isChosen(v), select(v.voiceURI), () => tryVoice(v));
        })
      );
    }

    function drawRates() {
      const current = store.get('rate', 0.8);
      rateList.replaceChildren(...RATES.map(r => choice(r.name, null, r.id === current, () => {
        store.set('rate', r.id);
        drawRates();
        speak(sample);
      })));
    }

    drawVoices();
    drawRates();

    // Rösterna laddas ibland in en stund efter att sidan öppnats
    if (canSpeak) {
      speechSynthesis.addEventListener('voiceschanged', drawVoices);
      cleanup = () => speechSynthesis.removeEventListener('voiceschanged', drawVoices);
    }

    app.append(el('div', { class: 'screen' }, [
      el('header', { class: 'game-bar' }, [
        el('a', { class: 'btn btn-small', href: '#/', text: '← Hem' }),
        soundToggle()
      ]),
      el('header', { class: 'hub-head' }, [
        el('div', { class: 'intro-icon', text: '⚙️' }),
        el('h1', { text: 'Inställningar' })
      ]),
      el('section', { class: 'panel' }, [
        el('h2', { text: '🗣️ Uppläsarens röst' }),
        el('p', { class: 'muted small', text:
          'Röster märkta Naturlig eller Förbättrad låter minst robotaktigt. ' +
          'Saknas en bra röst? Se hur du laddar ner fler här nedanför.' }),
        voiceList
      ]),
      el('section', { class: 'panel' }, [
        el('h2', { text: '⬇️ Ladda ner fler röster' }),
        el('p', { class: 'muted small', text:
          'Rösterna kommer från datorn eller webbläsaren. Efter nedladdningen: stäng webbläsaren helt, ' +
          'öppna Teachy igen och välj den nya rösten här ovanför.' }),
        howTo('🍎 Mac / MacBook', [
          'Klicka på äpplet uppe till vänster → Systeminställningar.',
          'Välj Hjälpmedel → Uppläst innehåll.',
          'Tryck på ⓘ bredvid Systemröst (på äldre macOS: Systemröst → Anpassa…).',
          'Välj Svenska i listan.',
          'Ladda ner Alva, Klara eller Oskar – välj gärna versionen Premium eller Förbättrad.',
          'Safari visar bara den enkla standardrösten för webbsidor. Använd Chrome eller Microsoft Edge för att få de bättre rösterna.'
        ]),
        howTo('🪟 Windows-dator', [
          'Öppna Start → Inställningar.',
          'Välj Tid och språk → Tal.',
          'Tryck på Lägg till röster vid Hantera röster.',
          'Sök efter Svenska, markera det och tryck Lägg till.',
          'Vänta tills nedladdningen är klar och starta sedan om datorn.'
        ]),
        howTo('🌐 Enklast: Microsoft Edge', [
          'Öppna Teachy i webbläsaren Microsoft Edge (finns redan på Windows och kan laddas ner till Mac).',
          'Välj Microsoft Sofie eller Mattias – Online (Natural) i listan här ovanför.',
          'Dessa röster låter mest naturligt men kräver internet.'
        ])
      ]),
      el('section', { class: 'panel' }, [
        el('h2', { text: '🐢 Hur fort läser rösten?' }),
        rateList
      ])
    ]));
  }

  // ---------- Navigering ----------

  function go(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }

  function route() {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    if (canSpeak) speechSynthesis.cancel();

    const app = document.getElementById('app');
    app.replaceChildren();
    window.scrollTo(0, 0);
    document.title = 'Teachy';

    const id = location.hash.replace(/^#\/?/, '');
    const profile = profiles.current();

    if (id === 'profiler' || !profile) {
      renderProfiles(app);
      return;
    }
    if (id === 'installningar') {
      document.title = 'Inställningar – Teachy';
      renderSettings(app);
      return;
    }
    if (id === 'framsteg') {
      document.title = 'Framsteg – Teachy';
      renderProgress(app, profile);
      return;
    }

    const game = games.find(g => g.id === id);
    if (game) {
      document.title = game.title + ' – Teachy';
      cleanup = game.mount(app, api) || null;
    } else {
      renderHub(app, profile);
    }
  }

  function start() {
    document.body.classList.toggle('muted', isMuted());
    window.addEventListener('hashchange', route);
    route();
  }

  const api = {
    el, shuffle, sample, rand, pick, speak, chime, store, confetti, profiles, progress, formatDate,
    timers, replayClass, topBar, levelScreen, roundTracker, resultScreen, isMuted, setMuted,
    toggle, accuracyReport, praise, orList, draggable, quizRound,
    picture, sortRound, orderRound, quizGame, sortGame, orderGame, inGrade, numberOptions, slot
  };

  window.Teachy = Object.assign({ registerGame, start, data: {} }, api);
})();
