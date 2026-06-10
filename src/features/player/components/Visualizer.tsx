import { useRef } from 'react';
import clsx from 'clsx';
import { useAudioVisualizer } from '@/hooks/useAudioVisualizer';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { selectCurrentAlbum } from '@/store/selectors';
import { usePlayerStore } from '@/store/usePlayerStore';

interface VisualizerProps {
  className?: string;
}

/** Decorative radial spectrum ring around the turntable. Reactive to the audio
 *  analyser (published into the store by usePlayer), the per-album accent, and
 *  the theme. Static when idle/reduced.
 *
 *  A wrapper div takes the sizing/positioning (`className`); the canvas fills it
 *  100% — a bare <canvas> with insets would keep its intrinsic 300x150 box. */
export function Visualizer({ className }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyser = usePlayerStore((s) => s.analyserNode);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const album = usePlayerStore(selectCurrentAlbum);
  // Cover-extracted accent (cached by useCoverAccent) so the canvas matches the UI's
  // --accent; falls back to the album's static accent (gradient dummies).
  const coverAccent = usePlayerStore((s) => (album ? s.coverAccents[album.id] : undefined));
  const theme = usePlayerStore((s) => s.theme);
  const reduced = usePrefersReducedMotion();
  const isDark = theme === 'dark-neon';

  useAudioVisualizer({
    canvasRef,
    analyser,
    enabled: isPlaying && analyser != null && !reduced,
    // dark: per-album accent + glow; light: quiet charcoal ring (matches the
    // light-minimal --accent token), no glow.
    accent: isDark ? (coverAccent ?? album?.accent ?? '#ff006e') : '#2b2b2b',
    glow: isDark,
  });

  return (
    <div aria-hidden="true" className={clsx('pointer-events-none', className)}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
