// SID-inspired synthesis, rather than a cycle-accurate chip emulator.
// Three monophonic voices share a resonant filter; modulation runs at 50 Hz.
import { stageSongs } from './music-score.js';

const TICK = 1 / 50;
const SILENCE = .0001;
const frequency = midi => 440 * 2 ** ((midi - 69) / 12);

export class SIDMusic {
  constructor(audio) {
    this.audio = audio;
    this.step = 0;
    this.clock = 0;
    this.nextStep = 0;
    this.nextTick = 0;
    this.stage = -1;
    this.playing = false;
    this.pulses = new Map();
    this.filter = audio.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.output = audio.createGain();
    this.output.gain.value = 0;
    // Gentle saturation rounds off the bright pulse/saw mix before output.
    this.drive = audio.createWaveShaper();
    this.drive.curve = Float32Array.from({ length: 1024 }, (_, i) =>
      Math.tanh((i / 1023 * 2 - 1) * 1.4) / Math.tanh(1.4));
    this.drive.oversample = '2x';
    this.filter.connect(this.drive).connect(this.output).connect(audio.destination);
    this.voices = ['pulse', 'sawtooth', 'pulse'].map(wave => {
      const oscillator = audio.createOscillator(), envelope = audio.createGain();
      if (wave === 'pulse') oscillator.setPeriodicWave(this.pulse(.25));
      else oscillator.type = wave;
      envelope.gain.value = SILENCE;
      oscillator.connect(envelope).connect(this.filter);
      oscillator.start();
      return { oscillator, envelope, note: 60, age: 0, width: -1, intervals: [0, 4, 7] };
    });
  }

  pulse(width) {
    // Cached Fourier pulse waves let the browser band-limit each oscillator.
    const key = Math.round(width * 32);
    if (!this.pulses.has(key)) {
      const real = new Float32Array(65), imag = new Float32Array(65);
      const duty = key / 32;
      for (let n = 1; n < real.length; n++) {
        real[n] = 2 * Math.sin(2 * Math.PI * n * duty) / (Math.PI * n);
        imag[n] = 2 * (1 - Math.cos(2 * Math.PI * n * duty)) / (Math.PI * n);
      }
      this.pulses.set(key, this.audio.createPeriodicWave(real, imag, { disableNormalization: true }));
    }
    return this.pulses.get(key);
  }

  gate(index, note, time, duration, level, sustain) {
    const voice = this.voices[index], gain = voice.envelope.gain;
    voice.note = note;
    voice.age = 0;
    voice.oscillator.frequency.setValueAtTime(frequency(note), time);
    gain.cancelScheduledValues(time);
    gain.setValueAtTime(SILENCE, time);
    gain.linearRampToValueAtTime(level, time + .004);
    gain.exponentialRampToValueAtTime(level * sustain, time + .035);
    gain.setValueAtTime(level * sustain, time + duration - .025);
    gain.exponentialRampToValueAtTime(SILENCE, time + duration);
  }

  schedule(time, style) {
    const section = style.sections[Math.floor(this.step / 64) % style.sections.length];
    const step = this.step % 64, chord = section.chords[Math.floor(step / 8)];
    const bass = section.bass[step % 8];
    const accent = step % 8 === 0 ? 1.05 : 1;
    if (section.lead[step] > 0) {
      let heldSteps = 0;
      while (section.lead[step + heldSteps + 1] === -1) heldSteps++;
      this.gate(0, section.lead[step], time, style.step * (heldSteps + style.leadGate),
        .25 * section.energy * accent, style.sustain);
    }
    if (bass !== null) this.gate(1, chord.bass + bass + style.bassShift,
      time, style.step * .9, .3 * section.energy, .38);
    // A single voice cycles the chord at chip-frame speed, rather than stacking notes.
    if (step % section.arpEvery === 0) {
      this.gate(2, chord.root, time, style.step * (section.arpEvery - .15),
        .12 * section.energy, .5);
      this.voices[2].intervals = section.arp.map(index => chord.intervals[index]);
    }
    const cutoff = style.cutoff * section.color;
    this.filter.frequency.setValueAtTime(cutoff + (step % 8 === 0 ? 1600 : 600), time);
    this.filter.frequency.exponentialRampToValueAtTime(cutoff * .65, time + style.step * .9);
    this.step++;
  }

  update(stage, playing) {
    const now = this.audio.currentTime;
    if (!playing) {
      if (this.playing) {
        this.output.gain.cancelScheduledValues(now);
        this.output.gain.setTargetAtTime(0, now, .008);
        for (const voice of this.voices) {
          voice.envelope.gain.cancelScheduledValues(now);
          voice.envelope.gain.setTargetAtTime(SILENCE, now, .008);
          voice.oscillator.frequency.cancelScheduledValues(now);
          voice.oscillator.detune.cancelScheduledValues(now);
        }
        this.filter.frequency.cancelScheduledValues(now);
      }
      this.playing = false;
      return;
    }
    const style = stageSongs[stage];
    if (!this.playing || this.stage !== stage || this.nextTick < now - .25) {
      // Discard lookahead from the old stage or transport position before restarting.
      for (const voice of this.voices) {
        voice.envelope.gain.cancelScheduledValues(now);
        voice.envelope.gain.setValueAtTime(SILENCE, now);
        voice.oscillator.frequency.cancelScheduledValues(now);
        voice.oscillator.detune.cancelScheduledValues(now);
      }
      this.filter.frequency.cancelScheduledValues(now);
      if (this.stage !== stage) this.step = 0;
      this.stage = stage;
      this.nextTick = now;
      this.nextStep = this.clock;
      this.output.gain.cancelScheduledValues(now);
      this.output.gain.setTargetAtTime(.11, now, .012);
    }
    this.playing = true;
    this.filter.Q.setTargetAtTime(style.resonance, now, .03);
    // Pulse width is updated on the live oscillators; pitch/envelopes use lookahead.
    for (const index of [0, 2]) {
      const voice = this.voices[index];
      const [center, depth, speed] = style.pulse;
      const width = Math.round((center + depth * Math.sin(now * speed * (index === 0 ? 1 : .55))) * 32);
      if (voice.width !== width) {
        voice.oscillator.setPeriodicWave(this.pulse(width / 32));
        voice.width = width;
      }
    }
    while (this.nextTick < now + .08) {
      if (this.clock + .00001 >= this.nextStep) {
        this.schedule(this.nextTick, style);
        this.nextStep += style.step;
      }
      const [melody, low, chord] = this.voices;
      // Brief pitch attacks and delayed vibrato give the lead its tracker bite.
      melody.oscillator.detune.setValueAtTime(melody.age === 0 ? 70 :
        melody.age > .06 ? Math.sin(this.clock * Math.PI * 11) * style.vibrato : 0, this.nextTick);
      low.oscillator.detune.setValueAtTime(low.age === 0 ? 120 : 0, this.nextTick);
      const chordStep = Math.floor((chord.age + .00001) / (TICK * style.arpTicks)) % chord.intervals.length;
      chord.oscillator.frequency.setValueAtTime(frequency(chord.note + chord.intervals[chordStep]), this.nextTick);
      for (const voice of this.voices) voice.age += TICK;
      this.clock += TICK;
      this.nextTick += TICK;
    }
  }
}
