import { useShallow } from 'zustand/react/shallow';
import { formatTime } from '@/lib/audio/formatTime';
import { selectUpNext } from '@/store/selectors';
import { usePlayerStore } from '@/store/usePlayerStore';

export function UpNextQueue() {
  const upNext = usePlayerStore(useShallow(selectUpNext));
  const queueIndex = usePlayerStore((s) => s.queueIndex);
  const playTrackAt = usePlayerStore((s) => s.playTrackAt);

  if (upNext.length === 0) return null;

  return (
    <section aria-label="Up next">
      <h2 className="mb-3 text-xs font-semibold tracking-[0.3em] text-muted uppercase">Up Next</h2>
      <ul className="flex flex-col">
        {upNext.map((track, i) => (
          <li key={track.id}>
            <button
              type="button"
              onClick={() => playTrackAt(queueIndex + 1 + i)}
              className="flex w-full items-center gap-4 rounded-card px-3 py-2.5 text-left outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className="w-6 font-mono text-sm text-muted tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{track.title}</span>
                <span className="block truncate text-sm text-muted">{track.artist}</span>
              </span>
              <span className="font-mono text-xs text-muted tabular-nums">
                {formatTime(track.duration)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
