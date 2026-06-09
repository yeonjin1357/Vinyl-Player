import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { formatTime } from '@/lib/audio/formatTime';
import { selectQueueTracks } from '@/store/selectors';
import { usePlayerStore } from '@/store/usePlayerStore';

/** Three little equalizer bars marking the current track (animated while playing). */
function NowPlayingBars({ animate }: { animate: boolean }) {
  return (
    <span aria-hidden="true" className="flex h-4 w-6 items-end justify-center gap-[2px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={clsx('w-[3px] origin-bottom rounded-sm bg-accent', animate && 'eq-bar')}
          style={{
            height: '100%',
            animationDelay: `${i * 0.15}s`,
            transform: animate ? undefined : 'scaleY(0.4)',
          }}
        />
      ))}
    </span>
  );
}

/** The current album's full track list. The playing track is highlighted; any row
 *  is clickable to jump to it. */
export function TrackList() {
  const { t } = useTranslation();
  const tracks = usePlayerStore(useShallow(selectQueueTracks));
  const currentTrackId = usePlayerStore((s) => s.currentTrackId);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrackAt = usePlayerStore((s) => s.playTrackAt);

  if (tracks.length === 0) return null;

  return (
    <section aria-label={t('a11y.tracksList')}>
      <h2 className="mb-3 text-xs font-semibold tracking-[0.3em] text-muted uppercase">
        {t('library.tracksHeading')}
      </h2>
      <ul className="flex flex-col">
        {tracks.map((track, i) => {
          const current = track.id === currentTrackId;
          return (
            <li key={track.id}>
              <button
                type="button"
                onClick={() => playTrackAt(i)}
                aria-current={current ? 'true' : undefined}
                className={clsx(
                  'flex w-full items-center gap-4 rounded-card px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent',
                  current ? 'bg-surface' : 'hover:bg-surface',
                )}
              >
                <span className="grid w-6 place-items-center font-mono text-sm text-muted tabular-nums">
                  {current ? (
                    <NowPlayingBars animate={isPlaying} />
                  ) : (
                    String(i + 1).padStart(2, '0')
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={clsx('block truncate font-semibold', current && 'text-accent')}>
                    {track.title}
                  </span>
                  <span className="block truncate text-sm text-muted">{track.artist}</span>
                </span>
                <span className="font-mono text-xs text-muted tabular-nums">
                  {formatTime(track.duration)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
