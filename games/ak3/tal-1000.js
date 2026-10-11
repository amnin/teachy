/*
 * Talen till 1000 – hundratal, tiotal och ental, och talens ordning.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const LEVELS = [
    { name: 'Hundratal, tiotal, ental', icon: '🧮', sub: 'Vad är värdet av 4:an i 347?', kind: 'value' },
    { name: 'Bygg talet', icon: '🧱', sub: '3 hundratal + 4 tiotal + 7 ental', kind: 'build' },
    { name: 'Före och efter', icon: '↔️', sub: 'Vilket tal kommer efter 399?', kind: 'next' },
    { name: 'Störst och minst', icon: '🦅', sub: 'Vilket tal är störst?', kind: 'compare' }
  ];

  const PLACES = ['hundratal', 'tiotal', 'ental'];
  const VALUE = [100, 10, 1];

  // Talet som hundratalsplattor, tiotalsstavar och entalskuber
  function blocks(n) {
    const [h, t, e] = String(n).padStart(3, '0').split('').map(Number);
    return el('div', { class: 'blocks' }, [
      el('span', { class: 'blocks-h', text: '🟥'.repeat(h) }),
      el('span', { class: 'blocks-t', text: '🟦'.repeat(t) }),
      el('span', { class: 'blocks-e', text: '🟨'.repeat(e) })
    ]);
  }

  function makeTask(kind) {
    if (kind === 'value') {
      const n = T.rand(111, 999);
      const digits = String(n).split('');
      const pos = T.rand(0, 2);
      if (digits[pos] === '0') return makeTask(kind);
      return { kind, n, pos, answer: Number(digits[pos]) * VALUE[pos] };
    }
    if (kind === 'build') {
      const n = T.rand(101, 999);
      return { kind, n, answer: n };
    }
    if (kind === 'next') {
      const round = T.pick([10, 100]);
      const after = Math.random() < 0.6;
      // Efter: tal som slutar på 9 (399 → 400). Före: jämna tal (400 → 399).
      const n = T.rand(1, 9) * round + (round === 10 ? T.rand(1, 89) * 10 : 0) - (after ? 1 : 0);
      if (n < 10 || n > 998) return makeTask(kind);
      return { kind, n, after, answer: after ? n + 1 : n - 1 };
    }
    const base = T.rand(100, 900);
    const list = T.shuffle([base, base + T.rand(1, 9) * 10, base + T.rand(1, 9) * 100, base + T.rand(1, 9)])
      .filter(x => x < 1000).slice(0, 3);
    if (new Set(list).size < 3) return makeTask(kind);
    const largest = Math.random() < 0.5;
    return { kind, list, largest, answer: largest ? Math.max(...list) : Math.min(...list) };
  }

  T.quizGame({
    id: 'tal-1000',
    title: 'Talen till 1000',
    grade: 3,
    subject: 'Matematik',
    icon: '🔢',
    color: '#2bb673',
    description: 'Hundratal, tiotal och ental.',
    intro: 'I talet 347 är 3 hundratal, 4 tiotal och 7 ental. Siffrans plats bestämmer hur mycket den är värd!',
    hint: 'Välj rätt tal',
    levels: LEVELS,
    makeTasks: (level, n) => Array.from({ length: n }, () => makeTask(level.kind)),
    report: { title: 'Talen', keys: LEVELS.map(l => l.name) },
    render: (task, level) => {
      let prompt, say, praise, choices;
      const nums = (answer, extra) => T.numberOptions(answer, 4, 0, 999, extra);
      if (task.kind === 'value') {
        const digits = String(task.n).split('');
        prompt = el('div', { class: 'read-sentence big-math' }, digits.map((d, i) =>
          el('span', { class: i === task.pos ? 'digit-mark' : null, text: d })));
        say = 'Vad är värdet av siffran ' + digits[task.pos] + ' i ' + task.n + '?';
        praise = digits[task.pos] + ' ' + PLACES[task.pos] + ' är ' + task.answer + '!';
        choices = nums(task.answer, [Number(digits[task.pos]), Number(digits[task.pos]) * 10, Number(digits[task.pos]) * 100]);
      } else if (task.kind === 'build') {
        const [h, t, e] = String(task.n).split('');
        prompt = el('div', { class: 'fact-task' }, [blocks(task.n),
          el('p', { class: 'read-sentence', text: h + ' hundratal, ' + t + ' tiotal och ' + e + ' ental' })]);
        say = h + ' hundratal, ' + t + ' tiotal och ' + e + ' ental. Vilket tal är det?';
        praise = 'Det är ' + task.n + '!';
        choices = nums(task.answer, [Number(e + t + h), Number(h + e + t), task.n + 10, task.n - 100]);
      } else if (task.kind === 'next') {
        const word = task.after ? 'efter' : 'före';
        prompt = el('p', { class: 'read-sentence big-math', text: task.after ? task.n + ', ?' : '?, ' + task.n });
        say = 'Vilket tal kommer ' + word + ' ' + task.n + '?';
        praise = task.answer + ' kommer ' + word + ' ' + task.n + '!';
        choices = nums(task.answer, [task.answer + 10, task.answer - 10, task.answer + 100, task.n + (task.after ? 10 : -10)]);
      } else {
        const word = task.largest ? 'störst' : 'minst';
        prompt = el('p', { class: 'read-sentence', text: 'Vilket tal är ' + word + '?' });
        say = 'Vilket tal är ' + word + '? ' + T.orList(task.list.map(String)) + '?';
        praise = task.answer + ' är ' + word + '!';
        choices = task.list.map(n => ({ label: String(n), correct: n === task.answer, content: el('span', { class: 'tile-up', text: n }) }));
      }
      return { prompt, say, praise, item: level.name, choiceClass: 'num-tile big-num', choices };
    }
  });
})();
