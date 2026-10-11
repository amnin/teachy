/*
 * Världen – världsdelar, världshav och länder.
 */
(function () {
  'use strict';

  const PARTS = ['Europa', 'Asien', 'Afrika', 'Nordamerika', 'Sydamerika', 'Oceanien', 'Antarktis'];
  const others = right => PARTS.filter(p => p !== right);

  // [fråga, bild, rätt världsdel]
  const ANIMALS = [
    ['Var lever kängurun?', '🦘', 'Oceanien'], ['Var lever pandan?', '🐼', 'Asien'], ['Var lever giraffen vilt?', '🦒', 'Afrika'],
    ['Var lever pingvinerna?', '🐧', 'Antarktis'], ['Var lever lamadjuret?', '🦙', 'Sydamerika'], ['Var lever älgen?', '🫎', 'Europa'],
    ['Var lever zebran?', '🦓', 'Afrika'], ['Var lever koalan?', '🐨', 'Oceanien'], ['Var lever bisonoxen?', '🦬', 'Nordamerika']
  ];
  const COUNTRIES = [
    ['I vilken världsdel ligger Sverige?', '🇸🇪', 'Europa'], ['I vilken världsdel ligger Kina?', '🇨🇳', 'Asien'],
    ['I vilken världsdel ligger Egypten?', '🇪🇬', 'Afrika'], ['I vilken världsdel ligger USA?', '🇺🇸', 'Nordamerika'],
    ['I vilken världsdel ligger Brasilien?', '🇧🇷', 'Sydamerika'], ['I vilken världsdel ligger Australien?', '🇦🇺', 'Oceanien'],
    ['I vilken världsdel ligger Japan?', '🇯🇵', 'Asien'], ['I vilken världsdel ligger Kenya?', '🇰🇪', 'Afrika'],
    ['I vilken världsdel ligger Spanien?', '🇪🇸', 'Europa'], ['I vilken världsdel ligger Kanada?', '🇨🇦', 'Nordamerika'],
    ['I vilken världsdel ligger Indien?', '🇮🇳', 'Asien']
  ];

  const toQuestions = list => list.map(([q, emoji, right]) => [q, emoji, right, ...others(right)]);

  Teachy.factGame({
    id: 'varlden',
    title: 'Världen',
    grade: 3,
    subject: 'SO',
    icon: '🌍',
    color: '#2bb673',
    description: 'Världsdelar, världshav och länder.',
    intro: 'Jorden har sju världsdelar: Europa, Asien, Afrika, Nordamerika, Sydamerika, Oceanien och Antarktis. Sverige ligger i Europa.',
    hint: 'Välj rätt svar',
    reportTitle: 'Världen',
    levels: [
      { name: 'Djur i världen', icon: '🦘', sub: 'Var lever kängurun?', questions: toQuestions(ANIMALS) },
      { name: 'Länder', icon: '🗺️', sub: 'Var ligger Kina?', questions: toQuestions(COUNTRIES), choices: 4 },
      {
        name: 'Världen runt', icon: '🌊', sub: 'Världshav och världsdelar',
        questions: [
          ['Hur många världsdelar finns det?', '🌍', '7', '3', '12'],
          ['Vilken är den största världsdelen?', '🌏', 'Asien', 'Europa', 'Oceanien'],
          ['Vilken världsdel är täckt av is?', '🧊', 'Antarktis', 'Afrika', 'Europa'],
          ['Vilket är det största världshavet?', '🌊', 'Stilla havet', 'Östersjön', 'Atlanten'],
          ['Vilket hav ligger mellan Europa och Amerika?', '🚢', 'Atlanten', 'Stilla havet', 'Indiska oceanen'],
          ['Vilket hav ligger vid Sveriges östkust?', '⛵', 'Östersjön', 'Stilla havet', 'Indiska oceanen'],
          ['Vad visar en jordglob?', '🌐', 'hela jorden', 'bara Sverige', 'rymden'],
          ['Vilket väderstreck pekar uppåt på en karta?', '🧭', 'norr', 'söder', 'väster']
        ]
      }
    ]
  });
})();
