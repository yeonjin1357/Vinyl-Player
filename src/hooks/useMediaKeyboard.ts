import { useEffect } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';

const VOLUME_STEP = 0.05;

/** Skip when a typing/native control is focused so its own behavior wins. */
function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  // `input` matches range sliders too → focused volume/seek keeps native arrows.
  return el.matches('input, textarea, select, [contenteditable], [contenteditable=""]');
}

/**
 * Global media keyboard shortcuts. Mounted once (App). Playback keys act whenever
 * a track is loaded, in any view. StrictMode-safe (add/remove in effect).
 *   Space/Enter = play/pause · ←/→ = prev/next · ↑/↓ = volume · M/S/R = mute/shuffle/repeat
 */
export function useMediaKeyboard(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return; // don't shadow app/OS shortcuts
      if (isTypingTarget(e.target)) return;

      const s = usePlayerStore.getState();
      const hasTrack = s.currentTrackId != null;
      const onButton = e.target instanceof HTMLElement && e.target.closest('button') != null;

      switch (e.code) {
        case 'Space':
        case 'Enter':
          if (onButton) return; // let the focused button activate itself
          if (!hasTrack) return;
          e.preventDefault(); // Space: no page scroll
          s.togglePlay();
          break;
        case 'ArrowLeft':
          if (!hasTrack) return;
          e.preventDefault();
          s.prev();
          break;
        case 'ArrowRight':
          if (!hasTrack) return;
          e.preventDefault();
          s.next();
          break;
        case 'ArrowUp':
          e.preventDefault(); // no scroll
          s.setVolume(s.volume + VOLUME_STEP);
          break;
        case 'ArrowDown':
          e.preventDefault();
          s.setVolume(s.volume - VOLUME_STEP);
          break;
        case 'KeyM':
          s.toggleMute();
          break;
        case 'KeyS':
          s.toggleShuffle();
          break;
        case 'KeyR':
          s.cycleRepeat();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
