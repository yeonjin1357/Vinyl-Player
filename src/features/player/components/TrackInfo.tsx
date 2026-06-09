import { selectCurrentAlbum, selectCurrentTrack } from '@/store/selectors';
import { usePlayerStore } from '@/store/usePlayerStore';

/** Current track title/artist/album. Subscribes to the track (stable ref) so it
 *  does NOT re-render on every currentTime tick. */
export function TrackInfo() {
  const track = usePlayerStore(selectCurrentTrack);
  const album = usePlayerStore(selectCurrentAlbum);
  if (!track) return null;

  return (
    <div aria-live="polite">
      <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl">
        {track.title}
      </h1>
      <p className="mt-3 text-lg font-semibold text-accent">{track.artist}</p>
      {album && (
        <p className="mt-1 text-sm tracking-wide text-muted uppercase">
          {album.title} · {album.year}
        </p>
      )}
    </div>
  );
}
