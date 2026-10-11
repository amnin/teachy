/*
 * Pengar – räkna svenska mynt och sedlar, och räkna ut växel.
 */
(function () {
  'use strict';

  const T = Teachy;
  const el = T.el;

  const COINS = [1, 2, 5, 10];
  const NOTES = [20, 50, 100];

  const THINGS = [['🍦', 'glassen'], ['⚽', 'bollen'], ['📕', 'boken'], ['🧸', 'nallen'], ['🍫', 'chokladen'],
    ['🎈', 'ballongen'], ['🖍️', 'kritorna'], ['🧃', 'saften'], ['🪀', 'jojon'], ['🦖', 'leksaksdinosaurien']];

  const LEVELS = [
    { name: 'Mynt', icon: '🪙', sub: 'Upp till 20 kronor', kind: 'count', values: COINS, max: 20, count: [2, 5] },
    { name: 'Mynt och sedlar', icon: '💵', sub: 'Upp till 100 kronor', kind: 'count', values: COINS.concat([20, 50]), max: 100, count: [2, 5] },
    { name: 'Växel', icon: '🛒', sub: 'Hur mycket får du tillbaka?', kind: 'change' }
  ];

  function money(value) {
    return value >= 20
      ? el('span', { class: 'note note-' + value, text: value + ' kr' })
      : el('span', { class: 'coin coin-' + value, text: value });
  }

  function makeCount(level) {
    for (;;) {
      const n = T.rand(level.count[0], level.count[1]);
      const list = Array.from({ length: n }, () => T.pick(level.values)).sort((a, b) => b - a);
      const sum = list.reduce((a, b) => a + b, 0);
      if (sum <= level.max) return { kind: 'count', list, answer: sum };
    }
  }

  function makeChange() {
    const pay = T.pick([20, 50, 100]);
    const price = T.rand(Math.max(5, pay / 2), pay - 1);
    const [emoji, name] = T.pick(THINGS);
    return { kind: 'change', pay, price, emoji, name, answer: pay - price };
  }

  T.quizGame({
    id: 'pengar',
    title: 'Pengar',
    grade: 2,
    subject: 'Matematik',
    icon: '🪙',
    color: '#f5a300',
    description: 'Räkna mynt och sedlar.',
    intro: 'I Sverige finns mynt på 1, 2, 5 och 10 kronor och sedlar på 20, 50, 100 och fler. Börja räkna med de största!',
    hint: 'Hur mycket är det?',
    levels: LEVELS,
    makeTasks: (level, n) => Array.from({ length: n }, () => (level.kind === 'change' ? makeChange() : makeCount(level))),
    report: { title: 'Pengar', keys: LEVELS.map(l => l.name) },
    render: (task, level) => {
      if (task.kind === 'change') {
        const question = 'Hur mycket får du tillbaka?';
        return {
          prompt: el('div', { class: 'fact-task' }, [
            el('div', { class: 'price-tag' }, [el('span', { class: 'fact-picture', text: task.emoji }), el('strong', { text: task.price + ' kr' })]),
            el('div', { class: 'money' }, [el('span', { class: 'muted', text: 'Du betalar:' }), money(task.pay)]),
            el('p', { class: 'read-sentence', text: 'Hur mycket får du tillbaka?' })
          ]),
          say: 'Det kostar ' + task.price + ' kronor. Du betalar med ' + task.pay + ' kronor. ' + question,
          praise: task.pay + ' minus ' + task.price + ' är ' + task.answer + '. Du får ' + task.answer + ' kronor tillbaka!',
          item: level.name,
          choiceClass: 'num-tile',
          choices: T.numberOptions(task.answer, 4, 1, 100, [task.answer + 10, task.answer - 10, task.price])
        };
      }
      return {
        prompt: el('div', { class: 'fact-task' }, [
          el('div', { class: 'money' }, task.list.map(money)),
          el('p', { class: 'read-sentence', text: 'Hur många kronor är det?' })
        ]),
        say: 'Hur många kronor är det?',
        praise: 'Det är ' + task.answer + ' kronor!',
        item: level.name,
        choiceClass: 'num-tile',
        choices: T.numberOptions(task.answer, 4, 1, level.max + 10, [task.answer + 1, task.answer - 1, task.list.length])
      };
    }
  });
})();
