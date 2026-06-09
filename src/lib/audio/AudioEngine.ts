/**
 * Wraps the Web Audio graph for one <audio> element:
 *   MediaElementAudioSourceNode -> GainNode -> AnalyserNode -> destination
 *
 * Lifetime rules:
 *  - createMediaElementSource may run ONCE per element, ever (`built` guards it).
 *  - The AudioContext starts 'suspended' under the autoplay policy; resume() must
 *    be awaited from inside a user gesture (the first Play click).
 *  - Analyser sits AFTER gain, so the M3 visualizer reflects the audible signal.
 */
export class AudioEngine {
  readonly context: AudioContext;
  readonly gain: GainNode;
  readonly analyser: AnalyserNode;

  private source: MediaElementAudioSourceNode | null = null;
  private built = false;
  private attachedEl: HTMLAudioElement | null = null;

  constructor() {
    this.context = new AudioContext();

    this.gain = this.context.createGain();
    this.gain.gain.value = 1; // real level applied by setGain() once volume is known

    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 256; // 128 frequency bins for M3
    this.analyser.smoothingTimeConstant = 0.8;

    // Static portion of the graph; the source is spliced in by attach().
    this.gain.connect(this.analyser);
    this.analyser.connect(this.context.destination);
  }

  /** Build the source node ONCE and wire source -> gain. Element-guarded + idempotent. */
  attach(el: HTMLAudioElement): void {
    if (this.built) {
      if (this.attachedEl !== el && import.meta.env.DEV) {
        console.warn('[AudioEngine] attach() called with a different element; ignoring.');
      }
      return;
    }
    this.source = this.context.createMediaElementSource(el); // once-per-element, forever
    this.source.connect(this.gain);
    this.attachedEl = el;
    this.built = true;
  }

  /** Resume a suspended context. Safe to call repeatedly; only the first (in-gesture) matters. */
  async resume(): Promise<void> {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  /** Effective volume on the GainNode. Caller passes `isMuted ? 0 : volume`. */
  setGain(v: number): void {
    const value = Math.min(1, Math.max(0, v));
    // Short ramp avoids zipper/click noise on volume/mute changes.
    this.gain.gain.setTargetAtTime(value, this.context.currentTime, 0.01);
  }

  get isAttached(): boolean {
    return this.built;
  }
}

/** Module singleton — survives StrictMode double-mount and any hook remount. */
let engineSingleton: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  engineSingleton ??= new AudioEngine();
  return engineSingleton;
}

/** Test helper: drop the cached singleton so the next getAudioEngine() rebuilds. */
export function __resetAudioEngineForTests(): void {
  engineSingleton = null;
}
