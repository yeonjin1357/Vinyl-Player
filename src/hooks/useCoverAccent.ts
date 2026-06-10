import { useEffect } from 'react';
import type { Album } from '@/types/music';
import { extractCoverAccent } from '@/lib/color/extractAccent';
import { resolveAssetUrl } from '@/lib/resolveAssetUrl';
import { usePlayerStore } from '@/store/usePlayerStore';

const isImageCover = (cover: string) => !cover.startsWith('gradient:');

/**
 * For the current album, extract a representative accent from its cover image once
 * and cache it in the store, so PlayerView's `--accent` and the canvas Visualizer
 * read the SAME value. Gradient dummies are skipped — they keep their static accent.
 * Returns the effective accent (cached extract → else the album's own accent).
 */
export function useCoverAccent(album: Album | undefined): string | undefined {
  const id = album?.id;
  const cached = usePlayerStore((s) => (id ? s.coverAccents[id] : undefined));
  const setCoverAccent = usePlayerStore((s) => s._setCoverAccent);

  useEffect(() => {
    if (!album || cached || !isImageCover(album.cover)) return;
    let active = true;
    void extractCoverAccent(resolveAssetUrl(album.cover)).then((hex) => {
      if (active && hex) setCoverAccent(album.id, hex);
    });
    return () => {
      active = false;
    };
  }, [album, cached, setCoverAccent]);

  return cached ?? album?.accent;
}
