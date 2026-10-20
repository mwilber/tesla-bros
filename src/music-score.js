// Four distinct scores, each with eight authored 64-step sections.
// Lead: MIDI note, 0 = rest, -1 = hold the preceding note for another step.
// Each chord supplies a bass register and explicit intervals for the arpeggio voice.
const chords = {
  C: { root: 60, bass: 48, intervals: [0, 4, 7] },
  Am: { root: 57, bass: 45, intervals: [0, 3, 7] },
  F: { root: 65, bass: 41, intervals: [0, 4, 7] },
  G: { root: 67, bass: 43, intervals: [0, 4, 7] },
  Dm: { root: 62, bass: 50, intervals: [0, 3, 7] },
  Em: { root: 64, bass: 40, intervals: [0, 3, 7] },
  Bb: { root: 58, bass: 46, intervals: [0, 4, 7] },
  Gm: { root: 55, bass: 43, intervals: [0, 3, 7] },
  A: { root: 57, bass: 45, intervals: [0, 4, 7] },
  D: { root: 62, bass: 38, intervals: [0, 4, 7] },
  B7: { root: 59, bass: 47, intervals: [0, 4, 7, 10] },
  Fsdim: { root: 66, bass: 42, intervals: [0, 3, 6] },
  Fmaj7: { root: 65, bass: 41, intervals: [0, 4, 7, 11] },
  Cmaj7: { root: 60, bass: 48, intervals: [0, 4, 7, 11] },
  Bbmaj7: { root: 58, bass: 46, intervals: [0, 4, 7, 11] },
  Dm7: { root: 62, bass: 50, intervals: [0, 3, 7, 10] },
  Gm7: { root: 55, bass: 43, intervals: [0, 3, 7, 10] },
  Cadd9: { root: 60, bass: 48, intervals: [0, 4, 7, 14] },
};
const bassPatterns = {
  walking: [0, null, 7, null, 0, 7, 0, null],
  driving: [0, null, 12, 7, 0, null, 7, 12],
  climbing: [0, 7, 12, null, 0, 7, 12, 7],
  spacious: [0, null, null, null, 7, null, 12, null],
  creeping: [0, null, null, 0, null, 7, null, null],
  circuit: [0, null, 12, null, null, 7, 0, null],
  floating: [0, null, null, 7, null, null, 12, null],
  rolling: [0, null, 7, null, 12, null, 7, null],
  march: [0, 0, null, 7, 0, null, 12, 7],
  engine: [0, null, 0, 12, null, 0, 7, 0],
};
const arpeggios = {
  up: [0, 1, 2],
  down: [2, 1, 0],
  bounce: [0, 2, 1, 2],
  shimmer: [0, 2, 3, 1],
  falling: [3, 2, 1, 2],
  jagged: [0, 2, 0, 1],
};

const greenlineSections = [
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
];

// D minor: short questioning motifs, low pulses, and isolated crystal-like replies.
const gridSections = [
  {
    name: 'Below the surface',
    chords: ['Dm', 'Dm', 'Bb', 'A', 'Gm', 'Dm', 'A', 'Dm'],
    bass: 'creeping', arp: 'down', arpEvery: 4, color: .9, energy: .95,
    lead: [
      62,0,65,64,0,62,0,57,62,0,0,69,0,65,64,0,
      65,0,62,0,58,0,62,65,64,0,61,0,57,0,0,61,
      62,0,67,65,0,62,0,58,65,0,64,62,0,57,0,0,
      61,0,64,0,69,67,64,61,62,-1,0,57,62,0,0,0,
    ],
  },
  {
    name: 'Crystal signals',
    chords: ['Bb', 'Gm', 'Dm', 'A', 'Bb', 'Gm', 'A', 'Dm'],
    bass: 'spacious', arp: 'up', arpEvery: 8, color: 1.15, energy: .8,
    lead: [
      74,-1,0,0,77,0,74,0,79,0,0,74,70,0,0,0,
      77,-1,0,74,0,69,0,0,76,0,73,0,69,-1,0,0,
      77,0,74,0,70,0,74,0,79,-1,0,77,74,0,70,0,
      73,0,76,0,81,0,79,76,74,-1,-1,0,0,0,0,0,
    ],
  },
  {
    name: 'Buried circuitry',
    chords: ['Dm', 'C', 'Bb', 'A', 'Dm', 'Gm', 'Bb', 'A'],
    bass: 'circuit', arp: 'jagged', arpEvery: 4, color: 1.05, energy: 1,
    lead: [
      62,65,0,62,69,0,65,64,60,64,0,60,67,0,64,62,
      58,62,0,58,65,0,62,60,61,64,0,61,69,0,67,64,
      65,0,69,0,74,72,69,65,67,0,70,69,0,67,65,62,
      65,0,62,65,70,0,69,65,64,61,0,57,61,64,69,0,
    ],
  },
  {
    name: 'Deep chamber',
    chords: ['Gm', 'Bb', 'Dm', 'Dm', 'Gm', 'C', 'Bb', 'A'],
    bass: 'creeping', arp: 'down', arpEvery: 8, color: .65, energy: .75,
    lead: [
      67,-1,0,0,62,0,58,0,65,-1,0,62,58,-1,0,0,
      64,65,62,-1,0,0,57,0,62,-1,-1,0,0,0,0,0,
      58,0,62,-1,67,0,65,0,64,-1,0,60,67,-1,0,0,
      65,0,62,0,58,-1,0,0,61,0,64,0,69,-1,0,0,
    ],
  },
  {
    name: 'Pressure rising',
    chords: ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'C', 'Bb', 'A'],
    bass: 'circuit', arp: 'bounce', arpEvery: 2, color: 1.2, energy: 1.05,
    lead: [
      74,0,69,72,74,0,77,76,74,0,70,74,77,0,74,70,
      74,0,79,77,74,70,67,0,73,0,76,79,81,0,79,76,
      77,76,74,0,69,74,77,0,76,0,72,67,72,76,79,0,
      77,0,74,70,74,77,82,0,81,79,76,73,69,0,73,0,
    ],
  },
  {
    name: 'Echo passage',
    chords: ['Bb', 'C', 'Dm', 'A', 'Gm', 'Bb', 'A', 'Dm'],
    bass: 'spacious', arp: 'up', arpEvery: 4, color: .85, energy: .85,
    lead: [
      70,74,77,0,0,70,0,0,72,76,79,0,0,72,0,0,
      69,74,77,0,0,69,0,0,69,73,76,0,0,64,0,0,
      67,70,74,0,77,0,74,0,65,70,74,0,77,0,74,0,
      73,76,81,0,79,76,73,0,74,-1,0,69,65,0,62,0,
    ],
  },
  {
    name: 'Power conduit',
    chords: ['Dm', 'Dm', 'C', 'Bb', 'Gm', 'Dm', 'Bb', 'A'],
    bass: 'circuit', arp: 'jagged', arpEvery: 2, color: 1.15, energy: 1,
    lead: [
      62,0,69,65,62,0,65,69,74,0,72,69,65,64,62,0,
      64,0,67,72,76,0,72,67,65,0,70,74,77,0,74,70,
      67,70,74,0,79,77,74,70,69,65,62,0,65,69,74,0,
      77,74,70,0,74,77,82,0,81,79,76,73,69,67,64,61,
    ],
  },
  {
    name: 'Hidden exit',
    chords: ['Gm', 'Bb', 'C', 'A', 'Dm', 'Gm', 'A', 'Dm'],
    bass: 'creeping', arp: 'down', arpEvery: 4, color: .95, energy: .9,
    lead: [
      74,0,70,67,0,62,0,0,77,0,74,70,0,65,0,0,
      76,0,72,67,0,64,0,0,73,0,69,64,0,61,0,0,
      62,65,69,74,0,77,76,74,70,67,62,0,67,70,74,0,
      73,0,76,79,81,79,76,73,74,-1,0,69,65,0,62,0,
    ],
  },
];

// F major: long, arching phrases and suspended/seventh colors for the sunset sky.
const skywaySections = [
  {
    name: 'Golden horizon',
    chords: ['Fmaj7', 'Cmaj7', 'Dm7', 'Bbmaj7', 'Gm7', 'Cadd9', 'Fmaj7', 'Cadd9'],
    bass: 'floating', arp: 'shimmer', arpEvery: 4, color: 1, energy: .95,
    lead: [
      77,-1,81,84,88,-1,84,81,79,-1,-1,76,74,76,79,0,
      81,-1,77,74,76,77,81,-1,82,-1,-1,81,77,-1,74,0,
      79,-1,77,74,70,-1,74,77,79,-1,86,-1,84,79,76,0,
      81,-1,84,88,89,-1,88,84,86,-1,84,79,76,-1,74,0,
    ],
  },
  {
    name: 'Cloud ribbons',
    chords: ['Bbmaj7', 'Fmaj7', 'Gm7', 'Cadd9', 'Dm7', 'Bbmaj7', 'Cmaj7', 'Fmaj7'],
    bass: 'rolling', arp: 'falling', arpEvery: 4, color: 1.1, energy: 1,
    lead: [
      82,81,77,-1,74,-1,77,81,84,81,77,-1,76,-1,77,0,
      79,77,74,-1,70,-1,74,77,79,84,86,-1,84,-1,79,0,
      81,84,86,-1,89,88,86,81,82,86,89,-1,86,-1,82,0,
      83,86,88,-1,86,84,79,76,81,84,89,-1,-1,88,84,0,
    ],
  },
  {
    name: 'Updraft',
    chords: ['Gm7', 'Cadd9', 'Fmaj7', 'Bbmaj7', 'Dm7', 'Gm7', 'Cadd9', 'Fmaj7'],
    bass: 'climbing', arp: 'shimmer', arpEvery: 2, color: 1.2, energy: 1.05,
    lead: [
      74,77,79,-1,82,86,89,0,76,79,84,-1,86,88,91,0,
      81,84,88,-1,89,88,84,81,82,86,89,-1,93,89,86,82,
      86,89,93,-1,89,86,84,81,86,89,91,-1,89,86,82,79,
      88,86,84,79,76,-1,79,84,89,-1,-1,88,84,-1,81,0,
    ],
  },
  {
    name: 'Sunset drift',
    chords: ['Dm7', 'Bbmaj7', 'Fmaj7', 'Cmaj7', 'Gm7', 'Bbmaj7', 'Cadd9', 'Cadd9'],
    bass: 'floating', arp: 'falling', arpEvery: 8, color: .75, energy: .78,
    lead: [
      77,-1,-1,0,74,-1,72,0,74,-1,-1,0,70,-1,69,0,
      72,-1,-1,0,69,-1,65,0,67,-1,71,-1,72,-1,-1,0,
      70,-1,-1,74,77,-1,74,0,74,-1,77,-1,81,-1,77,0,
      76,-1,-1,79,84,-1,86,0,84,-1,79,-1,76,-1,74,0,
    ],
  },
  {
    name: 'Open sky',
    chords: ['Fmaj7', 'Dm7', 'Bbmaj7', 'Cadd9', 'Fmaj7', 'Gm7', 'Bbmaj7', 'Cmaj7'],
    bass: 'rolling', arp: 'shimmer', arpEvery: 4, color: 1.1, energy: 1,
    lead: [
      89,-1,88,84,81,-1,84,88,86,-1,84,81,77,-1,81,84,
      82,-1,86,89,93,-1,89,86,88,-1,86,84,79,-1,76,0,
      77,81,84,-1,88,89,88,84,79,82,86,-1,89,86,82,79,
      77,81,82,-1,86,89,86,82,83,86,88,-1,91,-1,88,0,
    ],
  },
  {
    name: 'Silver wings',
    chords: ['Bbmaj7', 'Cadd9', 'Dm7', 'Fmaj7', 'Gm7', 'Cmaj7', 'Bbmaj7', 'Cadd9'],
    bass: 'climbing', arp: 'falling', arpEvery: 4, color: 1.15, energy: 1.02,
    lead: [
      86,82,77,74,77,82,86,-1,88,84,79,76,79,84,88,-1,
      89,86,81,77,81,86,89,-1,88,84,81,77,81,84,88,0,
      89,-1,86,82,79,-1,77,74,88,-1,86,83,79,-1,76,0,
      86,89,93,-1,89,86,82,77,79,84,86,-1,88,-1,84,0,
    ],
  },
  {
    name: 'Last light',
    chords: ['Dm7', 'Cmaj7', 'Bbmaj7', 'Fmaj7', 'Gm7', 'Dm7', 'Bbmaj7', 'Cadd9'],
    bass: 'floating', arp: 'shimmer', arpEvery: 8, color: .8, energy: .82,
    lead: [
      81,-1,-1,0,77,-1,74,0,79,-1,-1,0,76,-1,72,0,
      77,-1,74,-1,70,-1,74,0,76,-1,77,-1,81,-1,-1,0,
      79,-1,77,74,70,-1,74,0,77,-1,81,-1,84,-1,81,0,
      82,-1,81,77,74,-1,77,81,84,-1,86,88,91,-1,88,0,
    ],
  },
  {
    name: 'Beyond the horizon',
    chords: ['Fmaj7', 'Bbmaj7', 'Gm7', 'Cadd9', 'Dm7', 'Bbmaj7', 'Cadd9', 'Fmaj7'],
    bass: 'rolling', arp: 'shimmer', arpEvery: 2, color: 1.2, energy: 1.05,
    lead: [
      89,-1,88,84,88,-1,89,0,93,-1,89,86,82,-1,86,89,
      91,-1,89,86,82,-1,79,77,88,86,84,79,84,-1,88,91,
      93,-1,89,86,84,81,77,0,89,-1,86,82,81,77,74,0,
      84,86,88,-1,91,88,86,84,89,-1,-1,88,84,-1,77,0,
    ],
  },
];

// E minor: rigid ostinatos, clipped stabs, and dominant/diminished tension.
const fortressSections = [
  {
    name: 'Iron gates',
    chords: ['Em', 'Em', 'C', 'B7', 'Am', 'Em', 'Fsdim', 'B7'],
    bass: 'engine', arp: 'jagged', arpEvery: 2, color: 1, energy: 1.05,
    lead: [
      64,64,0,67,64,0,71,70,64,64,0,71,67,0,66,64,
      67,67,0,72,67,0,64,67,66,66,0,71,75,0,74,71,
      69,69,0,72,69,0,64,67,64,64,0,67,71,0,76,74,
      66,69,0,72,69,0,66,65,66,71,0,75,78,75,71,0,
    ],
  },
  {
    name: 'Foundry floor',
    chords: ['Em', 'D', 'C', 'B7', 'Em', 'C', 'Am', 'B7'],
    bass: 'march', arp: 'down', arpEvery: 2, color: 1.15, energy: 1.08,
    lead: [
      76,0,71,76,0,79,78,76,74,0,69,74,0,78,76,74,
      72,0,67,72,0,76,74,72,71,0,66,71,0,75,78,75,
      76,79,0,83,79,0,76,71,76,79,0,84,79,0,76,72,
      76,81,0,84,81,0,76,72,75,78,0,83,78,75,71,0,
    ],
  },
  {
    name: 'Sentinel patrol',
    chords: ['Am', 'Em', 'Fsdim', 'B7', 'C', 'Am', 'Fsdim', 'B7'],
    bass: 'engine', arp: 'bounce', arpEvery: 4, color: .9, energy: .95,
    lead: [
      69,0,0,72,0,76,72,69,67,0,0,64,0,71,67,64,
      66,0,0,69,0,72,69,66,66,0,0,71,0,75,74,71,
      72,0,0,76,0,79,76,72,72,0,0,69,0,76,72,69,
      72,69,0,66,0,69,66,0,71,75,0,78,0,75,71,0,
    ],
  },
  {
    name: 'Furnace heart',
    chords: ['Em', 'C', 'Am', 'B7', 'Em', 'D', 'C', 'B7'],
    bass: 'spacious', arp: 'jagged', arpEvery: 4, color: .7, energy: .85,
    lead: [
      64,-1,0,0,71,0,70,0,67,-1,0,0,72,0,71,0,
      69,-1,0,0,76,0,75,0,71,-1,0,0,75,0,78,0,
      76,-1,0,71,67,0,64,0,74,-1,0,69,66,0,62,0,
      72,-1,0,67,64,0,60,0,71,0,75,0,78,0,83,0,
    ],
  },
  {
    name: 'Plasma conveyor',
    chords: ['Em', 'Em', 'Am', 'B7', 'C', 'D', 'Fsdim', 'B7'],
    bass: 'engine', arp: 'jagged', arpEvery: 2, color: 1.25, energy: 1.1,
    lead: [
      64,67,71,64,67,71,76,0,76,75,71,67,64,67,71,0,
      69,72,76,69,72,76,81,0,75,78,83,78,75,71,66,0,
      72,76,79,84,79,76,72,67,74,78,81,86,81,78,74,69,
      78,81,84,81,78,75,72,69,71,75,78,83,78,75,71,0,
    ],
  },
  {
    name: 'Alarm sequence',
    chords: ['Am', 'C', 'Em', 'B7', 'Am', 'Fsdim', 'B7', 'B7'],
    bass: 'march', arp: 'down', arpEvery: 2, color: 1.1, energy: 1.05,
    lead: [
      81,0,76,81,0,76,72,76,84,0,79,84,0,79,76,79,
      83,0,79,76,0,71,76,79,83,0,78,75,0,71,75,78,
      84,81,76,72,0,76,81,0,84,81,78,72,0,78,81,0,
      83,0,82,83,0,78,75,71,78,0,77,78,0,75,71,0,
    ],
  },
  {
    name: 'Core lockdown',
    chords: ['Em', 'C', 'D', 'B7', 'Am', 'C', 'Fsdim', 'B7'],
    bass: 'engine', arp: 'jagged', arpEvery: 4, color: .8, energy: .9,
    lead: [
      64,0,64,0,67,0,71,0,60,0,60,0,64,0,67,0,
      62,0,62,0,66,0,69,0,63,0,63,0,66,0,71,0,
      69,0,72,0,76,0,81,0,72,0,76,0,79,0,84,0,
      78,0,75,72,69,0,66,0,75,0,78,81,83,0,78,0,
    ],
  },
  {
    name: 'Final approach',
    chords: ['Em', 'C', 'Am', 'B7', 'Em', 'D', 'B7', 'Em'],
    bass: 'march', arp: 'bounce', arpEvery: 2, color: 1.2, energy: 1.1,
    lead: [
      76,79,83,0,79,76,71,0,79,84,88,0,84,79,76,0,
      81,84,88,0,84,81,76,0,83,87,90,0,87,83,78,75,
      88,83,79,76,79,83,88,0,86,81,78,74,78,81,86,0,
      87,83,78,75,71,75,78,83,88,0,83,79,76,-1,0,0,
    ],
  },
];

// Register, articulation, and pulse motion complement each score's written identity.
export const stageSongs = [
  { name: 'Greenline Run', step: .135, cutoff: 2600, resonance: 1.8,
    leadGate: .92, sustain: .55, vibrato: 12, pulse: [.28, .16, 3.1],
    bassShift: 0, arpTicks: 1, sections: greenlineSections },
  { name: 'Under the Grid', step: .17, cutoff: 1300, resonance: 2.4,
    leadGate: .62, sustain: .4, vibrato: 6, pulse: [.18, .07, 1.8],
    bassShift: -12, arpTicks: 2, sections: gridSections },
  { name: 'Skyway Sprint', step: .14, cutoff: 2400, resonance: 1.3,
    leadGate: .98, sustain: .75, vibrato: 15, pulse: [.36, .11, 1.3],
    bassShift: 0, arpTicks: 2, sections: skywaySections },
  { name: 'The Giga Fortress', step: .128, cutoff: 2000, resonance: 2.8,
    leadGate: .72, sustain: .4, vibrato: 8, pulse: [.19, .12, 5],
    bassShift: 0, arpTicks: 1, sections: fortressSections },
].map(song => ({
  ...song,
  sections: song.sections.map(section => ({
    ...section,
    chords: section.chords.map(name => chords[name]),
    bass: bassPatterns[section.bass],
    arp: arpeggios[section.arp],
  })),
}));
