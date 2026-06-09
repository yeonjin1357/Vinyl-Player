# CLAUDE.md

Guidance for Claude Code (and developers) working in this repo.

## Project

**LP Record Player** — a dual-theme (Dark Neon ⇄ Light Minimal) vinyl music player, built as a **frontend portfolio piece**. Web only. Real audio playback, a Web Audio sound-reactive visualizer, a spinning LP + animated tonearm, a library grid that animates into the player, and EN/KO i18n. Design and animation polish are the top priority.

Full design spec: [`docs/superpowers/specs/2026-06-09-lp-player-design.md`](docs/superpowers/specs/2026-06-09-lp-player-design.md).

## Commands

```bash
pnpm dev          # Vite dev server (http://localhost:5173)
pnpm build        # tsc --noEmit (typecheck) then vite build -> dist/
pnpm preview      # serve the production build
pnpm lint         # ESLint (flat config)
pnpm lint:fix     # ESLint --fix
pnpm format       # Prettier write
pnpm typecheck    # tsc --noEmit
pnpm test         # Vitest run (once)
pnpm test:watch   # Vitest watch

# Deploy to GitHub Pages (subpath base). Vercel is the default and needs no flag.
DEPLOY_TARGET=gh-pages pnpm build
```

Always run `pnpm lint && pnpm typecheck && pnpm test` before considering a change done.

## Git workflow

**Do not commit or push automatically.** After finishing a unit of work and verifying it, report a proposed commit message to the user — they perform the commit and push themselves. Remote: `origin` → `https://github.com/yeonjin1357/Vinyl-Player.git` (branch `main`).

## Tech stack

Use `pnpm` (lockfile committed). Node ≥ 20.

| Layer     | Choice                                                                   |
| --------- | ------------------------------------------------------------------------ |
| Framework | React 19 + TypeScript 6                                                  |
| Build     | Vite 8 (`@vitejs/plugin-react`, `@tailwindcss/vite`, `vite-plugin-svgr`) |
| Styling   | Tailwind CSS v4 (CSS-first `@theme`, **no `tailwind.config.js`**)        |
| State     | Zustand 5 (single store)                                                 |
| Animation | Motion (`motion/react`) + GSAP (`@gsap/react`) + CSS + Web Audio API     |
| i18n      | i18next + react-i18next + browser-languagedetector                       |
| Test      | Vitest + Testing Library + jsdom                                         |

## Architecture

- **Single Zustand store** (`src/store/usePlayerStore.ts`) is the source of truth for **intent and display** (current track, queue, isPlaying, currentTime, volume, theme, language, view…). It is the only global state — **no router, no React Context for playback.**
- **`usePlayer` (`src/hooks/usePlayer.ts`) owns the imperative audio layer**: a single hidden `<audio>` element and the Web Audio graph. It is the source of truth for **playback reality**. It drives the element from store intent and pushes reality back into the store **only** through native media events (`play/pause/timeupdate/loadedmetadata/ended`). This one-way "reality → store via events" path prevents render-loop fights.
- **Two screens, no router.** `store.view` (`'library' | 'player'`) switches between `LibraryView` and `PlayerView` inside `<AnimatePresence>`.
- **Grid → player transition** uses Motion shared layout: the same `layoutId={`cover-${albumId}`}` on the `AlbumCard` image and the `TurntableDisc` center animates the cover into the disc.
- **Vinyl spin** is a GSAP timeline (accumulating rotation) so `pause()`/`play()` resume from the exact angle — never snaps to 0°. **Tonearm** is a Motion spring rotation synced to `isPlaying`.
- **Theming**: `data-theme` on `<html>` selects a set of runtime CSS variables in `src/theme/tokens.css`; `globals.css` bridges them into Tailwind v4 via `@theme inline` (`--bg` → `--color-bg` → `bg-bg` utility). Flipping `data-theme` restyles everything live. A FOUC-prevention inline script in `index.html` sets `data-theme` before first paint.

## Directory map

```
src/
  App.tsx                     # mounts hidden <audio>, usePlayer, view switch
  main.tsx
  store/usePlayerStore.ts     # the single store
  hooks/                      # usePlayer, useAudioVisualizer, usePrefersReducedMotion, useMediaKeyboard
  lib/audio/                  # AudioEngine (Web Audio graph), formatTime
  features/player/            # PlayerView + components/ (TurntableDisc, Tonearm, Controls, ...)
  features/library/           # LibraryView + components/ (AlbumGrid, AlbumCard)
  components/                 # shared presentational (ThemeToggle, LanguageToggle, IconButton, Slider)
  theme/                      # tokens.css (CSS vars per theme), useTheme.ts
  i18n/config.ts              # react-i18next init
  types/                      # music.ts (Track/Album), player.ts (RepeatMode/Theme/Language/View)
  data/tracks.json            # bundled, type-checked metadata (cast to MusicData)
  styles/                     # globals.css (@theme bridge + base), animations.css (keyframes + reduced-motion)
public/{audio,covers,locales} # bundled assets + runtime i18n JSON
```

## Conventions

- **Path alias `@/`** → `src/` (e.g. `import { formatTime } from '@/lib/audio/formatTime'`).
- **Consume theme tokens via Tailwind utilities** (`bg-bg`, `text-text`, `text-accent`, `bg-surface`, `text-muted`, `border-border`, `font-display`, `rounded-card`, `shadow-card`). **Never hardcode hex colors in components.** Per-album accent is injected at runtime as `style={{ '--accent': album.accent }}` on the player root.
- **`verbatimModuleSyntax` is on** — import types with `import type { Track } from '@/types/music'`.
- **Store actions prefixed with `_`** (`_setCurrentTime`, `_handleTrackEnded`, …) are **engine-only**, called by `usePlayer` in response to media events. UI components must never call them — use the intent actions (`togglePlay`, `next`, `setVolume`, …).
- **Every animation is gated by `usePrefersReducedMotion`**, with a global CSS backstop in `animations.css`.
- **Track/album titles are display data — never translate them.** i18n covers UI labels only (`common.*`, `player.*`, `library.*`, `a11y.*`).
- Subscribe with **selectors** (`usePlayerStore((s) => s.isPlaying)`) so high-frequency `currentTime` updates only re-render the progress/track-info components.

## Gotchas (Web Audio especially)

- Create/`resume()` the `AudioContext` **inside a user gesture** (the first play/album-select) — autoplay policy suspends it otherwise.
- A media element can have **exactly one** `MediaElementAudioSourceNode` for its lifetime. Build it once (guarded by a flag); change tracks by swapping `audioEl.src`, never by recreating the node.
- Audio must be **same-origin** (bundled in `public/`) with `crossorigin="anonymous"`, or the analyser silently returns zeros (CORS taint).
- Drive **volume through the `GainNode`**, not `audioEl.volume`, so it matches the analysed signal.
- **Never push per-frame visualizer data into React state** — read the analyser inside the `requestAnimationFrame` loop and draw straight to canvas; cancel the rAF on unmount.
- Set Vite **`base`** correctly per deploy target (root for Vercel, `/Vinyl-Player/` for GitHub Pages via `DEPLOY_TARGET=gh-pages`).

## Roadmap status

**✅ Complete (M0–M6).** Core player + Zustand store · real Web Audio engine · radial visualizer + GSAP vinyl spin + tonearm · dual-theme live toggle · library grid + shared-element transition · EN/KO i18n · keyboard/ARIA a11y · GitHub Pages deploy (CI in `.github/workflows/deploy.yml`). The "Up Next" panel is now a full album track list with the current track highlighted.

See the design spec for the per-milestone deliverables and verification steps.
