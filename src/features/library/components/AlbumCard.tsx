import { motion, type Variants } from 'motion/react';
import type { Album } from '@/types/music';
import { AlbumCover } from '@/components/AlbumCover';
import { usePlayerStore } from '@/store/usePlayerStore';

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
};

interface AlbumCardProps {
  album: Album;
  reduced: boolean;
}

export function AlbumCard({ album, reduced }: AlbumCardProps) {
  const playAlbum = usePlayerStore((s) => s.playAlbum);
  const trackCount = album.trackIds.length;

  return (
    <motion.li variants={reduced ? undefined : item}>
      <motion.button
        type="button"
        onClick={() => playAlbum(album.id)}
        whileHover={reduced ? undefined : { y: -6 }}
        className="group flex w-full flex-col gap-3 rounded-card p-3 text-left outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="relative aspect-square w-full">
          <AlbumCover
            cover={album.cover}
            alt={`${album.title} by ${album.artist}`}
            layoutId={reduced ? undefined : `cover-${album.id}`}
            className="absolute inset-0 rounded-card shadow-card transition-shadow group-hover:shadow-[0_0_28px_var(--accent)]"
          />
        </div>
        <div className="min-w-0">
          <span className="block truncate font-semibold">{album.title}</span>
          <span className="block truncate text-sm text-muted">{album.artist}</span>
          <span className="mt-0.5 block text-xs text-muted">
            {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
          </span>
        </div>
      </motion.button>
    </motion.li>
  );
}
