import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getTrackById } from '@/data/music';

/**
 * M1 mock-audio driver. Plays the exact role M2's `usePlayer` will play: while
 * `isPlaying`, advances `currentTime` by wall-clock delta toward `duration`,
 * sets `duration` on track change, and calls `_handleTrackEnded` at the end.
 *
 * It is the ONLY caller of the engine-only (`_`-prefixed) store setters in M1,
 * so replacing it with the real audio hook in M2 is a drop-in — the store and
 * UI are untouched.
 */
export function useMockPlayer(): void {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTrackId = usePlayerStore((s) => s.currentTrackId);

  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  // Track change → set duration from metadata; reset the clock baseline.
  // (Mirrors M2's `loadedmetadata` → _setDuration.)
  useEffect(() => {
    if (currentTrackId == null) return;
    const track = getTrackById(currentTrackId);
    if (track) usePlayerStore.getState()._setDuration(track.duration);
    lastTsRef.current = null;
  }, [currentTrackId]);

  // The ticking loop, gated on isPlaying.
  useEffect(() => {
    if (!isPlaying) {
      lastTsRef.current = null; // freeze; next play recomputes baseline
      return;
    }

    const tick = (ts: number) => {
      const last = lastTsRef.current;
      lastTsRef.current = ts;

      if (last != null) {
        const dt = (ts - last) / 1000; // seconds, wall-clock
        const s = usePlayerStore.getState();
        const duration = s.duration || 0;
        const nextTime = s.currentTime + dt;

        if (duration > 0 && nextTime >= duration) {
          s._setCurrentTime(duration); // pin to exact end
          s._handleTrackEnded(); // store decides advance / wrap / stop / replay
          lastTsRef.current = null; // fresh baseline for whatever plays next
          // Keep the loop alive across repeat-one / auto-advance (where neither
          // effect re-fires because isPlaying/currentTrackId may be unchanged).
          rafRef.current = usePlayerStore.getState().isPlaying ? requestAnimationFrame(tick) : null;
          return;
        }
        s._setCurrentTime(nextTime);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isPlaying]);
}
