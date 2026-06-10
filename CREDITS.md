# Credits & Licenses

This file is the authoritative attribution record for bundled media. The remaining **dummy** albums use royalty-free SoundHelix audio; **real albums** (added via the `public/audio/<Artist - Album>/` folder convention) use commercial recordings.

> ⚠️ **Copyright notice.** This is a non-commercial **frontend portfolio demo**. Real albums (e.g. the Arctic Monkeys record below) are **copyrighted commercial recordings and cover art**, included here only to demonstrate the player with realistic content. They are **not** royalty-free; hosting them publicly is the repository owner's responsibility. To keep the public deploy clean, replace them with royalty-free audio or remove the folders before publishing.

## Real albums (copyrighted — demo use)

| Album (`public/audio/<Artist - Album>/`)                         | Rights holder                         | Note                                        |
| ---------------------------------------------------------------- | ------------------------------------- | ------------------------------------------- |
| Arctic Monkeys — _Whatever People Say I Am, That's What I'm Not_ | Arctic Monkeys / Domino Recording Co. | © the respective owners; demo content only. |

## Music (dummy albums)

The remaining gradient-cover dummy albums use **SoundHelix** (https://www.soundhelix.com) — algorithmically generated music, free to use for any purpose, no attribution required. Bundled as `public/audio/soundhelix-*.mp3` and referenced by the dummy catalog (`src/data/mockMusic.ts`).

| File (`public/audio/…`) | Source            | License                              |
| ----------------------- | ----------------- | ------------------------------------ |
| `soundhelix-1.mp3`      | SoundHelix-Song-1 | Free to use, no attribution required |
| `soundhelix-2.mp3`      | SoundHelix-Song-2 | Free to use, no attribution required |
| `soundhelix-3.mp3`      | SoundHelix-Song-3 | Free to use, no attribution required |
| `soundhelix-4.mp3`      | SoundHelix-Song-4 | Free to use, no attribution required |
| `soundhelix-5.mp3`      | SoundHelix-Song-5 | Free to use, no attribution required |

Note: in-app track/album titles (e.g. "Neon Drift", "Midnight Coast") are fictional display labels and are not the SoundHelix track names.

**Candidate sources for the M6 curated soundtrack** (prefer no-attribution or simple CC BY):

- **Pixabay Music** — Pixabay Content License, no attribution required, redistribution within a project allowed.
- **Incompetech (Kevin MacLeod)** — CC BY 4.0, **attribution required** (e.g. _"Music by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0"_).
- **Free Music Archive** — per-track CC license (check each).

## Cover art

- **Dummy albums** use CSS `gradient:` sentinels (no image files) — see `src/data/mockMusic.ts`.
- **Real albums** bundle their own `cover.<webp|jpg|png>` inside `public/audio/<Artist - Album>/`. These are the **original commercial cover artworks** (e.g. the Arctic Monkeys sleeve) and are **copyrighted** — see the notice above.

## Fonts

- **Space Grotesk**, **Poppins** — Google Fonts (Open Font License).
- **Pretendard** — Open Font License (jsDelivr CDN). Covers Latin + Korean glyphs.
