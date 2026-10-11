/*
 * Ord och känslor – synonymer och ord för att beskriva hur man känner sig.
 */
(function () {
  'use strict';

  Teachy.factGame({
    id: 'ord-kanslor',
    title: 'Ord och känslor',
    grade: 3,
    subject: 'Svenska',
    icon: '😊',
    color: '#f15bb5',
    description: 'Synonymer och känsloord.',
    intro: 'Synonymer är ord som betyder ungefär samma sak, som glad och lycklig. Det finns många ord för hur man känner sig!',
    hint: 'Välj rätt ord',
    reportTitle: 'Ord',
    levels: [
      {
        name: 'Hur känner hen sig?', icon: '😢', sub: 'glad, ledsen, arg, rädd …',
        questions: [
          ['Hur känner sig någon som ser ut så här?', '😀', 'glad', 'arg', 'rädd'],
          ['Hur känner sig någon som ser ut så här?', '😢', 'ledsen', 'glad', 'stolt'],
          ['Hur känner sig någon som ser ut så här?', '😠', 'arg', 'trött', 'förvånad'],
          ['Hur känner sig någon som ser ut så här?', '😱', 'rädd', 'glad', 'lugn'],
          ['Hur känner sig någon som ser ut så här?', '😲', 'förvånad', 'ledsen', 'arg'],
          ['Hur känner sig någon som ser ut så här?', '🥱', 'trött', 'arg', 'stolt'],
          ['Ella vann loppet och fick en medalj. Hur känner hon sig?', '🏅', 'stolt', 'rädd', 'ledsen'],
          ['Omar har ingen att leka med på rasten. Hur kan han känna sig?', '🧍', 'ensam', 'stolt', 'arg'],
          ['Det är julafton i morgon! Hur känner sig barnen?', '🎄', 'förväntansfulla', 'uttråkade', 'ledsna'],
          ['Någon tog Noas boll utan att fråga. Hur känner han sig?', '⚽', 'arg', 'stolt', 'förvånad'],
          ['Maja ska sjunga för hela skolan. Hon har fjärilar i magen. Hur känner hon sig?', '🎤', 'nervös', 'trött', 'arg'],
          ['Sam sitter i soffan och har inget att göra. Hur känner han sig?', '🛋️', 'uttråkad', 'rädd', 'stolt']
        ]
      },
      {
        name: 'Synonymer', icon: '🔁', sub: 'glad – lycklig',
        questions: [
          ['Vilket ord betyder ungefär samma som glad?', '😀', 'lycklig', 'ledsen', 'trött'],
          ['Vilket ord betyder ungefär samma som stor?', '🐘', 'jättelik', 'liten', 'smal'],
          ['Vilket ord betyder ungefär samma som snabb?', '🐆', 'kvick', 'långsam', 'tung'],
          ['Vilket ord betyder ungefär samma som rädd?', '😱', 'skraj', 'modig', 'glad'],
          ['Vilket ord betyder ungefär samma som prata?', '🗣️', 'tala', 'tyst', 'skriva'],
          ['Vilket ord betyder ungefär samma som titta?', '👀', 'se', 'höra', 'lukta'],
          ['Vilket ord betyder ungefär samma som liten?', '🐭', 'pytteliten', 'enorm', 'lång'],
          ['Vilket ord betyder ungefär samma som skratta?', '😂', 'fnissa', 'gråta', 'skrika'],
          ['Vilket ord betyder ungefär samma som vacker?', '🌸', 'fin', 'ful', 'trasig'],
          ['Vilket ord betyder ungefär samma som klok?', '🦉', 'smart', 'dum', 'glömsk'],
          ['Vilket ord betyder ungefär samma som springa?', '🏃', 'rusa', 'krypa', 'sitta'],
          ['Vilket ord betyder ungefär samma som arg?', '😠', 'ilsken', 'glad', 'lugn']
        ]
      }
    ]
  });
})();
