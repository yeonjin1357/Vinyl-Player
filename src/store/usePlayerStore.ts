import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createPlayerState, type PlayerStore } from './storeFactory';

/**
 * The single global store. Only user preferences persist (theme/language/volume/
 * shuffle/repeat) — never transient playback state, so a reload never tries to
 * resume a track that has no audio loaded.
 */
export const usePlayerStore = create<PlayerStore>()(
  persist(createPlayerState, {
    name: 'lp-player',
    storage: createJSONStorage(() => localStorage),
    version: 1,
    partialize: (s) => ({
      theme: s.theme,
      language: s.language,
      volume: s.volume,
      shuffle: s.shuffle,
      repeat: s.repeat,
    }),
  }),
);
