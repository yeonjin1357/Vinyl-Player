/**
 * Extract a representative accent color from an album cover image, at runtime.
 *
 * Pixels are averaged with a saturation weight so a colorful cover yields its vivid
 * hue (not a muddy mean), while a monochrome cover (e.g. a black-and-white photo)
 * settles on a neutral grey — which is the honest accent for it. The result is then
 * lifted into a lightness band so it stays legible as a glow/stroke on the near-black
 * dark-neon canvas. Same-origin covers keep the canvas un-tainted.
 */

const SAMPLE = 28; // downscaled square the cover is drawn into before sampling

function toHex(n: number): string {
  return Math.round(Math.max(0, Math.min(255, n)))
    .toString(16)
    .padStart(2, '0');
}

/** Scale rgb so its brightest channel lands in [MIN, MAX] — readable on dark + not blown out. */
function clampLightness(r: number, g: number, b: number): [number, number, number] {
  const MIN = 120;
  const MAX = 232;
  const peak = Math.max(r, g, b, 1);
  const scale = peak < MIN ? MIN / peak : peak > MAX ? MAX / peak : 1;
  return [r * scale, g * scale, b * scale];
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`cover load failed: ${url}`));
    img.src = url;
  });
}

export async function extractCoverAccent(url: string): Promise<string | null> {
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = SAMPLE;
    canvas.height = SAMPLE;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
    const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE);

    let wr = 0;
    let wg = 0;
    let wb = 0;
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 125) continue; // skip (near-)transparent pixels
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      const weight = sat * sat + 0.05; // favor vivid pixels, with a small floor
      wr += r * weight;
      wg += g * weight;
      wb += b * weight;
      total += weight;
    }
    if (total === 0) return null;

    const [r, g, b] = clampLightness(wr / total, wg / total, wb / total);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch {
    return null;
  }
}
