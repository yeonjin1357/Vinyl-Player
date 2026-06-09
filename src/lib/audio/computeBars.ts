/**
 * Reduce a frequency-domain Uint8Array (0..255 per bin) to `count` normalized bar
 * heights (0..1). Uses only the lower portion of the spectrum (music energy
 * concentrates in low/mid bins) with log-ish grouping so the bass end isn't
 * crushed into one bar. Pure and allocation-light: the caller passes `out`,
 * which is written in place and returned (reused every frame).
 *
 * @param freq        analyser.getByteFrequencyData target (length = frequencyBinCount)
 * @param count       number of bars
 * @param out         reused Float32Array(count)
 * @param usableBins  how many low bins to span (default 96; drops the near-silent top)
 */
export function computeBars(
  freq: Uint8Array,
  count: number,
  out: Float32Array,
  usableBins = 96,
): Float32Array {
  const span = Math.min(usableBins, freq.length);
  for (let i = 0; i < count; i++) {
    const lo = Math.floor(span * (Math.pow(2, i / count) - 1));
    const hi = Math.max(lo + 1, Math.floor(span * (Math.pow(2, (i + 1) / count) - 1)));
    let sum = 0;
    let n = 0;
    for (let b = lo; b < hi && b < span; b++) {
      sum += freq[b];
      n++;
    }
    out[i] = n > 0 ? sum / n / 255 : 0;
  }
  return out;
}
