/*
 * Mäta – längd, vikt och volym: vilken enhet passar, och vad är störst?
 */
(function () {
  'use strict';

  Teachy.factGame({
    id: 'mata',
    title: 'Mäta',
    grade: 2,
    subject: 'Matematik',
    icon: '📏',
    color: '#4cc9f0',
    description: 'Centimeter, kilo och liter.',
    intro: 'Längd mäts i centimeter och meter, vikt i gram och kilogram, och volym i deciliter och liter.',
    hint: 'Välj rätt svar',
    reportTitle: 'Mäta',
    levels: [
      {
        name: 'Vilken enhet?', icon: '📐', sub: 'cm, m, kg, liter …',
        questions: [
          ['Hur lång är en penna? Mät i …', '✏️', 'centimeter', 'kilogram', 'liter'],
          ['Hur hög är en flaggstång? Mät i …', '🚩', 'meter', 'gram', 'deciliter'],
          ['Hur mycket väger en hund? Mät i …', '🐕', 'kilogram', 'meter', 'liter'],
          ['Hur mycket mjölk ryms i paketet? Mät i …', '🥛', 'liter', 'kilogram', 'centimeter'],
          ['Hur mycket väger ett russin? Mät i …', '🍇', 'gram', 'meter', 'liter'],
          ['Hur mycket vatten ryms i ett glas? Mät i …', '🥤', 'deciliter', 'kilogram', 'meter'],
          ['Hur lång är en myra? Mät i …', '🐜', 'millimeter', 'meter', 'kilogram'],
          ['Hur långt är det till nästa stad? Mät i …', '🛣️', 'kilometer', 'centimeter', 'liter'],
          ['Hur mycket väger en påse mjöl? Mät i …', '🛍️', 'kilogram', 'liter', 'centimeter'],
          ['Hur mycket vatten ryms i badkaret? Mät i …', '🛁', 'liter', 'gram', 'millimeter']
        ]
      },
      {
        name: 'Hur mycket är det?', icon: '⚖️', sub: '1 meter = 100 centimeter',
        questions: [
          ['Hur många centimeter är en meter?', '📏', '100', '10', '1000'],
          ['Hur många gram är ett kilogram?', '⚖️', '1000', '100', '10'],
          ['Hur många deciliter är en liter?', '🧃', '10', '100', '1000'],
          ['Hur många meter är en kilometer?', '🛣️', '1000', '100', '10'],
          ['Vad är längst?', '📏', '1 meter', '50 centimeter', '90 centimeter'],
          ['Vad väger mest?', '⚖️', '1 kilogram', '500 gram', '900 gram'],
          ['Vad rymmer mest?', '🧃', '1 liter', '5 deciliter', '8 deciliter'],
          ['Vad är kortast?', '📏', '1 centimeter', '1 meter', '1 kilometer'],
          ['Ungefär hur lång är en vuxen människa?', '🧍', '170 centimeter', '17 centimeter', '17 meter'],
          ['Ungefär hur mycket väger ett äpple?', '🍎', '200 gram', '2 kilogram', '20 kilogram']
        ]
      }
    ]
  });
})();
