import type { Album, MusicData, Track } from '@/types/music';
import { mockMusic } from './mockMusic';

/**
 * The active dataset. M1 uses bundled mock data; in M6 this switches to the real
 * `tracks.json` (one-line change here) without touching the store or components.
 */
export const music: MusicData = mockMusic;

export const getTrackById = (id: string): Track | undefined =>
  music.tracks.find((t) => t.id === id);

export const getAlbumById = (id: string): Album | undefined =>
  music.albums.find((a) => a.id === id);
