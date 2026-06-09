import { motion, type Variants } from 'motion/react';
import { music } from '@/data/music';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { AlbumCard } from './AlbumCard';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const GRID = 'grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4';

export function AlbumGrid() {
  const reduced = usePrefersReducedMotion();
  const cards = music.albums.map((album) => (
    <AlbumCard key={album.id} album={album} reduced={reduced} />
  ));

  if (reduced) return <ul className={GRID}>{cards}</ul>;

  return (
    <motion.ul variants={container} initial="hidden" animate="show" className={GRID}>
      {cards}
    </motion.ul>
  );
}
