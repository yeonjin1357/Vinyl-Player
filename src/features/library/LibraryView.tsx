import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { AlbumGrid } from './components/AlbumGrid';

export function LibraryView() {
  const { t } = useTranslation();
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
        <div className="font-display text-xl font-extrabold tracking-tight whitespace-nowrap">
          VINYL<span className="text-accent"> PLAYER</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <section aria-label={t('a11y.albumLibrary')} className="flex flex-col gap-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">{t('library.title')}</h1>
        <AlbumGrid />
      </section>
    </motion.main>
  );
}
