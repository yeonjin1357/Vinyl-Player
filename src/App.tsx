import { useEffect } from 'react';
import { music } from '@/data/music';
import { useMockPlayer } from '@/hooks/useMockPlayer';
import { PlayerView } from '@/features/player/PlayerView';
import { usePlayerStore } from '@/store/usePlayerStore';

export default function App() {
  // M1: the mock engine drives currentTime from store intent. M2 swaps this for
  // the real usePlayer (audio element + Web Audio graph) — store/UI unchanged.
  useMockPlayer();

  const currentTrackId = usePlayerStore((s) => s.currentTrackId);
  const playAlbum = usePlayerStore((s) => s.playAlbum);

  // Load the first album (paused) so the player has content on first paint.
  useEffect(() => {
    if (currentTrackId == null && music.albums.length > 0) {
      playAlbum(music.albums[0].id, undefined, false);
    }
  }, [currentTrackId, playAlbum]);

  return <PlayerView />;
}
