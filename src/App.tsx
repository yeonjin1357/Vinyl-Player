import { useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { usePlayer } from '@/hooks/usePlayer';
import { useMediaKeyboard } from '@/hooks/useMediaKeyboard';
import { useLanguage } from '@/i18n/useLanguage';
import { LibraryView } from '@/features/library/LibraryView';
import { PlayerView } from '@/features/player/PlayerView';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useTheme } from '@/theme/useTheme';

export default function App() {
  // The hidden <audio> + engine + theme live OUTSIDE AnimatePresence so they never
  // unmount across view changes (playback and the Web Audio graph must persist).
  const audioRef = useRef<HTMLAudioElement>(null);
  usePlayer(audioRef);
  useTheme();
  useLanguage(); // store.language -> i18next + <html lang>
  useMediaKeyboard(); // global media keyboard shortcuts

  const view = usePlayerStore((s) => s.view);

  return (
    <>
      {/* crossOrigin="anonymous" + same-origin audio keeps the analyser un-tainted. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- music player; captions N/A */}
      <audio ref={audioRef} hidden crossOrigin="anonymous" preload="metadata" />

      {/* popLayout (not "wait") so the source + target share-layout covers coexist
          for the grid↔disc morph; non-shared content crossfades. */}
      <AnimatePresence mode="popLayout" initial={false}>
        {view === 'library' ? <LibraryView key="library" /> : <PlayerView key="player" />}
      </AnimatePresence>
    </>
  );
}
