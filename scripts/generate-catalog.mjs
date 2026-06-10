/**
 * Catalog generator — scans `public/audio/<Artist - Album>/` folders and writes the
 * real-album catalog to `src/data/generatedAlbums.json` (merged with the remaining
 * gradient dummies in `src/data/music.ts`).
 *
 * Folder convention (kept for every future album):
 *   public/audio/<Artist> - <Album>/
 *     cover.<webp|jpg|png|…>          ← album art
 *     1.<Title>.mp3 … N.<Title>.mp3   ← numbered tracks (natural-sorted)
 *
 * No external deps (pnpm `"type": "module"`, Node ≥20). Durations are estimated by
 * parsing the MP3 header (Xing/Info frame count when present, else CBR from bitrate);
 * the real value is confirmed at runtime via `loadedmetadata`. Accent is a neutral
 * placeholder — the app extracts the real accent from the cover at runtime.
 *
 * Run:  pnpm gen:music   (after adding/removing album folders; commit the JSON)
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const AUDIO_DIR = path.join(ROOT, 'public', 'audio');
const OUT_FILE = path.join(ROOT, 'src', 'data', 'generatedAlbums.json');

const IMAGE_RE = /\.(webp|avif|jpe?g|png)$/i;
const PLACEHOLDER_ACCENT = '#8a8a8a'; // overridden at runtime by cover color extraction

/** kebab-case slug; apostrophes are dropped (so "That's" → "thats"). */
function slugify(s) {
  return s
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Leading-number natural sort key, e.g. "10.foo.mp3" → 10. Non-numbered → Infinity. */
function trackNumber(filename) {
  const m = filename.match(/^(\d+)\./);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}

/** Strip the leading "N." index and the ".mp3" extension; keep inner dots/commas/…. */
function trackTitle(filename) {
  return filename.replace(/^\d+\./, '').replace(/\.mp3$/i, '');
}

// ---- MP3 duration estimation -------------------------------------------------

const BITRATES = {
  // [version][layer] → kbps indexed by the 4-bit bitrate index
  1: {
    // MPEG1
    1: [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 0], // Layer I
    2: [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, 0], // Layer II
    3: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0], // Layer III
  },
  2: {
    // MPEG2 / 2.5
    1: [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256, 0], // Layer I
    2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0], // Layer II
    3: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0], // Layer III
  },
};
const SAMPLE_RATES = {
  3: [44100, 48000, 32000], // MPEG1
  2: [22050, 24000, 16000], // MPEG2
  0: [11025, 12000, 8000], // MPEG2.5
};

/** ID3v2 tag length at the start of the buffer (0 if absent). */
function id3v2Size(buf) {
  if (buf.length < 10 || buf.toString('latin1', 0, 3) !== 'ID3') return 0;
  const flags = buf[5];
  const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
  const footer = flags & 0x10 ? 10 : 0;
  return 10 + size + footer;
}

/** Best-effort duration (seconds) from the MP3 header; null if unparseable. */
function mp3Duration(buf, fileSize) {
  const start = id3v2Size(buf);
  // Find the first frame sync (0xFF 0xEx) at/after the ID3v2 tag.
  let i = start;
  for (; i < buf.length - 4; i++) {
    if (buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0) break;
  }
  if (i >= buf.length - 4) return null;

  const b1 = buf[i + 1];
  const b2 = buf[i + 2];
  const b3 = buf[i + 3];
  const versionBits = (b1 >> 3) & 0x03; // 3=MPEG1, 2=MPEG2, 0=MPEG2.5
  const layerBits = (b1 >> 1) & 0x03; // 3=Layer I, 2=Layer II, 1=Layer III
  if (versionBits === 1 || layerBits === 0) return null;

  const versionGroup = versionBits === 3 ? 1 : 2;
  const layer = layerBits === 3 ? 1 : layerBits === 2 ? 2 : 3;
  const bitrate = BITRATES[versionGroup]?.[layer]?.[(b2 >> 4) & 0x0f];
  const sampleRate = SAMPLE_RATES[versionBits]?.[(b2 >> 2) & 0x03];
  if (!bitrate || !sampleRate) return null;

  const samplesPerFrame = layer === 1 ? 384 : layer === 3 && versionBits !== 3 ? 576 : 1152;

  // Xing/Info VBR header (frame count) lives after the side-info block.
  const mono = ((b3 >> 6) & 0x03) === 3;
  const sideInfo = versionBits === 3 ? (mono ? 17 : 32) : mono ? 9 : 17;
  const xOff = i + 4 + sideInfo;
  const tag = buf.toString('latin1', xOff, xOff + 4);
  if ((tag === 'Xing' || tag === 'Info') && xOff + 12 <= buf.length) {
    const flags = buf.readUInt32BE(xOff + 4);
    if (flags & 0x0001) {
      const frames = buf.readUInt32BE(xOff + 8);
      if (frames > 0) return (frames * samplesPerFrame) / sampleRate;
    }
  }

  // CBR: audio bytes / (bitrate bytes-per-second). Drop a trailing ID3v1 tag.
  const id3v1 = buf.length >= 128 && buf.toString('latin1', fileSize - 128, fileSize - 125) === 'TAG' ? 128 : 0;
  const audioBytes = fileSize - start - id3v1;
  return (audioBytes * 8) / (bitrate * 1000);
}

/** Best-effort release year from an ID3v2 TDRC/TYER frame; null if absent. */
function id3Year(buf) {
  const end = id3v2Size(buf);
  if (end === 0) return null;
  const head = buf.toString('latin1', 0, end);
  const m = head.match(/(?:TDRC|TYER)[\s\S]{0,16}?((?:19|20)\d{2})/);
  return m ? Number(m[1]) : null;
}

// ---- Scan --------------------------------------------------------------------

function listAlbumDirs() {
  let entries;
  try {
    entries = readdirSync(AUDIO_DIR, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
}

function buildAlbum(folder) {
  const dir = path.join(AUDIO_DIR, folder);
  const files = readdirSync(dir);

  const sep = folder.indexOf(' - ');
  const artist = sep >= 0 ? folder.slice(0, sep).trim() : 'Unknown Artist';
  let title = sep >= 0 ? folder.slice(sep + 3).trim() : folder.trim();

  // Optional trailing "(YYYY)" → explicit release year, e.g. "Artist - Album (2006)".
  // Wins over the ID3 tag (often a reissue date). Stripped from the displayed title.
  let folderYear = null;
  const ym = title.match(/\s*\((\d{4})\)\s*$/);
  if (ym) {
    folderYear = Number(ym[1]);
    title = title.slice(0, ym.index).trim();
  }
  // id derives from artist + title (year-independent) so it stays stable if a year is added.
  const albumId = slugify(`${artist} - ${title}`);

  const coverFile =
    files.find((f) => /^cover\./i.test(f) && IMAGE_RE.test(f)) ?? files.find((f) => IMAGE_RE.test(f));

  const mp3s = files
    .filter((f) => /\.mp3$/i.test(f))
    .sort((a, b) => trackNumber(a) - trackNumber(b) || a.localeCompare(b));

  let id3y = null;
  const tracks = mp3s.map((file, idx) => {
    const buf = readFileSync(path.join(dir, file));
    const size = statSync(path.join(dir, file)).size;
    if (id3y == null) id3y = id3Year(buf);
    const seconds = mp3Duration(buf, size) ?? size / 40000; // 320kbps fallback
    return {
      id: `${albumId}-${trackNumber(file) === Infinity ? idx + 1 : trackNumber(file)}`,
      title: trackTitle(file),
      artist,
      albumId,
      src: `audio/${folder}/${file}`,
      duration: Math.round(seconds),
      attribution: `${artist} — ${title}`,
    };
  });

  const album = {
    id: albumId,
    title,
    artist,
    year: folderYear ?? id3y ?? new Date().getFullYear(),
    accent: PLACEHOLDER_ACCENT,
    cover: coverFile ? `audio/${folder}/${coverFile}` : 'gradient:#8a8a8a,#3a3a3a',
    trackIds: tracks.map((t) => t.id),
  };
  return { album, tracks };
}

function main() {
  const folders = listAlbumDirs();
  const albums = [];
  const tracks = [];
  for (const folder of folders) {
    const { album, tracks: t } = buildAlbum(folder);
    if (t.length === 0) {
      console.warn(`⚠ skipping "${folder}" — no .mp3 files found`);
      continue;
    }
    albums.push(album);
    tracks.push(...t);
    console.log(`✓ ${album.artist} — ${album.title}  (${t.length} tracks)`);
  }

  writeFileSync(OUT_FILE, JSON.stringify({ albums, tracks }, null, 2) + '\n');
  console.log(`\nWrote ${albums.length} album(s), ${tracks.length} track(s) → ${path.relative(ROOT, OUT_FILE)}`);
}

main();
