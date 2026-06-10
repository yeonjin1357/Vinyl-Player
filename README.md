# 🎧 LP Record Player

A dual-theme **vinyl music player** for the web — a frontend portfolio piece focused on design and animation craft.

One app, two fully distinct visual identities you can flip live:

- **Dark Neon** — near-black canvas, magenta/cyan glow, sharp edges, bold display type.
- **Light Minimal** — warm cream, soft shadows, rounded forms, quiet elegance.

> ✅ **Status:** complete (M0–M6). 🔗 **Live demo:** https://yeonjin1357.github.io/Vinyl-Player/

## Features

- 🎵 Real audio playback (play/pause/seek/volume/prev/next, shuffle, repeat) — drop an `Artist - Album (YYYY)` folder into `public/audio/` and run `pnpm gen:music`
- 🎨 Per-album accent color extracted from the cover art at runtime
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
| `pnpm gen:music`            | Scan `public/audio/` folders → catalog  |
| `pnpm build`                | Typecheck + production build to `dist/` |
| `pnpm preview`              | Preview the production build            |
| `pnpm lint` / `pnpm format` | Lint / format                           |
| `pnpm typecheck`            | Type-check only                         |
| `pnpm test`                 | Run unit tests (Vitest)                 |

## Deployment

Deployed to **GitHub Pages** via GitHub Actions (`.github/workflows/deploy.yml`): every push to `main` builds with `DEPLOY_TARGET=gh-pages` (Vite `base` = `/Vinyl-Player/`) and publishes to Pages.

**One-time setup:** repo **Settings → Pages → Build and deployment → Source: _GitHub Actions_**. After that, pushes auto-deploy to https://yeonjin1357.github.io/Vinyl-Player/.

Alternatively, **Vercel**: import the repo (auto-detects Vite, serves from root); `vercel.json` provides the build command + SPA rewrite.

## Roadmap

| Milestone | Scope                                                    |
| --------- | -------------------------------------------------------- |
| ✅ M0     | Scaffold, tooling, theme token bridge, project docs      |
| ✅ M1     | Core player UI + Zustand store                           |
| ✅ M2     | Web Audio engine — real playback                         |
| ✅ M3     | Visualizer + GSAP vinyl spin + tonearm                   |
| ✅ M4     | Dual-theme system, live toggle                           |
| ✅ M5     | Library grid + shared-element transition                 |
| ✅ M6     | i18n (EN/KO), accessibility, polish, GitHub Pages deploy |

## Credits

Dummy albums use royalty-free SoundHelix audio + gradient covers. Real albums added for the demo (e.g. the Arctic Monkeys record) are **copyrighted commercial recordings** included only to showcase the player — they are not royalty-free. See [`CREDITS.md`](CREDITS.md) for per-asset attribution, licenses, and the copyright notice.

## License

Code is provided as a portfolio sample. Bundled media remains under its respective source license (see `CREDITS.md`).
