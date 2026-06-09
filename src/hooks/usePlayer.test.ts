import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePlayer } from './usePlayer';
import { usePlayerStore } from '@/store/usePlayerStore';

// jsdom doesn't implement media playback methods; stub them so effects don't throw.
beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: vi.fn().mockResolvedValue(undefined),
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'load', { configurable: true, value: vi.fn() });
});

function makeAudio(duration = 373) {
  const el = document.createElement('audio');
  let ct = 0;
  Object.defineProperty(el, 'currentTime', {
    configurable: true,
    get: () => ct,
    set: (v: number) => {
      ct = v;
    },
  });
  Object.defineProperty(el, 'duration', { configurable: true, value: duration });
  document.body.appendChild(el);
  return el;
}

function setup(duration = 373) {
  const el = makeAudio(duration);
  const ref = { current: el };
  // Known store state: album a1 loaded, paused (isPlaying stays false → no engine path).
  act(() => usePlayerStore.getState().playAlbum('a1', undefined, false));
  const view = renderHook(() => usePlayer(ref));
  return { el, ref, ...view };
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.clearAllMocks();
});

describe('usePlayer — media events → store', () => {
  it('loadedmetadata sets duration from the element', () => {
    const { el } = setup(351);
    act(() => el.dispatchEvent(new Event('loadedmetadata')));
    expect(usePlayerStore.getState().duration).toBe(351);
  });

  it('timeupdate pushes the element time into the store', () => {
    const { el } = setup();
    el.currentTime = 42;
    act(() => el.dispatchEvent(new Event('timeupdate')));
    expect(usePlayerStore.getState().currentTime).toBe(42);
  });
});

describe('usePlayer — seek override', () => {
  it('routes store.seek to the element and clamps to [0, duration]', () => {
    const { el } = setup(373);
    act(() => usePlayerStore.getState().seek(120));
    expect(el.currentTime).toBe(120);
    expect(usePlayerStore.getState().currentTime).toBe(120);

    act(() => usePlayerStore.getState().seek(9999));
    expect(el.currentTime).toBe(373);

    act(() => usePlayerStore.getState().seek(-5));
    expect(el.currentTime).toBe(0);
  });

  it('restores the original seek on unmount (no longer moves the element)', () => {
    const { el, unmount } = setup(373);
    unmount();
    el.currentTime = 10;
    act(() => usePlayerStore.getState().seek(50)); // original seek: store only, not the element
    expect(el.currentTime).toBe(10); // element untouched → override was removed
    expect(usePlayerStore.getState().currentTime).toBe(50);
  });
});
