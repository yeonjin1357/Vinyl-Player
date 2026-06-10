import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@/components/IconButton';
import { BackIcon } from '@/components/icons';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useCoverAccent } from '@/hooks/useCoverAccent';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { selectCurrentAlbum } from '@/store/selectors';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Controls } from './components/Controls';
import { ProgressBar } from './components/ProgressBar';
import { TrackInfo } from './components/TrackInfo';
import { TrackList } from './components/TrackList';
import { TurntableDisc } from './components/TurntableDisc';
import { VolumeControl } from './components/VolumeControl';

export function PlayerView() {
  const { t } = useTranslation();
  const album = usePlayerStore(selectCurrentAlbum);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const theme = usePlayerStore((s) => s.theme);
  const setView = usePlayerStore((s) => s.setView);
  const reduced = usePrefersReducedMotion();

  // Accent extracted from the cover at runtime (falls back to the album's own accent
  // for gradient dummies). Per-album accent only in dark-neon; light-minimal stays a
  // quiet monochrome (the theme's charcoal --accent), so the two themes stay distinct.
  const accent = useCoverAccent(album);
  const accentStyle =
    accent && theme === 'dark-neon' ? ({ '--accent': accent } as CSSProperties) : undefined;

  return (
    <motion.main
      style={accentStyle}
      role="region"
      aria-label={t('a11y.playerRegion')}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduced ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-10 px-6 py-8 sm:px-10"
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconButton
            label={t('a11y.backToLibrary')}
            onClick={() => setView('library')}
            variant="ghost"
            size="sm"
          >
            <BackIcon size={18} />
          </IconButton>
          <div className="font-display text-xl font-extrabold tracking-tight whitespace-nowrap">
            VINYL<span className="text-accent"> PLAYER</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {isPlaying && (
            <span className="hidden items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-widest text-white uppercase sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              {t('player.playing')}
            </span>
          )}
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <div className="grid flex-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex justify-center">
          <TurntableDisc />
        </div>

        <div className="flex flex-col gap-7">
          <TrackInfo />
          <ProgressBar />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Controls />
            <VolumeControl />
          </div>
        </div>
      </div>

      <TrackList />
    </motion.main>
  );
}
