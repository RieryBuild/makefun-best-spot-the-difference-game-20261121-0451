// audio.js — generated sound effects via WebAudio.
//
// No audio files: every sound is synthesized from oscillators + envelopes.
// The context is created lazily on the first user gesture (browser policy)
// and all calls are safe before that (they no-op).

let ctx = null;
let master = null;
let muted = false;

/** Create/resume the audio context. Call from a user gesture. */
export function ensureAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

/** Mute toggle. Returns the new muted state. */
export function setMuted(m) {
  muted = m;
  if (master) master.gain.value = m ? 0 : 0.5;
  return muted;
}

export function isMuted() {
  return muted;
}

/** One enveloped tone: freq, start time offset, duration, type, volume. */
function tone(freq, when, dur, type = 'sine', vol = 0.5) {
  if (!ctx || !master || muted) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** Satisfying two-note chime on each find, pitch rising with the combo. */
export function playFind(combo = 0) {
  const lift = Math.min(combo, 7) * 30;
  tone(660 + lift, 0, 0.16, 'sine', 0.5);
  tone(880 + lift, 0.07, 0.28, 'sine', 0.45);
  tone(1320 + lift, 0.07, 0.2, 'triangle', 0.12);
}

/** Soft low buzz for a wrong click — a nudge, not a punishment. */
export function playWrong() {
  tone(180, 0, 0.14, 'square', 0.16);
  tone(140, 0.05, 0.16, 'square', 0.12);
}

/** Shimmering hint cue. */
export function playHint() {
  tone(1180, 0, 0.12, 'sine', 0.3);
  tone(1560, 0.09, 0.22, 'sine', 0.25);
}

/** UI tick for buttons and keyboard moves. */
export function playTick() {
  tone(980, 0, 0.05, 'sine', 0.18);
}

/** Countdown tick in the last 10 seconds. */
export function playCountdown() {
  tone(1240, 0, 0.07, 'square', 0.14);
}

/** Scene-complete arpeggio. */
export function playSceneClear() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => tone(f, i * 0.09, 0.3, 'triangle', 0.35));
}

/** Final victory fanfare. */
export function playWin() {
  const notes = [523, 659, 784, 1047, 784, 1047, 1319];
  notes.forEach((f, i) => tone(f, i * 0.11, 0.4, 'triangle', 0.35));
  tone(262, 0, 0.9, 'sine', 0.2);
}

/** Gentle fail sting when the timer runs out. */
export function playTimeout() {
  tone(392, 0, 0.25, 'triangle', 0.3);
  tone(311, 0.18, 0.4, 'triangle', 0.3);
}
