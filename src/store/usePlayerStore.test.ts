import { beforeEach, describe, expect, it } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { createPlayerState, shuffleInPlace } from './storeFactory';
import { selectProgress, selectQueueTracks } from './selectors';
import { usePlayerStore } from './usePlayerStore';
import { getTrackById } from '@/data/music';

/** Small seeded PRNG so shuffle output is deterministic in tests. */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Isolated, un-persisted store per test.
function freshStore() {
  return createStore(createPlayerState);
}
let store: ReturnType<typeof freshStore>;
beforeEach(() => {
  store = freshStore();
});
const st = () => store.getState();

describe('playAlbum', () => {
  it('loads an album in natural order and plays', () => {
    st().playAlbum('a3');
    expect(st().currentTrackId).toBe('t8');
    expect(st().queue).toEqual(['t8', 't9', 't10']);
    expect(st().queueIndex).toBe(0);
    expect(st().isPlaying).toBe(true);
    expect(st().currentTime).toBe(0);
    expect(st().view).toBe('player');
    expect(st().selectedAlbumId).toBe('a3');
    expect(st().duration).toBe(getTrackById('t8')!.duration);
  });
  it('starts at a given track', () => {
    st().playAlbum('a3', 't9');
    expect(st().currentTrackId).toBe('t9');
    expect(st().queueIndex).toBe(1);
  });
  it('falls back to the first track for an unknown startId', () => {
    st().playAlbum('a3', 'nope');
    expect(st().currentTrackId).toBe('t8');
    expect(st().queueIndex).toBe(0);
  });
  it('is a no-op for an unknown album', () => {
    st().playAlbum('NOPE');
    expect(st().currentTrackId).toBeNull();
    expect(st().queue).toEqual([]);
  });
  it('can load without autoplay', () => {
    st().playAlbum('a3', undefined, false);
    expect(st().isPlaying).toBe(false);
    expect(st().currentTrackId).toBe('t8');
  });
  it('produces a permutation with the start track at the head when shuffled', () => {
    st().toggleShuffle(); // flips flag (empty queue)
    st().playAlbum('a3');
    expect(st().queue).toHaveLength(3);
    expect([...st().queue].sort()).toEqual(['t8', 't9', 't10'].sort());
    expect(st().queue[0]).toBe('t8');
    expect(st().queueIndex).toBe(0);
  });
});

describe('playTrackAt', () => {
  it('jumps within the queue', () => {
    st().playAlbum('a3');
    st().playTrackAt(2);
    expect(st().currentTrackId).toBe('t10');
    expect(st().currentTime).toBe(0);
    expect(st().isPlaying).toBe(true);
  });
  it('guards out-of-range indices', () => {
    st().playAlbum('a3');
    st().playTrackAt(99);
    st().playTrackAt(-1);
    expect(st().currentTrackId).toBe('t8');
  });
});

describe('togglePlay', () => {
  it('toggles when a track is loaded', () => {
    st().playAlbum('a3', undefined, false);
    expect(st().isPlaying).toBe(false);
    st().togglePlay();
    expect(st().isPlaying).toBe(true);
    st().togglePlay();
    expect(st().isPlaying).toBe(false);
  });
  it('is a no-op with no track', () => {
    st().togglePlay();
    expect(st().isPlaying).toBe(false);
  });
});

describe('next', () => {
  it('advances mid-queue', () => {
    st().playAlbum('a3');
    st().next();
    expect(st().currentTrackId).toBe('t9');
    expect(st().queueIndex).toBe(1);
    expect(st().currentTime).toBe(0);
  });
  it('clamps at the last track when repeat is off', () => {
    st().playAlbum('a3', 't10');
    st().next();
    expect(st().queueIndex).toBe(2);
    expect(st().currentTrackId).toBe('t10');
  });
  it('wraps to the first track when repeat is all', () => {
    st().playAlbum('a3', 't10');
    st().cycleRepeat(); // off -> all
    st().next();
    expect(st().queueIndex).toBe(0);
    expect(st().currentTrackId).toBe('t8');
  });
  it('handles a single-track album', () => {
    st().playAlbum('a4');
    st().next();
    expect(st().currentTrackId).toBe('t11'); // off: clamp
    st().cycleRepeat(); // all
    st().next();
    expect(st().currentTrackId).toBe('t11'); // wraps onto itself
    expect(st().currentTime).toBe(0);
  });
});

describe('prev', () => {
  it('restarts the current track when past 3s', () => {
    st().playAlbum('a3', 't9');
    st().seek(5);
    st().prev();
    expect(st().currentTrackId).toBe('t9');
    expect(st().queueIndex).toBe(1);
    expect(st().currentTime).toBe(0);
  });
  it('goes to the previous track when within 3s', () => {
    st().playAlbum('a3', 't9');
    st().seek(2);
    st().prev();
    expect(st().currentTrackId).toBe('t8');
    expect(st().queueIndex).toBe(0);
  });
  it('clamps at the first track (repeat off)', () => {
    st().playAlbum('a3');
    st().seek(1);
    st().prev();
    expect(st().queueIndex).toBe(0);
    expect(st().currentTime).toBe(0);
  });
  it('wraps to the last track (repeat all)', () => {
    st().playAlbum('a3');
    st().cycleRepeat(); // all
    st().seek(1);
    st().prev();
    expect(st().queueIndex).toBe(2);
    expect(st().currentTrackId).toBe('t10');
  });
});

describe('_handleTrackEnded', () => {
  it('advances to the next track (repeat off)', () => {
    st().playAlbum('a3');
    st()._handleTrackEnded();
    expect(st().currentTrackId).toBe('t9');
    expect(st().isPlaying).toBe(true);
  });
  it('stops at the end of the queue (repeat off)', () => {
    st().playAlbum('a3', 't10');
    st()._handleTrackEnded();
    expect(st().currentTrackId).toBe('t10');
    expect(st().isPlaying).toBe(false);
  });
  it('wraps to the first track (repeat all)', () => {
    st().playAlbum('a3', 't10');
    st().cycleRepeat(); // all
    st()._handleTrackEnded();
    expect(st().currentTrackId).toBe('t8');
    expect(st().isPlaying).toBe(true);
  });
  it('replays the same track (repeat one)', () => {
    st().playAlbum('a3', 't9');
    st().cycleRepeat(); // all
    st().cycleRepeat(); // one
    st().seek(5);
    st()._handleTrackEnded();
    expect(st().currentTrackId).toBe('t9');
    expect(st().queueIndex).toBe(1);
    expect(st().currentTime).toBe(0);
    expect(st().isPlaying).toBe(true);
  });
});

describe('toggleShuffle', () => {
  it('keeps the current track at the head and shuffles the rest', () => {
    st().playAlbum('a3');
    st().toggleShuffle();
    expect(st().shuffle).toBe(true);
    expect([...st().queue].sort()).toEqual(['t8', 't9', 't10'].sort());
    expect(st().currentTrackId).toBe('t8');
    expect(st().queue[st().queueIndex]).toBe('t8');
  });
  it('restores natural order when toggled off', () => {
    st().playAlbum('a3');
    st().toggleShuffle();
    st().toggleShuffle();
    expect(st().queue).toEqual(['t8', 't9', 't10']);
    expect(st().currentTrackId).toBe('t8');
    expect(st().queueIndex).toBe(0);
  });
  it('just flips the flag with no queue', () => {
    st().toggleShuffle();
    expect(st().shuffle).toBe(true);
    expect(st().queue).toEqual([]);
  });
});

describe('cycleRepeat', () => {
  it('cycles off -> all -> one -> off', () => {
    expect(st().repeat).toBe('off');
    st().cycleRepeat();
    expect(st().repeat).toBe('all');
    st().cycleRepeat();
    expect(st().repeat).toBe('one');
    st().cycleRepeat();
    expect(st().repeat).toBe('off');
  });
});

describe('volume & mute', () => {
  it('sets and clamps volume', () => {
    st().setVolume(0.5);
    expect(st().volume).toBe(0.5);
    st().setVolume(2);
    expect(st().volume).toBe(1);
    st().setVolume(-1);
    expect(st().volume).toBe(0);
  });
  it('mute preserves volume; unmute restores it', () => {
    st().setVolume(0.7);
    st().toggleMute();
    expect(st().isMuted).toBe(true);
    expect(st().volume).toBe(0.7);
    st().toggleMute();
    expect(st().isMuted).toBe(false);
    expect(st().volume).toBe(0.7);
  });
  it('raising the volume un-mutes', () => {
    st().toggleMute();
    st().setVolume(0.3);
    expect(st().isMuted).toBe(false);
    expect(st().volume).toBe(0.3);
  });
});

describe('seek', () => {
  it('clamps to [0, duration]', () => {
    st().playAlbum('a3');
    const d = st().duration; // first track's metadata duration
    st().seek(5);
    expect(st().currentTime).toBe(5);
    st().seek(d + 999);
    expect(st().currentTime).toBe(d);
    st().seek(-5);
    expect(st().currentTime).toBe(0);
  });
});

describe('shuffleInPlace', () => {
  it('is deterministic for a given rng', () => {
    const a = shuffleInPlace([1, 2, 3, 4, 5, 6], mulberry32(42));
    const b = shuffleInPlace([1, 2, 3, 4, 5, 6], mulberry32(42));
    expect(a).toEqual(b);
  });
  it('is a permutation', () => {
    const out = shuffleInPlace([1, 2, 3, 4, 5], mulberry32(7));
    expect([...out].sort((x, y) => x - y)).toEqual([1, 2, 3, 4, 5]);
    expect(out).toHaveLength(5);
  });
  it('handles an empty array', () => {
    expect(shuffleInPlace([])).toEqual([]);
  });
});

describe('selectors', () => {
  it('selectQueueTracks returns the full queue regardless of position', () => {
    st().playAlbum('a3');
    expect(selectQueueTracks(st()).map((t) => t.id)).toEqual(['t8', 't9', 't10']);
    st().playTrackAt(2); // on the last track
    expect(selectQueueTracks(st()).map((t) => t.id)).toEqual(['t8', 't9', 't10']);
  });
  it('selectProgress is guarded and clamped', () => {
    expect(selectProgress({ ...st(), currentTime: 0, duration: 0 })).toBe(0);
    expect(selectProgress({ ...st(), currentTime: 5, duration: 10 })).toBe(0.5);
    expect(selectProgress({ ...st(), currentTime: 99, duration: 10 })).toBe(1);
  });
});

describe('persistence (real store)', () => {
  it('persists only the whitelisted preference keys', () => {
    usePlayerStore.getState().setTheme('light-minimal');
    usePlayerStore.getState().setVolume(0.42);
    const raw = localStorage.getItem('lp-player');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as { state: Record<string, unknown> };
    expect(Object.keys(parsed.state).sort()).toEqual([
      'language',
      'repeat',
      'shuffle',
      'theme',
      'volume',
    ]);
    expect(parsed.state.theme).toBe('light-minimal');
    expect(parsed.state.volume).toBe(0.42);
  });
});
