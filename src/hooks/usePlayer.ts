import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { getTrackById } from '@/data/music';
import { getAudioEngine, type AudioEngine } from '@/lib/audio/AudioEngine';
import { resolveAssetUrl } from '@/lib/resolveAssetUrl';
import { usePlayerStore } from '@/store/usePlayerStore';

export interface UsePlayerResult {
  /** The graph's AnalyserNode (for the M3 visualizer). Null until first play attaches the engine. */
  analyser: AnalyserNode | null;
}

/**
 * The real audio driver (replaces useMockPlayer). Mounted once at the app root.
 * Drives a hidden <audio> element from store intent and is the ONLY caller of the
 * engine-only (`_`-prefixed) store setters — via native media events. The store
 * and all UI components are unchanged from M1.
 */
export function usePlayer(audioRef: RefObject<HTMLAudioElement | null>): UsePlayerResult {
  const currentTrackId = usePlayerStore((s) => s.currentTrackId);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);

  const engineRef = useRef<AudioEngine | null>(null);
  // Invalidates a play() promise interrupted by load()/pause() (AbortError suppression).
  const playTokenRef = useRef(0);

  const safePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    const token = ++playTokenRef.current;
    void el.play().catch((err: unknown) => {
      const name = err instanceof DOMException ? err.name : '';
      if (name === 'AbortError') return; // interrupted by a new load()/pause() — expected
      // Autoplay blocked etc. — reflect reality so the UI doesn't show a phantom "playing".
      if (token === playTokenRef.current) usePlayerStore.getState()._setIsPlaying(false);
    });
  }, [audioRef]);

  // A. Native media events -> store (the ONLY reality-in path).
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onPlay = () => usePlayerStore.getState()._setIsPlaying(true);
    const onPause = () => usePlayerStore.getState()._setIsPlaying(false);
    const onTimeUpdate = () => usePlayerStore.getState()._setCurrentTime(el.currentTime);
    const onLoadedMetadata = () => {
      if (Number.isFinite(el.duration)) usePlayerStore.getState()._setDuration(el.duration);
    };
    const onEnded = () => {
      const before = usePlayerStore.getState().currentTrackId;
      usePlayerStore.getState()._handleTrackEnded();
      const after = usePlayerStore.getState();
      // repeat-one keeps the same track playing: rewind + replay the same element.
      // Track CHANGES are handled by effect B (currentTrackId dep).
      if (after.currentTrackId === before && after.isPlaying) {
        el.currentTime = 0;
        safePlay();
      }
    };
    const onError = () => {
      if (import.meta.env.DEV) console.warn('[usePlayer] media error', el.error);
      usePlayerStore.getState()._setIsPlaying(false);
    };

    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('loadedmetadata', onLoadedMetadata);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onError);

    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('loadedmetadata', onLoadedMetadata);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onError);
    };
  }, [audioRef, safePlay]);

  // B. currentTrackId -> set src, load, (re)play if intent says so. Only place .src is touched.
  useEffect(() => {
    const el = audioRef.current;
    if (!el || currentTrackId == null) return;
    const track = getTrackById(currentTrackId);
    if (!track?.src) return;

    el.src = resolveAssetUrl(track.src); // resets currentTime to 0 naturally
    el.load();
    if (usePlayerStore.getState().isPlaying) safePlay();
  }, [currentTrackId, audioRef, safePlay]);

  // C. isPlaying -> play()/pause(); first play attaches + resumes the engine (in-gesture).
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    if (isPlaying) {
      if (!engineRef.current) {
        const engine = getAudioEngine();
        engine.attach(el); // once-per-element, built-guarded (StrictMode safe)
        const { isMuted: m, volume: v } = usePlayerStore.getState();
        engine.setGain(m ? 0 : v);
        engineRef.current = engine;
        usePlayerStore.setState({ analyserNode: engine.analyser }); // publish for the visualizer
        if (import.meta.env.DEV) {
          (window as unknown as { __lpEngine?: AudioEngine }).__lpEngine = engine;
        }
      }
      void engineRef.current.resume();
      safePlay();
    } else {
      el.pause();
      playTokenRef.current += 1; // invalidate any in-flight play()
    }
  }, [isPlaying, audioRef, safePlay]);

  // D. volume / isMuted -> GainNode (effective volume = isMuted ? 0 : volume).
  useEffect(() => {
    engineRef.current?.setGain(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  // E. seek override: route store.seek through the audio element. Transparent to ProgressBar.
  useEffect(() => {
    const realSeek = (t: number) => {
      const el = audioRef.current;
      const { duration } = usePlayerStore.getState();
      const clamped = Math.min(duration || 0, Math.max(0, t));
      if (el && Number.isFinite(el.duration)) el.currentTime = clamped;
      usePlayerStore.getState()._setCurrentTime(clamped); // optimistic; timeupdate confirms
    };
    const prevSeek = usePlayerStore.getState().seek; // capture ORIGINAL, never our own override
    usePlayerStore.setState({ seek: realSeek });
    return () => {
      usePlayerStore.setState({ seek: prevSeek });
    };
  }, [audioRef]);

  return { analyser: engineRef.current?.analyser ?? null };
}
