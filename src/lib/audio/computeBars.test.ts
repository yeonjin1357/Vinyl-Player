import { describe, expect, it } from 'vitest';
import { computeBars } from './computeBars';

describe('computeBars', () => {
  it('maps silence to all zeros', () => {
    const out = computeBars(new Uint8Array(128), 64, new Float32Array(64));
    expect(out.every((v) => v === 0)).toBe(true);
  });

  it('maps full energy to ~1 across all bars', () => {
    const freq = new Uint8Array(128).fill(255);
    const out = computeBars(freq, 64, new Float32Array(64));
    expect(out.every((v) => v === 1)).toBe(true);
  });

  it('writes into and returns the provided out buffer (no allocation)', () => {
    const out = new Float32Array(32);
    const result = computeBars(new Uint8Array(128).fill(128), 32, out);
    expect(result).toBe(out);
    expect(out).toHaveLength(32);
    expect(out.every((v) => v > 0 && v <= 1)).toBe(true);
  });

  it('is finite and safe when count exceeds usable bins', () => {
    const out = computeBars(new Uint8Array(128).fill(200), 200, new Float32Array(200), 96);
    expect(out).toHaveLength(200);
    expect(out.every((v) => Number.isFinite(v) && v >= 0 && v <= 1)).toBe(true);
  });

  it('normalizes a mid value correctly', () => {
    const out = computeBars(new Uint8Array(128).fill(51), 16, new Float32Array(16)); // 51/255 = 0.2
    expect(out.every((v) => Math.abs(v - 0.2) < 1e-6)).toBe(true);
  });
});
