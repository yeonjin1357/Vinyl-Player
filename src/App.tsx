import { useEffect, useRef } from 'react';
import { music } from '@/data/music';
import { usePlayer } from '@/hooks/usePlayer';
import { PlayerView } from '@/features/player/PlayerView';
import { usePlayerStore } from '@/store/usePlayerStore';

export default function App() {
  // The hidden <audio> is owned by React (declarative crossOrigin, DOM-resident,
  // StrictMode-safe) and driven imperatively by usePlayer.
  const audioRef = useRef<HTMLAudioElement>(null);
  usePlayer(audioRef);

  const currentTrackId = usePlayerStore((s) => s.currentTrackId);
  const playAlbum = usePlayerStore((s) => s.playAlbum);

  // Load the first album (paused) so the player has content on first paint.
  useEffect(() => {
    if (currentTrackId == null && music.albums.length > 0) {
      playAlbum(music.albums[0].id, undefined, false);
    }
  }, [currentTrackId, playAlbum]);

  return (
    <>
      {/* crossOrigin="anonymous" + same-origin audio keeps the analyser un-tainted (M3). */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- music player; captions N/A */}
      <audio ref={audioRef} hidden crossOrigin="anonymous" preload="metadata" />
      <PlayerView />
    </>
  );
}
