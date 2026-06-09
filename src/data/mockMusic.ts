import type { MusicData } from '@/types/music';

/**
 * M2 catalog backed by real bundled audio (SoundHelix — free to use, no attribution
 * required; see CREDITS.md). `src` is stored RELATIVE and resolved against
 * import.meta.env.BASE_URL in usePlayer, so it works on both Vercel ("/") and
 * GitHub Pages ("/lpRecord/"). `duration` is an estimate (192 kbps file size);
 * the real value is confirmed at runtime via `loadedmetadata`.
 *
 * Five audio files are reused across the catalog (consecutive tracks within an
 * album differ). Album covers stay gradient sentinels — real cover art is M6.
 */
const ATTRIBUTION = 'SoundHelix — free to use (soundhelix.com)';

export const mockMusic: MusicData = {
  albums: [
    {
      id: 'a1',
      title: 'Neon Drift',
      artist: 'VHS Dreams',
      year: 2021,
      accent: '#ff006e',
      cover: 'gradient:#ff006e,#7a00ff',
      trackIds: ['t1', 't2', 't3'],
    },
    {
      id: 'a2',
      title: 'Cassette Sunset',
      artist: 'Lo-Fi Coast',
      year: 2019,
      accent: '#00e5ff',
      cover: 'gradient:#00e5ff,#0066ff',
      trackIds: ['t4', 't5', 't6', 't7'],
    },
    {
      id: 'a3',
      title: 'Paper Moon',
      artist: 'Aria Vale',
      year: 2023,
      accent: '#f0b67f',
      cover: 'gradient:#f0d8a8,#3a2f22',
      trackIds: ['t8', 't9', 't10'],
    },
    {
      id: 'a4',
      title: 'Single Spin',
      artist: 'Mono',
      year: 2024,
      accent: '#9b5de5',
      cover: 'gradient:#9b5de5,#241633',
      trackIds: ['t11'],
    },
  ],
  tracks: [
    {
      id: 't1',
      title: 'Midnight Coast',
      artist: 'VHS Dreams',
      albumId: 'a1',
      src: 'audio/soundhelix-1.mp3',
      duration: 373,
      attribution: ATTRIBUTION,
    },
    {
      id: 't2',
      title: 'Chrome Hearts',
      artist: 'VHS Dreams',
      albumId: 'a1',
      src: 'audio/soundhelix-2.mp3',
      duration: 426,
      attribution: ATTRIBUTION,
    },
    {
      id: 't3',
      title: 'After Hours',
      artist: 'VHS Dreams',
      albumId: 'a1',
      src: 'audio/soundhelix-3.mp3',
      duration: 344,
      attribution: ATTRIBUTION,
    },
    {
      id: 't4',
      title: 'Ocean Drive',
      artist: 'Lo-Fi Coast',
      albumId: 'a2',
      src: 'audio/soundhelix-4.mp3',
      duration: 302,
      attribution: ATTRIBUTION,
    },
    {
      id: 't5',
      title: 'Palm Shadows',
      artist: 'Lo-Fi Coast',
      albumId: 'a2',
      src: 'audio/soundhelix-5.mp3',
      duration: 354,
      attribution: ATTRIBUTION,
    },
    {
      id: 't6',
      title: 'Slow Tide',
      artist: 'Lo-Fi Coast',
      albumId: 'a2',
      src: 'audio/soundhelix-1.mp3',
      duration: 373,
      attribution: ATTRIBUTION,
    },
    {
      id: 't7',
      title: 'Golden Hour',
      artist: 'Lo-Fi Coast',
      albumId: 'a2',
      src: 'audio/soundhelix-2.mp3',
      duration: 426,
      attribution: ATTRIBUTION,
    },
    {
      id: 't8',
      title: 'Paper Moon',
      artist: 'Aria Vale',
      albumId: 'a3',
      src: 'audio/soundhelix-3.mp3',
      duration: 344,
      attribution: ATTRIBUTION,
    },
    {
      id: 't9',
      title: 'Velvet',
      artist: 'Aria Vale',
      albumId: 'a3',
      src: 'audio/soundhelix-4.mp3',
      duration: 302,
      attribution: ATTRIBUTION,
    },
    {
      id: 't10',
      title: 'Lanterns',
      artist: 'Aria Vale',
      albumId: 'a3',
      src: 'audio/soundhelix-5.mp3',
      duration: 354,
      attribution: ATTRIBUTION,
    },
    {
      id: 't11',
      title: 'One Take',
      artist: 'Mono',
      albumId: 'a4',
      src: 'audio/soundhelix-1.mp3',
      duration: 373,
      attribution: ATTRIBUTION,
    },
  ],
};
