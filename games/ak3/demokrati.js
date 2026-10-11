/*
 * Tillsammans – barns rättigheter, demokrati och att rösta.
 */
(function () {
  'use strict';

  Teachy.factGame({
    id: 'demokrati',
    title: 'Tillsammans',
    grade: 3,
    subject: 'SO',
    icon: '🤝',
    color: '#ff8a3d',
    description: 'Barns rättigheter och demokrati.',
    intro: 'Alla människor är lika mycket värda. Barnkonventionen säger vilka rättigheter alla barn har. I en demokrati får alla vara med och bestämma.',
    hint: 'Välj rätt svar',
    reportTitle: 'Tillsammans',
    levels: [
      {
        name: 'Barns rättigheter', icon: '🧒', sub: 'Barnkonventionen',
        questions: [
          ['Vad heter reglerna om vilka rättigheter alla barn har?', '📜', ['📜', 'barnkonventionen'], ['📕', 'skolboken'], ['🚦', 'trafikreglerna']],
          ['Vilka barn har rätt att gå i skolan?', '🏫', ['🌍', 'alla barn'], ['👦', 'bara pojkar'], ['💰', 'bara rika barn']],
          ['Vad har alla barn rätt till?', '🧒', ['🏠', 'ett hem och mat'], ['📱', 'en egen mobil'], ['🍬', 'godis varje dag']],
          ['Får barn säga vad de tycker?', '💬', ['✅', 'ja, och vuxna ska lyssna'], ['❌', 'nej, aldrig'], ['🤫', 'bara när de är vuxna']],
          ['Vad har alla barn rätt till när de är sjuka?', '🏥', ['🩺', 'vård'], ['📺', 'tv'], ['🎮', 'ett nytt spel']],
          ['Är alla människor lika mycket värda?', '🤝', ['✅', 'ja'], ['❌', 'nej'], ['💰', 'bara de rika']],
          ['Vilka barn har rätt att leka och vila?', '🛝', ['🌍', 'alla barn'], ['🧒', 'bara små barn'], ['🏅', 'bara de som är duktiga']]
        ]
      },
      {
        name: 'Rösta och bestämma', icon: '🗳️', sub: 'Majoriteten bestämmer',
        questions: [
          ['12 barn vill leka kull och 8 vill spela boll. Vad blir det om flest bestämmer?', '🗳️', ['🏃', 'kull'], ['⚽', 'boll'], ['🤷', 'ingenting']],
          ['Vad kallas det när flest röster bestämmer?', '✋', 'majoritetsprincipen', 'tävling', 'lotteri'],
          ['Vad är en demokrati?', '🏛️', ['🗳️', 'alla får vara med och bestämma'], ['👑', 'en person bestämmer allt'], ['🎲', 'man slår tärning']],
          ['Hur kan klassen bestämma vad den ska göra på fredag?', '🗓️', ['✋', 'rösta'], ['😠', 'den som skriker högst'], ['🙈', 'strunta i det']],
          ['Vad är yttrandefrihet?', '🗣️', ['💬', 'att man får säga vad man tycker'], ['🤐', 'att man måste vara tyst'], ['📢', 'att man får skrika']],
          ['Vad är ett klassråd?', '🏫', ['🪑', 'ett möte där eleverna bestämmer saker tillsammans'], ['📚', 'en lektion i matte'], ['🍎', 'ett mellanmål']],
          ['Om du förlorar en omröstning, vad gör du då?', '🤝', ['🙂', 'accepterar det och är med ändå'], ['😡', 'blir arg och går'], ['🙊', 'säger att det inte gäller']]
        ]
      },
      {
        name: 'Pengar och samhället', icon: '🏥', sub: 'Vem hjälper oss?',
        questions: [
          ['Vem betalar för skolan, sjukvården och brandkåren?', '🏛️', ['💰', 'alla tillsammans genom skatt'], ['🧒', 'barnen'], ['🎅', 'tomten']],
          ['Vart ringer du om det brinner?', '🔥', '112', '123', '911'],
          ['Vad kan man betala med i en affär?', '🛒', ['💳', 'kort, kontanter eller mobilen'], ['🍂', 'löv'], ['🪨', 'stenar']],
          ['Vad är dyrast?', '💰', ['🚲', 'en cykel'], ['🍦', 'en glass'], ['✏️', 'en penna']],
          ['Vilket yrke hjälper sjuka människor?', '🏥', ['🧑‍⚕️', 'läkare'], ['👨‍🍳', 'kock'], ['👷', 'byggare']],
          ['Var kan du låna böcker gratis?', '📚', ['📚', 'på biblioteket'], ['🏪', 'i affären'], ['🏦', 'på banken']]
        ]
      }
    ]
  });
})();
