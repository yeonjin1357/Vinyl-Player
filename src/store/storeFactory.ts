import type { StateCreator } from 'zustand';
import type { Language, RepeatMode, Theme, View } from '@/types/player';
import { getAlbumById, getTrackById } from '@/data/music';

export interface PlayerState {
  // ---- playback (display) ----
  currentTrackId: string | null;
  /** Track ids in actual play order (shuffled or natural). */
  queue: string[];
  /** Album's natural order — source of truth for un-shuffling. */
  orderedQueue: string[];
  queueIndex: number; // index into `queue`, -1 when empty
  isPlaying: boolean;
  currentTime: number; // seconds
  duration: number; // seconds (metadata hint, confirmed by engine)
  volume: number; // 0..1 (intended level)
  isMuted: boolean; // overlay; effective volume = isMuted ? 0 : volume
  shuffle: boolean;
  repeat: RepeatMode;

  /** Graph AnalyserNode, published by usePlayer on first play. Stable ref —
   *  NOT per-frame data, NOT persisted. Consumed by the visualizer. */
  analyserNode: AnalyserNode | null;

  // ---- ui / prefs ----
  view: View;
  selectedAlbumId: string | null;
  theme: Theme;
  language: Language;
}

export interface PlayerActions {
  // intent (UI-callable)
  playAlbum: (albumId: string, startTrackId?: string, autoPlay?: boolean) => void;
  playTrackAt: (index: number) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  seek: (t: number) => void;
  setView: (v: View) => void;
  setSelectedAlbum: (albumId: string | null) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setLanguage: (l: Language) => void;

  // engine-only (mock player in M1, usePlayer in M2) — UI must NOT call these
  _setIsPlaying: (b: boolean) => void;
  _setCurrentTime: (t: number) => void;
  _setDuration: (d: number) => void;
  _handleTrackEnded: () => void;
}

export type PlayerStore = PlayerState & PlayerActions;

/** Fisher–Yates. `rng` is injectable so tests can assert deterministic order. */
export function shuffleInPlace<T>(arr: T[], rng: () => number = Math.random): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** First-paint theme: adopt the value the FOUC script already wrote to
 *  <html data-theme> (persisted → else prefers-color-scheme) so the store's first
 *  render matches the painted DOM (no flash). Persist rehydrate overrides on
 *  return visits and agrees (same localStorage). jsdom/SSR → fallback. */
function initialTheme(): Theme {
  if (typeof document !== 'undefined') {
    const t = document.documentElement.dataset.theme;
    if (t === 'dark-neon' || t === 'light-minimal') return t;
  }
  return 'dark-neon';
}

const initialState: PlayerState = {
  currentTrackId: null,
  queue: [],
  orderedQueue: [],
  queueIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  shuffle: false,
  repeat: 'off',
  analyserNode: null,
  view: 'library',
  selectedAlbumId: null,
  theme: initialTheme(),
  language: 'en',
};

export const createPlayerState: StateCreator<PlayerStore> = (set, get) => {
  /** Single place the "reset on track change" rule lives. Caller decides isPlaying. */
  const loadTrack = (trackId: string, index: number, isPlaying: boolean) => {
    const track = getTrackById(trackId);
    set({
      currentTrackId: trackId,
      queueIndex: index,
      currentTime: 0,
      duration: track?.duration ?? 0,
      isPlaying,
    });
  };

  return {
    ...initialState,

    playAlbum: (albumId, startTrackId, autoPlay = true) => {
      const album = getAlbumById(albumId);
      if (!album) return;
      const ordered = [...album.trackIds];
      const startId = startTrackId && ordered.includes(startTrackId) ? startTrackId : ordered[0];
      if (!startId) return; // empty album guard

      let queue = ordered;
      if (get().shuffle) {
        queue = shuffleInPlace([...ordered]);
        const si = queue.indexOf(startId);
        if (si > 0) {
          queue.splice(si, 1);
          queue.unshift(startId); // keep the started track at the head
        }
      }
      const index = queue.indexOf(startId);
      const track = getTrackById(startId);
      set({
        orderedQueue: ordered,
        queue,
        queueIndex: index < 0 ? 0 : index,
        currentTrackId: startId,
        currentTime: 0,
        duration: track?.duration ?? 0,
        isPlaying: autoPlay,
        view: 'player',
        selectedAlbumId: albumId,
      });
    },

    playTrackAt: (index) => {
      const { queue } = get();
      if (index < 0 || index >= queue.length) return;
      loadTrack(queue[index], index, true);
    },

    togglePlay: () => {
      if (get().currentTrackId == null) return;
      set({ isPlaying: !get().isPlaying });
    },

    // Manual skip: advance; wrap only under repeat 'all', else clamp at the last track.
    next: () => {
      const { queue, queueIndex, repeat } = get();
      if (queue.length === 0) return;
      let i = queueIndex + 1;
      if (i >= queue.length) {
        if (repeat === 'all') i = 0;
        else return; // clamp: stay on last track, isPlaying unchanged
      }
      loadTrack(queue[i], i, true);
    },

    // "Restart current if past 3s, else go to previous track."
    prev: () => {
      const { queue, queueIndex, currentTime, repeat } = get();
      if (queue.length === 0) return;
      if (currentTime > 3) {
        set({ currentTime: 0 });
        return;
      }
      let i = queueIndex - 1;
      if (i < 0) {
        if (repeat === 'all') i = queue.length - 1;
        else {
          set({ currentTime: 0 }); // clamp: restart first track
          return;
        }
      }
      loadTrack(queue[i], i, true);
    },

    toggleShuffle: () => {
      const { shuffle, orderedQueue, currentTrackId } = get();
      const nextShuffle = !shuffle;
      if (orderedQueue.length === 0) {
        set({ shuffle: nextShuffle });
        return;
      }
      let queue: string[];
      if (nextShuffle) {
        queue = shuffleInPlace([...orderedQueue]);
        if (currentTrackId) {
          const ci = queue.indexOf(currentTrackId);
          if (ci > 0) {
            queue.splice(ci, 1);
            queue.unshift(currentTrackId);
          }
        }
      } else {
        queue = [...orderedQueue];
      }
      const idx = currentTrackId ? queue.indexOf(currentTrackId) : -1;
      set({ shuffle: nextShuffle, queue, queueIndex: idx < 0 ? 0 : idx });
    },

    cycleRepeat: () => {
      const order: RepeatMode[] = ['off', 'all', 'one'];
      const i = order.indexOf(get().repeat);
      set({ repeat: order[(i + 1) % order.length] });
    },

    setVolume: (v) => {
      const vol = Math.min(1, Math.max(0, v));
      set({ volume: vol, isMuted: vol > 0 ? false : get().isMuted });
    },

    toggleMute: () => set({ isMuted: !get().isMuted }),

    seek: (t) => {
      // M1: mock seek sets currentTime directly (the rAF loop continues from here).
      // M2: usePlayer will route this to audioEl.currentTime instead.
      const { duration } = get();
      set({ currentTime: Math.min(duration || 0, Math.max(0, t)) });
    },

    setView: (view) => set({ view }),
    setSelectedAlbum: (selectedAlbumId) => set({ selectedAlbumId }),
    setTheme: (theme) => set({ theme }),
    toggleTheme: () => set({ theme: get().theme === 'dark-neon' ? 'light-minimal' : 'dark-neon' }),
    setLanguage: (language) => set({ language }),

    _setIsPlaying: (isPlaying) => set({ isPlaying }),
    _setCurrentTime: (currentTime) => set({ currentTime }),
    _setDuration: (duration) => {
      if (get().duration !== duration) set({ duration });
    },

    // Auto-advance at end of track — the ONLY place repeat 'one' replays.
    _handleTrackEnded: () => {
      const { queue, queueIndex, repeat } = get();
      if (queue.length === 0) return;
      if (repeat === 'one') {
        set({ currentTime: 0, isPlaying: true });
        return;
      }
      if (repeat === 'all') {
        const i = (queueIndex + 1) % queue.length;
        loadTrack(queue[i], i, true);
        return;
      }
      // repeat 'off'
      const i = queueIndex + 1;
      if (i < queue.length) {
        loadTrack(queue[i], i, true);
      } else {
        set({ isPlaying: false }); // queue finished; stay on last track
      }
    },
  };
};
