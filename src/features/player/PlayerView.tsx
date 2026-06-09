import type { CSSProperties } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { selectCurrentAlbum } from '@/store/selectors';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Controls } from './components/Controls';
import { ProgressBar } from './components/ProgressBar';
import { TrackInfo } from './components/TrackInfo';
import { TurntableDisc } from './components/TurntableDisc';
import { UpNextQueue } from './components/UpNextQueue';
import { VolumeControl } from './components/VolumeControl';

export function PlayerView() {
  const album = usePlayerStore(selectCurrentAlbum);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const theme = usePlayerStore((s) => s.theme);

  // Per-album accent only in dark-neon; light-minimal stays a quiet monochrome
  // (the theme's charcoal --accent), so the two themes feel genuinely distinct.
  const accentStyle =
    album && theme === 'dark-neon' ? ({ '--accent': album.accent } as CSSProperties) : undefined;

  return (
    <main
      style={accentStyle}
      className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-10 px-6 py-8 sm:px-10"
    >
      <header className="flex items-center justify-between">
        <div className="font-display text-xl font-extrabold tracking-tight">
          VINYL<span className="text-accent"> PLAYER</span>
        </div>
        <div className="flex items-center gap-3">
          {isPlaying && (
            <span className="flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-widest text-white uppercase">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              Playing
            </span>
          )}
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

      <UpNextQueue />
    </main>
  );
}
