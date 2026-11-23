"use client";

import { createPersistedStore } from "@/lib/persisted-store";

/**
 * Original 8-bit sound effects, synthesised with the Web Audio API.
 * No audio files. Sound is OFF by default; the choice is remembered.
 * The AudioContext is only created after the user turns sound on (a user gesture).
 */
export const soundStore = createPersistedStore<boolean>(
  "pixel-quotes:sound",
  false,
  (raw) => raw === true,
);

export const useSoundEnabled = soundStore.useValue;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

function audio(): { ac: AudioContext; out: GainNode } | null {
  if (typeof window === "undefined" || !soundStore.get()) return null;
  // Never start audio before the visitor has interacted with the page.
  if (!ctx && navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
  try {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      // Overall level (~+13 dB over the original 0.55). A compressor after it keeps
      // stacked sounds (shredder, alarm) from clipping at this louder level.
      master.gain.value = 2.4;
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -12;
      limiter.knee.value = 8;
      limiter.ratio.value = 4;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.25;
      master.connect(limiter).connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return master ? { ac: ctx, out: master } : null;
  } catch {
    return null;
  }
}

function noise(ac: AudioContext) {
  if (!noiseBuffer) {
    noiseBuffer = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

type Tone = {
  freq: number;
  /** Glide to this frequency over the note. */
  to?: number;
  at?: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
};

function tone({
  freq,
  to,
  at = 0,
  dur,
  type = "square",
  gain = 0.04,
}: Tone): AudioScheduledSourceNode | undefined {
  const a = audio();
  if (!a) return;
  const t = a.ac.currentTime + 0.005 + at;
  const osc = a.ac.createOscillator();
  const g = a.ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  // Fast attack, smooth exponential release: no clicks.
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.out);
  osc.start(t);
  osc.stop(t + dur + 0.03);
  return osc;
}

type Noise = {
  at?: number;
  dur: number;
  gain: number;
  filter: BiquadFilterType;
  freq: number;
  freqTo?: number;
  q?: number;
  /** Chop the noise into uneven chunks (for a mechanical grind). */
  chunk?: number;
  /** Fade-in time in seconds (default 0.02). */
  attack?: number;
};

function hiss({
  at = 0,
  dur,
  gain,
  filter,
  freq,
  freqTo,
  q = 1,
  chunk,
  attack = 0.02,
}: Noise): AudioScheduledSourceNode | undefined {
  const a = audio();
  if (!a) return;
  const t = a.ac.currentTime + 0.005 + at;
  const src = a.ac.createBufferSource();
  src.buffer = noise(a.ac);
  const f = a.ac.createBiquadFilter();
  f.type = filter;
  f.Q.value = q;
  f.frequency.setValueAtTime(freq, t);
  if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
  const g = a.ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  if (chunk) {
    for (let s = 0; s < dur; s += chunk) {
      g.gain.setValueAtTime(gain * (0.35 + Math.random() * 0.65), t + s);
      g.gain.setValueAtTime(gain * 0.12, t + s + chunk * 0.7);
    }
  } else {
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
  }
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(a.out);
  src.start(t);
  src.stop(t + dur + 0.03);
  return src;
}

/** Keystrokes still scheduled for the quote that's typing, so a new quote can cut them off. */
let typingNodes: AudioScheduledSourceNode[] = [];

function stopTyping() {
  for (const n of typingNodes) {
    try {
      n.stop();
    } catch {
      // Already finished.
    }
  }
  typingNodes = [];
}

export const sfx = {
  /** Category change: a subtle selection beep. */
  select() {
    tone({ freq: 880, dur: 0.05, gain: 0.025 });
    tone({ freq: 1320, at: 0.045, dur: 0.06, gain: 0.02 });
  },

  /** Copy: two quick rising blips. */
  copy() {
    tone({ freq: 1175, dur: 0.05, gain: 0.025 });
    tone({ freq: 1568, at: 0.06, dur: 0.08, type: "triangle", gain: 0.04 });
  },

  /** Library open / close: a soft UI click. */
  click() {
    tone({ freq: 700, to: 500, dur: 0.035, type: "triangle", gain: 0.06 });
  },

  /** Next: a short digital "channel flip". */
  next() {
    tone({ freq: 1400, to: 380, dur: 0.08, gain: 0.025 });
    tone({ freq: 420, to: 1500, at: 0.07, dur: 0.09, gain: 0.025 });
    hiss({ at: 0.02, dur: 0.07, gain: 0.02, filter: "bandpass", freq: 3200, q: 0.9 });
  },

  /** Like: a pleasant rising chime. */
  like() {
    tone({ freq: 659, dur: 0.2, type: "triangle", gain: 0.07 });
    tone({ freq: 988, at: 0.07, dur: 0.24, type: "triangle", gain: 0.06 });
    tone({ freq: 1319, at: 0.14, dur: 0.38, type: "triangle", gain: 0.05 });
    tone({ freq: 1319, at: 0.14, dur: 0.12, gain: 0.012 });
  },

  /** Trash: the shredder's motor and grinding blades (~1s). */
  shred(duration = 0.95) {
    tone({ freq: 55, to: 68, dur: duration, gain: 0.03 });
    hiss({
      dur: duration,
      gain: 0.05,
      filter: "bandpass",
      freq: 1500,
      freqTo: 900,
      q: 1.3,
      chunk: 0.045,
    });
    for (let s = 0; s < duration - 0.1; s += 0.11) {
      tone({ freq: 140 + Math.random() * 40, at: s, dur: 0.03, gain: 0.018 });
    }
  },

  /** A new quote types out: soft keystrokes for as long as the text takes to appear. */
  typing(durationMs: number) {
    stopTyping();
    const dur = durationMs / 1000;
    let at = 0;
    while (at < dur) {
      // Each key: a tiny filtered click plus a faint pitched tick, slightly varied.
      const click = hiss({
        at,
        dur: 0.022,
        gain: 0.024 + Math.random() * 0.012,
        filter: "bandpass",
        freq: 2600 + Math.random() * 1600,
        q: 2.2,
        attack: 0.002,
      });
      const tick = tone({ freq: 1700 + Math.random() * 700, at, dur: 0.014, gain: 0.005 });
      if (click) typingNodes.push(click);
      if (tick) typingNodes.push(tick);
      at += 0.058 + Math.random() * 0.03;
    }
  },

  /** Cuts off any typing sound still playing (e.g. when the quote changes). */
  stopTyping,

  /** Bin full: a clear alarm, "BEEP-BEEP … BEEP-BEEP". */
  warning() {
    for (let round = 0; round < 2; round++) {
      for (let beep = 0; beep < 2; beep++) {
        const at = round * 0.46 + beep * 0.16;
        // Two slightly detuned squares beat against each other for a buzzy alarm tone,
        // with a low sawtooth underneath for weight.
        tone({ freq: 988, at, dur: 0.11, gain: 0.04 });
        tone({ freq: 996, at, dur: 0.11, gain: 0.03 });
        tone({ freq: 247, at, dur: 0.11, type: "sawtooth", gain: 0.022 });
      }
    }
  },

  /** Empty Trash, part 1: the bin's lid clacks open with a puff of air. */
  lidOpen() {
    tone({ freq: 240, to: 120, dur: 0.06, gain: 0.03 });
    tone({ freq: 330, to: 190, at: 0.08, dur: 0.05, gain: 0.022 });
    hiss({ dur: 0.16, gain: 0.025, filter: "bandpass", freq: 900, freqTo: 1600, q: 1.1 });
  },

  /** Empty Trash, part 2: pixels drift upward (matches the ~2s particle flight). */
  release(duration = 1.8) {
    // Airy whoosh that climbs as the pixels rise.
    hiss({
      dur: duration,
      gain: 0.03,
      filter: "bandpass",
      freq: 380,
      freqTo: 3400,
      q: 1.6,
      attack: 0.35,
    });
    // A soft glide upward underneath.
    tone({ freq: 220, to: 880, dur: duration * 0.8, type: "triangle", gain: 0.014 });
    // Twinkles scattered through the flight, from a pentatonic set so they never clash.
    const notes = [1568, 1760, 2093, 2349, 2637, 3136];
    for (let i = 0; i < 9; i++) {
      tone({
        freq: notes[Math.floor(Math.random() * notes.length)],
        at: 0.12 + (i / 9) * (duration - 0.35) + Math.random() * 0.08,
        dur: 0.16,
        type: "triangle",
        gain: 0.016,
      });
    }
  },

  /** Empty Trash, part 3: the bin is reset. A gentle "done" chime. */
  emptied() {
    tone({ freq: 1047, dur: 0.16, type: "triangle", gain: 0.05 });
    tone({ freq: 1568, at: 0.09, dur: 0.32, type: "triangle", gain: 0.045 });
    tone({ freq: 784, at: 0.09, dur: 0.18, gain: 0.01 });
  },
};

/** Turns sound on or off. Turning it on happens on a click, which also unlocks audio. */
export function setSoundEnabled(on: boolean) {
  soundStore.set(on);
  if (on) sfx.click();
}
