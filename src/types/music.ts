/** A single playable track. `title`/`artist` are display data and are never translated. */
export interface Track {
  id: string;
  title: string;
  artist: string;
  albumId: string;
  /** Primary source, served from /public (same-origin, required for the Web Audio analyser). */
  src: string;
  /** Optional fallback codec (e.g. .mp3 when src is .opus). */
  srcFallback?: string;
  /** Seconds. Metadata hint; confirmed at runtime via `loadedmetadata`. */
  duration: number;
  /** License credit line, surfaced in CREDITS.md / in-app credits. */
  attribution?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number;
  cover: string;
  /** Dominant hex; injected as --accent on the player root so UI/glow matches the cover. */
  accent: string;
  /** Ordered track ids belonging to this album. */
  trackIds: string[];
}

export interface MusicData {
  albums: Album[];
  tracks: Track[];
}
