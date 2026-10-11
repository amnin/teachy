/*
 * Kraft och rörelse – tyngdkraft, friktion och balans i lek och vardag.
 */
(function () {
  'use strict';

  Teachy.factGame({
    id: 'kraft',
    title: 'Kraft och rörelse',
    grade: 3,
    subject: 'NO',
    icon: '🛝',
    color: '#ff5d73',
    description: 'Tyngdkraft, friktion och balans.',
    intro: 'Tyngdkraften drar allt mot jorden. Friktion gör att saker bromsar. Balans handlar om tyngdpunkten.',
    hint: 'Välj rätt svar',
    reportTitle: 'Krafter',
    levels: [
      {
        name: 'Tyngdkraft', icon: '🍎', sub: 'Varför faller saker?',
        questions: [
          ['Varför faller äpplet ner från trädet?', '🍎', ['🌍', 'tyngdkraften drar det mot jorden'], ['💨', 'vinden blåser ner det'], ['🪲', 'äpplet vill ner']],
          ['Vad händer när du släpper en boll?', '⚽', ['⬇️', 'den faller ner'], ['⬆️', 'den flyger upp'], ['⏸️', 'den stannar i luften']],
          ['Vad gör att du kommer ner när du hoppar?', '🦘', ['🌍', 'tyngdkraften'], ['🧲', 'magneter'], ['🌬️', 'luften']],
          ['Varför åker du ner för rutschkanan?', '🛝', ['🌍', 'tyngdkraften drar dig neråt'], ['🧲', 'kanan är magnetisk'], ['💨', 'luften knuffar dig']],
          ['Vad faller fortast – en sten eller en fjäder?', '🪶', ['🪨', 'stenen'], ['🪶', 'fjädern'], ['🟰', 'de faller precis lika i luften']]
        ]
      },
      {
        name: 'Friktion', icon: '🛷', sub: 'Glida eller bromsa?',
        questions: [
          ['Var är det lättast att glida?', '⛸️', ['🧊', 'på is'], ['🟫', 'på grus'], ['🌱', 'på gräs']],
          ['Varför strör man sand på isiga vägar?', '🧂', ['🦶', 'för att det ska bli mer friktion'], ['🧹', 'för att det ser fint ut'], ['❄️', 'för att det ska bli halare']],
          ['Varför har cykeldäck mönster?', '🚲', ['🛞', 'för att greppa bättre'], ['🎨', 'för att se fina ut'], ['💨', 'för att åka snabbare i luften']],
          ['Vad bromsar en pulka som åker i snö?', '🛷', ['🤝', 'friktionen mot snön'], ['☀️', 'solen'], ['🌍', 'tyngdkraften']],
          ['Vilka skor halkar du minst med på ett halt golv?', '👟', ['👟', 'skor med gummisulor'], ['🧦', 'strumpor'], ['🩰', 'släta tofflor']]
        ]
      },
      {
        name: 'Balans', icon: '⚖️', sub: 'Gungbräda och tyngdpunkt',
        questions: [
          ['En stor och en liten sitter på en gungbräda. Var ska den stora sitta?', '⚖️', ['➡️', 'närmare mitten'], ['⬅️', 'längst ut'], ['⬆️', 'högst upp']],
          ['Hur står du stadigast?', '🧍', ['🦵', 'med fötterna isär'], ['🦩', 'på ett ben'], ['🩰', 'på tårna']],
          ['Vilket torn är svårast att välta?', '🗼', ['🔺', 'brett nertill och smalt upptill'], ['🔻', 'smalt nertill och brett upptill'], ['📏', 'långt och tunt']],
          ['Vad hjälper lindansaren att hålla balansen?', '🎪', ['🥢', 'en lång stång'], ['🎒', 'en tung ryggsäck på ena sidan'], ['🙈', 'att blunda']]
        ]
      }
    ]
  });
})();
