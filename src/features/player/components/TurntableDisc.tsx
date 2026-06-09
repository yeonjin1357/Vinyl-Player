import { useRef } from 'react';
import { AlbumCover } from '@/components/AlbumCover';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { selectCurrentAlbum } from '@/store/selectors';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useVinylSpin } from '../hooks/useVinylSpin';
import { Tonearm } from './Tonearm';
import { Visualizer } from './Visualizer';

/** The spinning LP: radial spectrum ring + black vinyl + grooves + album-art
 *  center label + tonearm. M3: GSAP accumulating-rotation tween so pause/resume
 *  keeps the exact angle; reactive radial visualizer behind the disc. */
export function TurntableDisc() {
  const album = usePlayerStore(selectCurrentAlbum);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const reduced = usePrefersReducedMotion();

  const discRef = useRef<HTMLDivElement>(null);
  useVinylSpin(discRef, isPlaying && !reduced);

  return (
    <div className="relative aspect-square w-full max-w-sm sm:max-w-md">
      {/* radial spectrum ring — decorative, behind the vinyl */}
      <Visualizer className="absolute -inset-[18%] z-0" />

      {/* vinyl base — never rotates (shadow stays put) */}
      <div className="absolute inset-0 z-10 rounded-full bg-[var(--vinyl)] shadow-card" />

      {/* spinning grooves + center label — GSAP rotates THIS node */}
      <div
        ref={discRef}
        aria-hidden="true"
        className="absolute inset-0 z-10 rounded-full will-change-transform"
      >
        <div className="absolute inset-[4%] rounded-full border border-white/[0.05]" />
        <div className="absolute inset-[12%] rounded-full border border-white/[0.05]" />
        <div className="absolute inset-[20%] rounded-full border border-white/[0.05]" />
        <div className="absolute inset-[28%] rounded-full border border-white/[0.05]" />
        {album && (
          <AlbumCover
            cover={album.cover}
            alt={`${album.title} album cover`}
            className="absolute inset-[34%] rounded-full ring-4 ring-black/30"
          />
        )}
        {/* spindle hole */}
        <div className="absolute inset-[48%] rounded-full bg-[var(--vinyl)] ring-1 ring-white/10" />
      </div>

      <Tonearm />
    </div>
  );
}
