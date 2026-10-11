/*
 * Rymden – solsystemet, och hur jorden och månen ger dygn, månader och år.
 */
(function () {
  'use strict';

  Teachy.factGame({
    id: 'rymden',
    title: 'Rymden',
    grade: 3,
    subject: 'NO',
    icon: '🪐',
    color: '#3a2a80',
    description: 'Solen, planeterna och månen.',
    intro: 'Jorden snurrar runt sig själv på ett dygn och går runt solen på ett år. Månen går runt jorden på ungefär en månad.',
    hint: 'Välj rätt svar',
    reportTitle: 'Rymden',
    levels: [
      {
        name: 'Dag, natt och år', icon: '🌍', sub: 'Varför blir det natt?',
        questions: [
          ['Varför blir det natt?', '🌙', ['🌍', 'Jorden snurrar, så vår sida vänds bort från solen'], ['☀️', 'Solen slocknar'], ['☁️', 'Molnen täcker solen']],
          ['Hur lång tid tar det för jorden att snurra ett varv runt sig själv?', '🌍', ['🕛', 'ett dygn'], ['📅', 'ett år'], ['🗓️', 'en vecka']],
          ['Hur lång tid tar det för jorden att gå ett varv runt solen?', '☀️', ['📅', 'ett år'], ['🕛', 'ett dygn'], ['🗓️', 'en månad']],
          ['Vad går runt jorden?', '🌍', ['🌙', 'månen'], ['☀️', 'solen'], ['⭐', 'stjärnorna']],
          ['Varför ser månen olika ut olika kvällar?', '🌓', ['🌗', 'Solen lyser på olika delar av den'], ['🍰', 'Någon äter upp den'], ['☁️', 'Den gömmer sig i moln']],
          ['Vad är solen?', '☀️', ['⭐', 'en stjärna'], ['🪐', 'en planet'], ['🌙', 'en måne']],
          ['Varifrån kommer månens ljus?', '🌕', ['☀️', 'från solen'], ['💡', 'den lyser själv'], ['⭐', 'från stjärnorna']],
          ['Hur många dygn har ett år ungefär?', '📅', '365', '100', '30']
        ]
      },
      {
        name: 'Planeterna', icon: '🪐', sub: 'Merkurius, Venus, Jorden …',
        questions: [
          ['Vilken planet ligger närmast solen?', '☀️', 'Merkurius', 'Jorden', 'Neptunus'],
          ['Vilken planet bor vi på?', '🌍', 'Jorden', 'Mars', 'Venus'],
          ['Vilken planet kallas den röda planeten?', '🔴', 'Mars', 'Jupiter', 'Uranus'],
          ['Vilken är den största planeten?', '🟠', 'Jupiter', 'Merkurius', 'Mars'],
          ['Vilken planet har stora ringar runt sig?', '🪐', 'Saturnus', 'Jorden', 'Venus'],
          ['Vilken planet ligger längst bort från solen?', '🔵', 'Neptunus', 'Mars', 'Venus'],
          ['Hur många planeter finns det i vårt solsystem?', '🪐', '8', '3', '20'],
          ['Vilken planet ligger mellan Venus och Mars?', '🌍', 'Jorden', 'Saturnus', 'Merkurius']
        ]
      },
      {
        name: 'Människan i rymden', icon: '🚀', sub: 'Astronauter och raketer',
        questions: [
          ['Vad kallas en person som reser ut i rymden?', '👩‍🚀', 'astronaut', 'pilot', 'kapten'],
          ['Vad åker man ut i rymden med?', '🚀', 'raket', 'flygplan', 'luftballong'],
          ['Var har människor gått på en annan himlakropp?', '🌕', 'på månen', 'på solen', 'på Mars'],
          ['Varför svävar astronauterna i rymdstationen?', '🛰️', 'De känner ingen tyngdkraft', 'De är jättelätta', 'De har vingar'],
          ['Vad behöver astronauter ha med sig för att andas?', '🫁', 'syre', 'sand', 'vatten'],
          ['Vad heter dragningskraften som får saker att falla mot jorden?', '🍎', 'tyngdkraft', 'friktion', 'magnetism']
        ]
      }
    ]
  });
})();
