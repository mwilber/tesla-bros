// Eight authored 64-step sections: roughly 65–77 seconds before the melody repeats.
// Each chord supplies a bass register and explicit intervals for the arpeggio voice.
const chords = {
  C: { root: 60, bass: 48, intervals: [0, 4, 7] },
  Am: { root: 57, bass: 45, intervals: [0, 3, 7] },
  F: { root: 65, bass: 41, intervals: [0, 4, 7] },
  G: { root: 67, bass: 43, intervals: [0, 4, 7] },
  Dm: { root: 62, bass: 50, intervals: [0, 3, 7] },
  Em: { root: 64, bass: 40, intervals: [0, 3, 7] },
};
const bassPatterns = {
  walking: [0, null, 7, null, 0, 7, 0, null],
  driving: [0, null, 12, 7, 0, null, 7, 12],
  climbing: [0, 7, 12, null, 0, 7, 12, 7],
  spacious: [0, null, null, null, 7, null, 12, null],
};
const arpeggios = {
  up: [0, 1, 2],
  down: [2, 1, 0],
  bounce: [0, 2, 1, 2],
};

export const musicSections = [
  {
    name: 'Theme',
    chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G'],
    bass: 'walking', arp: 'up', arpEvery: 2, color: 1, energy: 1,
    lead: [
      76,0,79,81,83,0,81,79,76,74,76,0,72,74,76,79,
      81,0,84,83,81,79,76,0,74,76,79,74,72,0,72,0,
      76,0,79,81,83,0,86,84,83,81,79,0,76,79,81,0,
      84,83,81,79,76,0,74,76,79,0,76,74,72,0,72,0,
    ],
  },
  {
    name: 'Answer',
    chords: ['C', 'Em', 'Am', 'F', 'Dm', 'G', 'F', 'G'],
    bass: 'driving', arp: 'down', arpEvery: 2, color: .9, energy: .95,
    lead: [
      79,0,76,74,72,0,74,76,79,83,81,79,76,0,74,0,
      76,0,81,79,76,72,71,0,72,77,76,74,72,0,69,0,
      74,0,77,81,79,77,74,0,71,74,79,0,77,74,71,0,
      69,72,77,0,76,74,72,69,71,74,79,81,79,77,74,0,
    ],
  },
  {
    name: 'Lift',
    chords: ['F', 'G', 'Em', 'Am', 'Dm', 'G', 'C', 'G'],
    bass: 'climbing', arp: 'bounce', arpEvery: 2, color: 1.2, energy: 1.05,
    lead: [
      77,79,81,0,84,81,79,77,79,81,83,0,86,83,81,79,
      79,83,86,0,88,86,83,79,81,84,88,0,86,84,83,81,
      81,0,77,74,77,81,84,0,83,81,79,77,79,83,86,0,
      88,0,86,84,83,79,76,0,79,83,86,89,86,83,79,0,
    ],
  },
  {
    name: 'Bridge',
    chords: ['Am', 'Em', 'F', 'C', 'Dm', 'Am', 'F', 'G'],
    bass: 'spacious', arp: 'down', arpEvery: 4, color: .65, energy: .8,
    lead: [
      69,0,0,72,76,0,72,0,71,0,0,67,64,0,67,0,
      69,0,72,0,77,0,76,74,72,0,0,67,64,0,67,0,
      65,0,0,69,74,0,72,0,69,0,0,64,69,0,71,72,
      77,0,76,0,72,0,69,0,71,0,74,0,79,0,81,83,
    ],
  },
  {
    name: 'Theme variation',
    chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm', 'G'],
    bass: 'driving', arp: 'bounce', arpEvery: 2, color: 1.1, energy: 1,
    lead: [
      76,79,0,81,83,86,83,79,81,0,84,83,81,76,72,0,
      77,81,0,84,86,84,81,77,79,83,81,79,77,74,71,0,
      76,0,79,84,83,79,76,74,72,76,81,84,83,81,76,0,
      77,74,77,81,84,81,77,74,79,0,83,81,79,74,71,0,
    ],
  },
  {
    name: 'Solo',
    chords: ['F', 'C', 'Dm', 'Am', 'F', 'G', 'Em', 'G'],
    bass: 'climbing', arp: 'up', arpEvery: 4, color: 1.25, energy: 1.05,
    lead: [
      81,84,89,88,86,84,81,77,79,84,88,86,84,79,76,72,
      77,81,86,84,81,77,74,0,76,81,84,88,86,84,81,76,
      77,0,81,84,89,88,86,84,83,86,89,86,83,81,79,77,
      79,83,86,88,86,83,79,76,74,77,79,83,86,83,79,0,
    ],
  },
  {
    name: 'Breakdown',
    chords: ['Am', 'F', 'C', 'G', 'Dm', 'F', 'G', 'G'],
    bass: 'spacious', arp: 'bounce', arpEvery: 4, color: .75, energy: .85,
    lead: [
      81,0,0,76,0,72,0,69,77,0,0,72,0,69,0,65,
      76,0,0,79,0,76,0,72,74,0,0,71,0,67,0,0,
      74,0,77,0,81,0,77,74,77,0,81,0,84,0,81,77,
      79,0,77,74,71,0,74,0,79,81,83,0,86,83,81,79,
    ],
  },
  {
    name: 'Finale',
    chords: ['C', 'Em', 'F', 'G', 'Am', 'Dm', 'G', 'C'],
    bass: 'driving', arp: 'down', arpEvery: 2, color: 1.15, energy: 1.05,
    lead: [
      84,0,83,79,76,79,84,0,83,86,88,86,83,79,76,0,
      81,84,89,0,88,84,81,77,79,83,86,0,89,86,83,79,
      88,0,86,84,81,84,88,0,86,84,81,77,74,77,81,0,
      83,86,89,86,83,79,77,74,76,79,84,0,79,76,72,0,
    ],
  },
].map(section => ({
  ...section,
  chords: section.chords.map(name => chords[name]),
  bass: bassPatterns[section.bass],
  arp: arpeggios[section.arp],
}));
