import { Slider } from '@/components/Slider';
import { formatTime } from '@/lib/audio/formatTime';
import { usePlayerStore } from '@/store/usePlayerStore';

/** Seekable progress bar + time labels. Re-renders per tick (currentTime) — that
 *  high-frequency subscription is intentionally confined to this component. */
export function ProgressBar() {
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const seek = usePlayerStore((s) => s.seek);

  return (
    <div className="w-full">
      <Slider
        value={currentTime}
        max={duration || 0}
        step={0.1}
        onChange={seek}
        ariaLabel="Seek"
        ariaValueText={`${formatTime(currentTime)} of ${formatTime(duration)}`}
      />
      <div className="mt-2 flex justify-between font-mono text-xs text-muted tabular-nums">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
