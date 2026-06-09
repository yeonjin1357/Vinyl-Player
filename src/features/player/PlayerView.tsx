import type { CSSProperties } from 'react';
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

  // Per-album accent: overrides --accent for the whole player subtree so the
  // disc glow, badges and controls match the cover.
  const accentStyle = album ? ({ '--accent': album.accent } as CSSProperties) : undefined;

  return (
    <main
      style={accentStyle}
      className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-10 px-6 py-8 sm:px-10"
    >
      <header className="flex items-center justify-between">
        <div className="font-display text-xl font-extrabold tracking-tight">
          VINYL<span className="text-accent"> PLAYER</span>
        </div>
        {isPlaying && (
          <span className="flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-widest text-white uppercase">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            Playing
          </span>
        )}
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
