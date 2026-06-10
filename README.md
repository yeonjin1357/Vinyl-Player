**English** · [한국어](README.ko.md)

# 🎧 LP Record Player

<img width="1890" height="987" alt="image" src="https://github.com/user-attachments/assets/493f73a5-cd04-4dcb-a8b6-9dc5e3c63b9c" />


A vinyl music player for the web that I built as a frontend portfolio piece — the goal was less "another music app" and more a small playground for design and animation craft.

It ships **two completely different visual identities** that you can flip between live, mid-playback:

- **Dark Neon** — near-black canvas, magenta/cyan glow, sharp edges, bold display type.
- **Light Minimal** — warm cream, soft shadows, rounded forms, quiet elegance.

> 🔗 **Live demo → https://yeonjin1357.github.io/Vinyl-Player/**

## Highlights

- **Real playback, not a fake UI.** A hidden `<audio>` element feeds the full transport (play / pause / seek / volume / prev / next, shuffle, three repeat modes).
- **A visualizer that actually listens.** The radial spectrum ring is driven by the Web Audio `AnalyserNode`, so it reacts to the music instead of looping a canned animation.
- **A turntable that behaves like one.** The LP spins, the tonearm lifts on pause, and the platter resumes from the _exact_ angle it stopped at — it never snaps back to 12 o'clock.
- **The cover flies into the disc.** Tapping an album in the library morphs its artwork into the turntable's center label (shared-element transition).
- **Each album tints the room.** The accent color is pulled from the cover art at runtime — a black-and-white sleeve honestly resolves to a quiet grey, a vivid one glows.
- **Two languages, full a11y.** EN / 한국어 toggle, keyboard controls, ARIA, and a complete `prefers-reduced-motion` path.

## Under the hood

A few decisions I'm happy with:

- **One source of truth, split cleanly.** A single Zustand store holds _intent_ (current track, queue, volume, theme…); a `usePlayer` hook owns _reality_ (the audio element + Web Audio graph). Reality only ever flows back into the store through native media events — no render-loop tug-of-war.
- **The Web Audio graph is built once.** A media element gets exactly one `MediaElementAudioSourceNode` for its lifetime, so tracks change by swapping `audioEl.src`, never by rebuilding the node. Volume runs through a `GainNode` so it matches the analysed signal, and per-frame analyser data is drawn straight to canvas — never pushed through React state.
- **Spin that survives pause** is a GSAP timeline accumulating rotation, so `play()` / `pause()` pick up exactly where they left off.
- **Theming is just CSS variables.** `data-theme` on `<html>` swaps a token set; Tailwind v4's `@theme inline` bridges those into utilities (`--bg` → `bg-bg`). Flipping the attribute restyles everything instantly, and an inline script in `index.html` sets it before first paint to avoid a flash.
- **Albums are a folder convention, not hardcoded.** A small Node script scans `public/audio/` and generates the catalog (see below).

## Add your own album

Drop a folder into `public/audio/` named `Artist - Album (YYYY)` — the `(YYYY)` is optional and sets the release year:

```
public/audio/
└── Arctic Monkeys - Whatever People Say I Am, That's What I'm Not (2006)/
    ├── cover.webp                          # cover.<webp|jpg|png>
    ├── 1.The View From The Afternoon.mp3   # N.Title.mp3, numbered in play order
    ├── 2.I Bet You Look Good On The Dancefloor.mp3
    └── …
```

Then regenerate the catalog and commit the result:

```bash
pnpm gen:music   # scans the folders → src/data/generatedAlbums.json
```

Real albums lead the library grid; the remaining gradient "dummy" albums fill in behind them. Track durations are estimated from the MP3 header and confirmed at runtime once the file loads.

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

| Command                     | Description                             |
| --------------------------- | --------------------------------------- |
| `pnpm dev`                  | Start the dev server                    |
| `pnpm gen:music`            | Scan `public/audio/` folders → catalog  |
| `pnpm build`                | Typecheck + production build to `dist/` |
| `pnpm preview`              | Preview the production build            |
| `pnpm lint` / `pnpm format` | Lint / format                           |
| `pnpm typecheck`            | Type-check only                         |
| `pnpm test`                 | Run unit tests (Vitest)                 |

## Tech stack

React 19 · TypeScript 6 · Vite 8 · Tailwind CSS v4 · Zustand 5 · Motion · GSAP · Web Audio API · i18next · Vitest

## Deployment

Pushing to `main` auto-deploys to **GitHub Pages** via Actions (`.github/workflows/deploy.yml`): the build runs with `DEPLOY_TARGET=gh-pages` so Vite's `base` becomes `/Vinyl-Player/`. One-time setup: repo **Settings → Pages → Source: _GitHub Actions_**.

For **Vercel**, importing the repo just works (auto-detected Vite, served from root) — `vercel.json` supplies the build command and SPA rewrite.

## Credits

The gradient "dummy" albums use royalty-free [SoundHelix](https://www.soundhelix.com) audio. Real albums added to demo the player (e.g. the Arctic Monkeys record) are **copyrighted commercial recordings and cover art** — included purely to show the player with realistic content, not as royalty-free assets. See [`CREDITS.md`](CREDITS.md) for full attribution and the copyright notice.

## License

The code is a portfolio sample. Bundled media stays under its respective source license (see [`CREDITS.md`](CREDITS.md)).
