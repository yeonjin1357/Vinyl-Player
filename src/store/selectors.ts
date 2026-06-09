import type { Album, Track } from '@/types/music';
import { getAlbumById, getTrackById } from '@/data/music';
import type { PlayerState } from './storeFactory';

/**
 * Derived selectors join the id-only store state with the static dataset.
 * Because the dataset is static, `selectCurrentTrack` returns the SAME object
 * reference while `currentTrackId` is unchanged — so a component subscribed via
 * this selector does NOT re-render on every `currentTime` tick.
 */
export const selectCurrentTrack = (s: PlayerState): Track | undefined =>
  s.currentTrackId ? getTrackById(s.currentTrackId) : undefined;

export const selectCurrentAlbum = (s: PlayerState): Album | undefined => {
  const track = selectCurrentTrack(s);
  return track ? getAlbumById(track.albumId) : undefined;
};

/** Tracks after the current position in the live queue (for "Up Next"). */
export const selectUpNext = (s: PlayerState): Track[] =>
  s.queue
    .slice(s.queueIndex + 1)
    .map(getTrackById)
    .filter((t): t is Track => t != null);

/** Progress fraction 0..1, guarded against zero/over-run. */
export const selectProgress = (s: PlayerState): number =>
  s.duration > 0 ? Math.min(s.currentTime / s.duration, 1) : 0;
