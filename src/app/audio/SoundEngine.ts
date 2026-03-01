export type SoundId =
  | 'yourTurn'
  | 'actionDeclared'
  | 'coup'
  | 'challengeWindow'
  | 'blockOpportunity'
  | 'assassinationAlert'
  | 'block'
  | 'influenceLoss'
  | 'challengeRevealSuccess'
  | 'challengeRevealFail'
  | 'coinsGained'
  | 'coinsLost'
  | 'timerWarning'
  | 'gameOverWin'
  | 'gameOverLose'
  | 'playerEliminated'
  | 'exchange'
  | 'cardShuffle'
  | 'reaction'
  | 'chatMessage';

class SoundEngine {
  private ctx: AudioContext | null = null;
  muted: boolean;

  constructor() {
    this.muted = typeof window !== 'undefined'
      && localStorage.getItem('coup_sound_muted') === 'true';
  }

  private getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /** Call from a user gesture to unlock AudioContext on mobile Safari */
  unlock(): void {
    this.getCtx();
  }

  play(id: SoundId): void {
    if (this.muted) return;
    const ctx = this.getCtx();
    if (!ctx) return;

    const fn = sounds[id];
    if (fn) fn(ctx);
  }
}

// ─── Helper: create oscillator → gain → destination, auto-stop ───
function osc(
  ctx: AudioContext,
  type: OscillatorType,
  freq: number,
  gain: number,
  start: number,
  stop: number,
  freqEnd?: number,
): void {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime + start);
  if (freqEnd !== undefined) {
    o.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + stop);
  }
  g.gain.setValueAtTime(gain, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(0, ctx.currentTime + stop);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + stop + 0.05);
}

// ─── Helper: noise burst for card shuffle ───
function noiseBurst(ctx: AudioContext, gain: number, start: number, duration: number): void {
  const sr = ctx.sampleRate;
  const len = sr * duration;
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 3000;
  bp.Q.value = 0.8;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(0, ctx.currentTime + start + duration);
  src.connect(bp).connect(g).connect(ctx.destination);
  src.start(ctx.currentTime + start);
  src.stop(ctx.currentTime + start + duration + 0.05);
}

// ─── Sound definitions ───
const sounds: Record<SoundId, (ctx: AudioContext) => void> = {
  // Two ascending tones C5→F5
  yourTurn(ctx) {
    osc(ctx, 'sine', 523, 0.15, 0, 0.12);
    osc(ctx, 'sine', 698, 0.15, 0.13, 0.25);
  },

  // Short triangle tick
  actionDeclared(ctx) {
    osc(ctx, 'triangle', 900, 0.1, 0, 0.08);
  },

  // Low sawtooth impact
  coup(ctx) {
    osc(ctx, 'sawtooth', 120, 0.2, 0, 0.3, 60);
  },

  // Rising sine sweep
  challengeWindow(ctx) {
    osc(ctx, 'sine', 400, 0.1, 0, 0.25, 800);
  },

  // Two-tone square alert
  blockOpportunity(ctx) {
    osc(ctx, 'square', 600, 0.08, 0, 0.1);
    osc(ctx, 'square', 800, 0.08, 0.12, 0.22);
  },

  // Three-note descending alarm
  assassinationAlert(ctx) {
    osc(ctx, 'sawtooth', 880, 0.15, 0, 0.1);
    osc(ctx, 'sawtooth', 660, 0.15, 0.12, 0.22);
    osc(ctx, 'sawtooth', 440, 0.15, 0.24, 0.4);
  },

  // Metallic triangle clang
  block(ctx) {
    osc(ctx, 'triangle', 1200, 0.12, 0, 0.05);
    osc(ctx, 'triangle', 2400, 0.08, 0, 0.15);
  },

  // Low descending sine
  influenceLoss(ctx) {
    osc(ctx, 'sine', 300, 0.15, 0, 0.35, 150);
  },

  // Ascending C-E-G arpeggio
  challengeRevealSuccess(ctx) {
    osc(ctx, 'sine', 523, 0.12, 0, 0.15);
    osc(ctx, 'sine', 659, 0.12, 0.1, 0.25);
    osc(ctx, 'sine', 784, 0.12, 0.2, 0.35);
  },

  // Descending sawtooth buzz
  challengeRevealFail(ctx) {
    osc(ctx, 'sawtooth', 400, 0.12, 0, 0.15);
    osc(ctx, 'sawtooth', 300, 0.12, 0.1, 0.25);
    osc(ctx, 'sawtooth', 200, 0.12, 0.2, 0.4);
  },

  // High bright ping
  coinsGained(ctx) {
    osc(ctx, 'sine', 1200, 0.1, 0, 0.15);
  },

  // Lower triangle ping
  coinsLost(ctx) {
    osc(ctx, 'triangle', 600, 0.1, 0, 0.15);
  },

  // Quick square tick
  timerWarning(ctx) {
    osc(ctx, 'square', 880, 0.12, 0, 0.06);
  },

  // Ascending major arpeggio C-E-G-C
  gameOverWin(ctx) {
    osc(ctx, 'sine', 523, 0.15, 0, 0.2);
    osc(ctx, 'sine', 659, 0.15, 0.15, 0.35);
    osc(ctx, 'sine', 784, 0.15, 0.3, 0.5);
    osc(ctx, 'sine', 1047, 0.18, 0.45, 0.75);
  },

  // Descending minor A-F#-D#
  gameOverLose(ctx) {
    osc(ctx, 'sine', 440, 0.12, 0, 0.25);
    osc(ctx, 'sine', 370, 0.12, 0.2, 0.45);
    osc(ctx, 'sine', 311, 0.12, 0.4, 0.7);
  },

  // Low thud descending to 80Hz
  playerEliminated(ctx) {
    osc(ctx, 'sine', 200, 0.2, 0, 0.4, 80);
  },

  // Detuned sine cluster
  exchange(ctx) {
    osc(ctx, 'sine', 500, 0.08, 0, 0.25);
    osc(ctx, 'sine', 507, 0.08, 0, 0.25);
    osc(ctx, 'sine', 493, 0.08, 0, 0.25);
  },

  // Bandpass-filtered noise burst
  cardShuffle(ctx) {
    noiseBurst(ctx, 0.12, 0, 0.15);
  },

  // Quick pop 800→1200Hz
  reaction(ctx) {
    osc(ctx, 'sine', 800, 0.1, 0, 0.08, 1200);
  },

  // Subtle sine ping
  chatMessage(ctx) {
    osc(ctx, 'sine', 660, 0.08, 0, 0.12);
  },
};

// ─── Singleton ───
let instance: SoundEngine | null = null;

export function getSoundEngine(): SoundEngine {
  if (!instance) {
    instance = new SoundEngine();
  }
  return instance;
}
