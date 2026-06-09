import clsx from 'clsx';
import { AlbumCover } from '@/components/AlbumCover';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { selectCurrentAlbum } from '@/store/selectors';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Tonearm } from './Tonearm';

/** The spinning LP: black vinyl + grooves + album-art center label + tonearm.
 *  M1 uses a CSS spin (gated by isPlaying + reduced-motion); M3 swaps in GSAP. */
export function TurntableDisc() {
  const album = usePlayerStore(selectCurrentAlbum);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const reduced = usePrefersReducedMotion();
  const spinning = isPlaying && !reduced;

  return (
    <div className="relative aspect-square w-full max-w-sm sm:max-w-md">
      {/* vinyl base */}
      <div className="absolute inset-0 rounded-full bg-[var(--vinyl)] shadow-card" />

      {/* spinning grooves + center label */}
      <div
        aria-hidden="true"
        className={clsx('absolute inset-0 rounded-full', spinning && 'animate-spin-vinyl')}
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
