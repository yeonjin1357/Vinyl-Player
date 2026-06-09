import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioEngine, __resetAudioEngineForTests, getAudioEngine } from './AudioEngine';

// ---- Minimal Web Audio mocks (jsdom has no Web Audio API) ----
class FakeParam {
  value = 1;
  setTargetAtTime = vi.fn((v: number) => {
    this.value = v;
  });
}
class FakeNode {
  connect = vi.fn();
}
class FakeGain extends FakeNode {
  gain = new FakeParam();
}
class FakeAnalyser extends FakeNode {
  fftSize = 0;
  smoothingTimeConstant = 0;
}
class FakeAudioContext {
  state: AudioContextState = 'suspended';
  currentTime = 0;
  destination = new FakeNode();
  createGain = vi.fn(() => new FakeGain());
  createAnalyser = vi.fn(() => new FakeAnalyser());
  createMediaElementSource = vi.fn(() => new FakeNode());
  resume = vi.fn(async () => {
    this.state = 'running';
  });
}

beforeEach(() => {
  vi.stubGlobal('AudioContext', FakeAudioContext);
  __resetAudioEngineForTests();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('AudioEngine', () => {
  it('builds the graph: gain -> analyser -> destination, fftSize 256', () => {
    const e = new AudioEngine();
    expect(e.analyser.fftSize).toBe(256);
    expect((e.gain as unknown as FakeGain).connect).toHaveBeenCalledWith(e.analyser);
    expect((e.analyser as unknown as FakeAnalyser).connect).toHaveBeenCalledWith(
      e.context.destination,
    );
  });

  it('creates the MediaElementSource exactly once, even across repeat attach()', () => {
    const e = new AudioEngine();
    const el = document.createElement('audio');
    e.attach(el);
    e.attach(el); // StrictMode remount / repeat call
    e.attach(el);
    expect(
      (e.context as unknown as FakeAudioContext).createMediaElementSource,
    ).toHaveBeenCalledTimes(1);
    expect(e.isAttached).toBe(true);
  });

  it('does not create a second source when attach() gets a different element', () => {
    const e = new AudioEngine();
    e.attach(document.createElement('audio'));
    e.attach(document.createElement('audio')); // ignored
    expect(
      (e.context as unknown as FakeAudioContext).createMediaElementSource,
    ).toHaveBeenCalledTimes(1);
  });

  it('clamps gain to [0,1]', () => {
    const e = new AudioEngine();
    const param = e.gain.gain as unknown as FakeParam;
    e.setGain(0.5);
    expect(param.setTargetAtTime).toHaveBeenLastCalledWith(
      0.5,
      expect.any(Number),
      expect.any(Number),
    );
    e.setGain(2);
    expect(param.value).toBe(1);
    e.setGain(-1);
    expect(param.value).toBe(0);
  });

  it('resumes only when suspended', async () => {
    const e = new AudioEngine();
    const ctx = e.context as unknown as FakeAudioContext;
    await e.resume();
    expect(ctx.resume).toHaveBeenCalledTimes(1);
    await e.resume(); // now 'running' -> no-op
    expect(ctx.resume).toHaveBeenCalledTimes(1);
  });

  it('getAudioEngine returns a stable singleton', () => {
    expect(getAudioEngine()).toBe(getAudioEngine());
  });
});
