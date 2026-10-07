/*
 * Läs diagrammet – enkla stapeldiagram där varje ruta är en röst.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;
  const MAX = 8;

  const TOPICS = [
    { title: 'Klassens favoritfrukt', things: [['🍎', 'äpple'], ['🍌', 'banan'], ['🍓', 'jordgubbe'], ['🍇', 'vindruvor']] },
    { title: 'Klassens favoritdjur', things: [['🐶', 'hund'], ['🐱', 'katt'], ['🐰', 'kanin'], ['🐴', 'häst']] },
    { title: 'Vädret i september', things: [['☀️', 'sol'], ['🌧️', 'regn'], ['☁️', 'moln'], ['🌬️', 'blåst']] },
    { title: 'Hur vi kommer till skolan', things: [['🚶', 'går'], ['🚲', 'cyklar'], ['🚗', 'bil'], ['🚌', 'buss']] }
  ];

  const LEVELS = [
    { key: 'Flest och färst', name: 'Flest och färst', icon: '🏆', sub: 'Vilken har flest?' },
    { key: 'Hur många', name: 'Hur många?', icon: '🔢', sub: 'Läs av diagrammet' },
    { key: 'Jämför', name: 'Hur många fler?', icon: '🦅', sub: 'Jämför två staplar' }
  ];

  // Värden 1–MAX där alla är olika, så att flest/färst blir entydigt
  function makeData() {
    const topic = T.pick(TOPICS);
    const values = T.sample(Array.from({ length: MAX }, (_, i) => i + 1), topic.things.length);
    return { topic, rows: topic.things.map(([emoji, name], i) => ({ emoji, name, value: values[i] })) };
  }

  function chart(data) {
    const rows = data.rows;
    const grid = el('div', { class: 'chart', style: '--bars:' + rows.length + ';--max:' + MAX });
    // Axel med siffror till vänster, sedan en kolumn per stapel
    for (let level = MAX; level >= 1; level--) {
      grid.append(el('span', { class: 'chart-axis', text: level }));
      rows.forEach(r => grid.append(el('span', { class: 'chart-cell' + (r.value >= level ? ' filled' : '') })));
    }
    grid.append(el('span', { class: 'chart-axis', text: '' }));
    rows.forEach(r => grid.append(el('span', { class: 'chart-label', text: r.emoji })));
    return el('div', { class: 'chart-box' }, [el('div', { class: 'chart-title', text: data.topic.title }), grid]);
  }

  function makeTask(level) {
    const data = makeData();
    const sorted = data.rows.slice().sort((a, b) => b.value - a.value);
    if (level.key === 'Flest och färst') {
      const most = Math.random() < 0.5;
      const answer = most ? sorted[0] : sorted[sorted.length - 1];
      return { data, kind: 'pick', answer, question: most ? 'Vilken har flest?' : 'Vilken har färst?' };
    }
    if (level.key === 'Hur många') {
      const row = T.pick(data.rows);
      return { data, kind: 'number', answer: row.value, row, question: 'Hur många har ' + row.emoji + '?', spoken: 'Hur många röster har ' + row.name + '?' };
    }
    const [a, b] = T.sample(data.rows, 2).sort((x, y) => y.value - x.value);
    return { data, kind: 'number', answer: a.value - b.value, row: a,
      question: 'Hur många fler har ' + a.emoji + ' än ' + b.emoji + '?',
      spoken: 'Hur många fler röster har ' + a.name + ' än ' + b.name + '?', extra: [a.value, b.value] };
  }

  T.quizGame({
    id: 'diagram',
    title: 'Läs diagrammet',
    grade: 1,
    subject: 'Matematik',
    icon: '📊',
    color: '#06a77d',
    description: 'Flest, färst och hur många?',
    intro: 'I diagrammet är varje ruta en röst. Räkna rutorna eller titta på siffrorna till vänster!',
    hint: 'Titta i diagrammet',
    levels: LEVELS,
    makeTasks: (level, n) => Array.from({ length: n }, () => makeTask(level)),
    report: { title: 'Diagram', keys: LEVELS.map(l => l.key) },
    render: (task, level) => {
      const view = {
        prompt: el('div', { class: 'chart-task' }, [chart(task.data), el('p', { class: 'read-sentence', text: task.question })]),
        say: task.spoken || task.question,
        item: level.key
      };
      if (task.kind === 'pick') {
        return Object.assign(view, {
          praise: task.answer.name + ' har ' + task.answer.value + '!',
          choiceClass: 'emoji-tile',
          choices: task.data.rows.map(r => ({
            label: r.name,
            correct: r === task.answer,
            content: el('span', { class: 'tile-emoji', text: r.emoji })
          }))
        });
      }
      return Object.assign(view, {
        praise: 'Ja, ' + task.answer + '!',
        choiceClass: 'num-tile',
        choices: T.numberOptions(task.answer, 4, 0, MAX, task.extra || [])
      });
    }
  });
})();
