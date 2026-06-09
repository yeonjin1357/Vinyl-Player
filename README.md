# 🎧 LP Record Player

A dual-theme **vinyl music player** for the web — a frontend portfolio piece focused on design and animation craft.

One app, two fully distinct visual identities you can flip live:

- **Dark Neon** — near-black canvas, magenta/cyan glow, sharp edges, bold display type.
- **Light Minimal** — warm cream, soft shadows, rounded forms, quiet elegance.

> 🚧 **Status:** scaffolded (M0). Core player, audio engine, visualizer, theming, library, and i18n are in progress — see the [roadmap](#roadmap).

<!-- TODO(M6): add a hero screenshot / GIF of both themes and a live demo link -->
<!-- 🔗 Live demo: <vercel-url> -->

## Features

- 🎵 Real audio playback of bundled royalty-free tracks (play/pause/seek/volume/prev/next, shuffle, repeat)
- 📊 **Web Audio API** sound-reactive visualizer that responds to the music
- 💿 Spinning LP + animated tonearm that lift on pause and resume from the exact angle
- 🗂️ Library grid → player transition (the album cover flies into the turntable)
- 🌗 Live **Dark Neon ⇄ Light Minimal** theme toggle, persisted across reloads
- 🌐 English / 한국어 UI toggle (i18n)
- ♿ Keyboard controls, ARIA, and a full `prefers-reduced-motion` path

## Tech stack

React 19 · TypeScript 6 · Vite 8 · Tailwind CSS v4 · Zustand 5 · Motion · GSAP · Web Audio API · i18next · Vitest

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

### Scripts

| Command                     | Description                             |
| --------------------------- | --------------------------------------- |
| `pnpm dev`                  | Start the dev server                    |
| `pnpm build`                | Typecheck + production build to `dist/` |
| `pnpm preview`              | Preview the production build            |
| `pnpm lint` / `pnpm format` | Lint / format                           |
| `pnpm typecheck`            | Type-check only                         |
| `pnpm test`                 | Run unit tests (Vitest)                 |

## Deployment

- **Vercel** (default): import the repo; `vercel.json` configures the build and SPA rewrite.
- **GitHub Pages**: build with `DEPLOY_TARGET=gh-pages pnpm build` (sets Vite `base` to `/lpRecord/`).

## Roadmap

| Milestone | Scope                                               |
| --------- | --------------------------------------------------- |
| ✅ M0     | Scaffold, tooling, theme token bridge, project docs |
| M1        | Core player UI + Zustand store (mock audio)         |
| M2        | Web Audio engine — real playback                    |
| M3        | Visualizer + GSAP vinyl spin + tonearm              |
| M4        | Dual-theme system, live toggle                      |
| M5        | Library grid + shared-element transition            |
| M6        | i18n, accessibility, real assets, polish, deploy    |

## Credits

Music and cover art are royalty-free — see [`CREDITS.md`](CREDITS.md) for per-asset attribution and licenses.

## License

Code is provided as a portfolio sample. Bundled media remains under its respective source license (see `CREDITS.md`).
