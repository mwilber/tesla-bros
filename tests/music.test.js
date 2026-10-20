import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGES } from '../src/engine.js';
import { stageSongs } from '../src/music-score.js';

test('every level has a matching soundtrack with at least a minute of distinct sections', () => {
  assert.equal(stageSongs.length, STAGES.length);
  stageSongs.forEach((song, stage) => {
    assert.equal(song.name.toUpperCase(), STAGES[stage].name);
    assert.equal(song.sections.length, 8);
    assert.equal(new Set(song.sections.map(section => section.lead.join(','))).size, 8);
    const steps = song.sections.reduce((sum, section) => sum + section.lead.length, 0);
    assert(steps * song.step >= 60, `${song.name} repeats too soon`);
  });
});

test('scores contain playable voices, valid arpeggio voicings, and connected held notes', () => {
  for (const song of stageSongs) for (const section of song.sections) {
    const label = `${song.name}: ${section.name}`;
    assert.equal(section.lead.length, 64, label);
    assert.equal(section.chords.length, 8, label);
    assert.equal(section.bass.length, 8, label);
    assert.equal(8 % section.arpEvery, 0, label);
    section.lead.forEach((note, index) => {
      assert(Number.isInteger(note) && note >= -1 && note <= 127, label);
      if (note === -1) assert(index > 0 && section.lead[index - 1] !== 0, `${label}: orphan hold`);
    });
    for (const chord of section.chords) {
      for (const index of section.arp) {
        const note = chord.root + chord.intervals[index];
        assert(Number.isInteger(note) && note > 0 && note <= 127, `${label}: invalid arpeggio`);
      }
      for (const offset of section.bass.filter(note => note !== null)) {
        const note = chord.bass + offset + song.bassShift;
        assert(Number.isInteger(note) && note > 0 && note <= 127, `${label}: invalid bass`);
      }
    }
  }
});

test('level melodies have different contours and rhythms, beyond a change of pitch', () => {
  const contours = stageSongs.map(song => {
    const notes = song.sections.flatMap(section => section.lead);
    const root = notes.find(note => note > 0);
    return notes.map(note => note > 0 ? note - root : note === 0 ? 'rest' : 'hold').join(',');
  });
  const rhythms = stageSongs.map(song => song.sections
    .flatMap(section => section.lead).map(note => Math.sign(note)).join(','));
  assert.equal(new Set(contours).size, STAGES.length);
  assert.equal(new Set(rhythms).size, STAGES.length);
});
