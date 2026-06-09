# LP Record Player — Design Spec

_Date: 2026-06-09 · Status: approved, M0 implemented_

## Context

A vinyl/LP music player web app, built purely as a **frontend portfolio piece**. Web only (no mobile app). Design and animation polish are the top priority. Two reference looks inspired the direction: a **dark neon** desktop dashboard (magenta/cyan, spinning vinyl, "Up Next" queue) and a **light minimal** skeuomorphic turntable (cream, realistic black vinyl + tonearm). Rather than pick one, the app ships **both as a live theme toggle** — the differentiator that shows design range.

## Locked decisions

| Area            | Decision                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------- |
| Design          | Dual theme toggle — **Dark Neon ⇄ Light Minimal**                                              |
| Stack           | React 19 · TypeScript 6 · Vite 8 · Tailwind CSS v4                                             |
| State           | Zustand 5, single store, no router                                                             |
| Animation       | Motion + GSAP + CSS + Web Audio API                                                            |
| Features        | Real playback, sound-reactive visualizer, queue, LP spin + tonearm, shuffle/repeat/seek/volume |
| Screens         | Library grid + Player, with a shared-element transition between them                           |
| i18n            | EN/KO toggle, UI labels only (titles never translated)                                         |
| Assets          | Bundled royalty-free audio + cover art (see `CREDITS.md`)                                      |
| Deploy          | Vercel default; GitHub Pages fallback                                                          |
| Package manager | pnpm                                                                                           |

## Visual direction

Two complete identities, selected by `data-theme` on `<html>` and expressed entirely through design tokens (`src/theme/tokens.css`):

| Token             | Light Minimal                           | Dark Neon                          |
| ----------------- | --------------------------------------- | ---------------------------------- |
| bg / surface      | cream `#faf8f4` / white                 | near-black `#07070d` / `#12121f`   |
| text / muted      | `#1a1a1a` / `#6b6b6b`                   | `#f5f5ff` / `#9a9ab5`              |
| accent / accent-2 | charcoal `#2b2b2b` / warm tan `#b89b74` | magenta `#ff006e` / cyan `#00e5ff` |
| display font      | Poppins                                 | Space Grotesk                      |
| radii / shadow    | soft (16px) / drop shadow               | sharp (8px) / neon glow            |

Per-album `accent` (from `tracks.json`) overrides `--accent` on the player root at runtime so the disc/visualizer glow matches the cover.

## Data model

`Track { id, title, artist, albumId, src, srcFallback?, duration, attribution? }`,
`Album { id, title, artist, year, cover, accent, trackIds[] }`,
`MusicData { albums[], tracks[] }` — normalized, joined by id. Defined in `src/types/music.ts`; data in `src/data/tracks.json` (imported and cast to `MusicData`).

## State management

One Zustand store (`usePlayerStore`). The store holds **intent + display**; the audio engine holds **playback reality** and reports back via native media events only. Persist (via `partialize`) just `theme`, `language`, `volume`, `shuffle`, `repeat`. Intent actions: `playAlbum, playTrackAt, togglePlay, next, prev, toggleShuffle, cycleRepeat, setVolume, toggleMute, setView, setTheme, toggleTheme, setLanguage`. Engine-only (`_`-prefixed) setters: `_setIsPlaying, _setCurrentTime, _setDuration, _handleTrackEnded`.

## Audio engine

Node graph: `<audio crossorigin="anonymous">` → `MediaElementAudioSourceNode` (built once) → `GainNode` (volume/mute) → `AnalyserNode` (`fftSize 256`, `getByteFrequencyData`) → `destination`. Encapsulated in `AudioEngine` (`src/lib/audio/`); wired by `usePlayer`. `useAudioVisualizer` runs a `requestAnimationFrame` loop reading the analyser straight to canvas — never into React state.

**Handled pitfalls:** autoplay policy (create/resume in a user gesture), single `MediaElementSource` per element (swap `.src`, not the node), CORS (same-origin `public/` audio), volume via `GainNode`, rAF cleanup on unmount.

## Animation inventory

| Element                       | Tool                            | Note                                                              |
| ----------------------------- | ------------------------------- | ----------------------------------------------------------------- |
| Vinyl spin (pausable)         | GSAP timeline                   | accumulating rotation; `pause()`/`play()` resume from exact angle |
| Tonearm on/off                | Motion spring                   | rotate about pivot, synced to `isPlaying`                         |
| Play/pause morph, hover/press | Motion                          | `AnimatePresence`, `whileHover`/`whileTap`                        |
| Progress fill                 | CSS `scaleX`                    | reactive to `currentTime`, transform-only                         |
| Visualizer                    | Web Audio + canvas (rAF)        | neon bars (dark) / subtle bars (light)                            |
| Grid → player                 | Motion shared layout `layoutId` | cover → disc center                                               |
| Theme cross-fade              | CSS token transition            | 300ms, reduced-motion gated                                       |
| Grid entrance                 | Motion stagger                  | fade/translate-up                                                 |

All gated by `usePrefersReducedMotion` + a global CSS reduced-motion backstop.

## Component tree

```
App  (hidden <audio>, usePlayer, useMediaKeyboard)
 ├─ ThemeProvider (applies data-theme)
 ├─ header: ThemeToggle, LanguageToggle
 └─ AnimatePresence (store.view)
     ├─ LibraryView → AlbumGrid → AlbumCard (layoutId cover)
     └─ PlayerView (injects --accent)
         ├─ TurntableDisc (GSAP spin, cover = layoutId target) → Tonearm
         ├─ Visualizer (canvas) · TrackInfo (aria-live) · ProgressBar
         ├─ Controls (prev/play/next/shuffle/repeat) · VolumeControl · UpNextQueue
```

Shared presentational: `ThemeToggle`, `LanguageToggle`, `IconButton`, `Slider` (one accessible range used by progress + volume).

## Accessibility

- **Reduced motion:** disc static, tonearm instant, visualizer paused, shared transition → cross-fade; app stays fully functional and attractive with all motion off.
- **Keyboard:** Space/Enter = play/pause, ←/→ = prev/next, Ctrl+←/→ = seek ∓5s, ↑/↓ = volume ±5%, M/S/R = mute/shuffle/repeat. Ignored when focus is in an input.
- **ARIA:** player `role=region`; play `aria-pressed`; native `<input type=range>` with `aria-value*`; `TrackInfo` `aria-live=polite`; decorative canvas/disc `aria-hidden`. WCAG AA contrast verified in both themes.

## Roadmap

| Milestone | Goal                                  | Verification                                                                       |
| --------- | ------------------------------------- | ---------------------------------------------------------------------------------- |
| ✅ M0     | Scaffold, tooling, token bridge, docs | `pnpm dev` styled page; lint + typecheck + test + build green                      |
| M1        | Core player UI + store (mock audio)   | play advances mock progress; next/prev/shuffle/repeat correct (+ store unit tests) |
| M2        | Web Audio engine — real playback      | track plays; seek/volume; `AudioContext` running; one `createMediaElementSource`   |
| M3        | Visualizer + vinyl/tonearm            | bars react; pause freezes disc angle, resume continues; tonearm lifts              |
| M4        | Dual theme live                       | toggle flips whole look smoothly; persists; no FOUC                                |
| M5        | Library + transition                  | album select animates cover into disc + plays; back returns to grid                |
| M6        | i18n, a11y, assets, polish, deploy    | EN/KO toggle; keyboard-only; reduce-motion path; Lighthouse a11y ≥ 95; live URL    |

## Risks & mitigations

Autoplay/suspended context → create/resume in gesture + "click to start" fallback · CORS zeros → local audio + `crossorigin` · Tailwind v4 CSS-first is new → minimal token bridge, validated early, version pinned · visualizer + GSAP jank → transform/opacity only, canvas off the React tree, profile at 60fps · audio payload (~8 MB) → Opus + MP3 fallback, WebP covers, lazy-load on selection · heavy motion vs a11y → full reduced-motion path · licensing → `CREDITS.md` from day one, prefer no-attribution sources.
