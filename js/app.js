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

  const games = [];
  let cleanup = null;

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

  // ---------- Tal (svensk röst) ----------

  const canSpeak = 'speechSynthesis' in window;
  let voice = null;

  function loadVoice() {
    const voices = speechSynthesis.getVoices();
    voice = voices.find(v => /^sv/i.test(v.lang)) || null;
  }

  if (canSpeak) {
    loadVoice();
    speechSynthesis.onvoiceschanged = loadVoice;
  }

  function speak(text) {
    if (!canSpeak || isMuted()) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'sv-SE';
    if (voice) u.voice = voice;
    u.rate = 0.8;
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
        el('button', { class: 'btn btn-listen', type: 'button', text: '🔊 Lyssna', onclick: () => speak(view.say) })
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
      timer.later(() => speak(view.say), 400);
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
        timer.later(() => speak(view.praise || praise()), 350);
        timer.later(next, 2400);
      } else {
        mistakes++;
        chime('wrong');
        replayClass(tile, 'wrong');
        tile.disabled = true;
        if (view.onWrong) view.onWrong();
        timer.later(() => speak(view.say), 350);

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

    const gradeGames = games.filter(g => g.grade === grade);
    if (!gradeGames.length) {
      app.append(el('div', { class: 'empty-grade' }, [
        el('div', { class: 'intro-icon', text: '🚧' }),
        el('p', { text: 'Här kommer det snart spel!' })
      ]));
      return;
    }

    const subjects = [...new Set(gradeGames.map(g => g.subject))];
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
        const own = games.filter(g => g.grade === grade.id);
        if (!own.length) return [];
        return [
          el('h2', { class: 'grade-heading', text: grade.name }),
          ...own.map(g => sections[games.indexOf(g)])
        ];
      }),
      danger
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
    el, shuffle, sample, speak, chime, store, confetti, profiles, progress, formatDate,
    timers, replayClass, topBar, levelScreen, roundTracker, resultScreen, isMuted, setMuted,
    toggle, accuracyReport, praise, orList, draggable, quizRound
  };

  window.Teachy = Object.assign({ registerGame, start, data: {} }, api);
})();
