import { motion } from 'motion/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { AlbumGrid } from './components/AlbumGrid';

export function LibraryView() {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.main
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduced ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-10 px-6 py-8 sm:px-10"
    >
      <header className="flex items-center justify-between">
        <div className="font-display text-xl font-extrabold tracking-tight">
          VINYL<span className="text-accent"> PLAYER</span>
        </div>
        <ThemeToggle />
      </header>

      <section aria-label="Album library" className="flex flex-col gap-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Library</h1>
        <AlbumGrid />
      </section>
    </motion.main>
  );
}
