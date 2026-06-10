import type { Album, MusicData, Track } from '@/types/music';
import { mockMusic } from './mockMusic';
import generated from './generatedAlbums.json';

/**
 * The active dataset = real albums (scanned from `public/audio/<Artist - Album>/`
 * by `pnpm gen:music` into `generatedAlbums.json`) merged AHEAD of the remaining
 * gradient dummies in `mockMusic`. So real albums lead the library grid; as each
 * dummy slot is replaced, drop it from `mockMusic`. Empty `generatedAlbums` is safe.
 */
const generatedMusic = generated as MusicData;

export const music: MusicData = {
  albums: [...generatedMusic.albums, ...mockMusic.albums],
  tracks: [...generatedMusic.tracks, ...mockMusic.tracks],
};

export const getTrackById = (id: string): Track | undefined =>
  music.tracks.find((t) => t.id === id);

export const getAlbumById = (id: string): Album | undefined =>
  music.albums.find((a) => a.id === id);
