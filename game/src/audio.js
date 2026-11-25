// Kitchen sounds, synthesized with WebAudio: no audio files, nothing fetched.
// Every call is guarded, so a browser with no audio (or a headless screenshot
// run) just stays silent instead of breaking the game.

let context = null;

function audio() {
  if (context) return context;
  try {
    const AudioContext = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
  } catch {
    return null;
  }
  return context;
}

/** One short tone: `freq` in Hz, `seconds` long, `type` an oscillator shape. */
function tone(freq, seconds, type, when = 0, volume = 0.12) {
  const ctx = audio();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') void ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime + when);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + seconds);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + when);
    osc.stop(ctx.currentTime + when + seconds + 0.02);
  } catch {
    // A blocked or missing audio device is not a game error.
  }
}

/** A knife chop when an ingredient lands on the plate. */
export function soundChop() {
  tone(190, 0.07, 'square', 0, 0.08);
  tone(320, 0.05, 'triangle', 0.02, 0.06);
}

/** A happy two-note ding when a dish goes out right. */
export function soundServe() {
  tone(660, 0.12, 'sine', 0, 0.12);
  tone(880, 0.18, 'sine', 0.1, 0.12);
}

/** A low buzz when the wrong dish is served or an order expires. */
export function soundWrong() {
  tone(140, 0.25, 'sawtooth', 0, 0.07);
  tone(110, 0.3, 'sawtooth', 0.08, 0.07);
}

/** A little rising arpeggio when the warung levels up. */
export function soundLevelUp() {
  tone(523, 0.1, 'triangle', 0, 0.1);
  tone(659, 0.1, 'triangle', 0.09, 0.1);
  tone(784, 0.16, 'triangle', 0.18, 0.1);
}

/** A soft tick when an order is about to run out. */
export function soundTick() {
  tone(980, 0.04, 'square', 0, 0.04);
}
