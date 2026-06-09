import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { computeBars } from '@/lib/audio/computeBars';

interface Options {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  analyser: AnalyserNode | null;
  /** isPlaying && analyser != null && !prefersReducedMotion */
  enabled: boolean;
  /** Bar color (the per-album accent). */
  accent: string;
  /** Additive neon glow (dark-neon theme) vs subtle solid (light-minimal). */
  glow: boolean;
  barCount?: number;
}

// Canvas is mounted at -inset-[18%] of the disc, so the vinyl edge sits at
// ~0.37 of the canvas half-extent. Bars anchor just under the edge and radiate out.
const R0_FRAC = 0.36;
const MAXLEN_FRAC = 0.12; // 0.36 + 0.12 = 0.48 < 0.5 edge
const IDLE_LEVEL = 0.05; // faint static ring when not playing

/**
 * Draws a radial spectrum ring on the canvas. Reads the analyser inside a
 * requestAnimationFrame loop and draws straight to canvas — per-frame data NEVER
 * touches React state. `accent`/`glow` come from props (store-derived), so colors
 * react to album/theme changes via React deps. Allocates buffers once. No-op
 * under jsdom (no 2D ctx).
 */
export function useAudioVisualizer({
  canvasRef,
  analyser,
  enabled,
  accent,
  glow,
  barCount = 64,
}: Options): void {
  const rafRef = useRef<number | null>(null);
  const freqRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const barsRef = useRef<Float32Array>(new Float32Array(barCount));
  const sizeRef = useRef({ w: 0, h: 0 });

  // Backing-store sizing. The ring is a soft, blurred glow, so we render it at a
  // CAPPED low resolution and let CSS upscale it — invisible to the eye but it
  // keeps per-frame compositing cheap (a full-res/hi-DPI canvas recomposited every
  // frame tanks frame rate, badly so under software rendering / integrated GPUs).
  const MAX_DIM = 340;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const cssMin = Math.min(rect.width, rect.height);
      const scale = cssMin > 0 ? Math.min(1, MAX_DIM / cssMin) : 1; // ignore DPR; glow hides upscaling
      const w = Math.max(1, Math.round(rect.width * scale));
      const h = Math.max(1, Math.round(rect.height * scale));
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      sizeRef.current = { w, h };
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [canvasRef]);

  // The rAF loop (radial ring). Re-runs when enabled/analyser/colors change.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d') ?? null; // null under jsdom -> bail (test-safe)
    if (!canvas || !ctx) return;

    const draw = (bars: Float32Array) => {
      const { w, h } = sizeRef.current;
      const cx = w / 2;
      const cy = h / 2;
      const min = Math.min(w, h);
      const r0 = min * R0_FRAC;
      const maxLen = min * MAXLEN_FRAC;
      const count = bars.length;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineWidth = Math.max(2, ((2 * Math.PI * r0) / count) * 0.55);
      ctx.strokeStyle = accent;
      if (glow) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = 14;
        ctx.shadowColor = accent;
        ctx.globalAlpha = 0.9;
      } else {
        ctx.globalAlpha = 0.22;
      }
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 - Math.PI / 2;
        const len = Math.max(maxLen * 0.04, bars[i] * maxLen);
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        ctx.beginPath();
        ctx.moveTo(cx + cos * r0, cy + sin * r0);
        ctx.lineTo(cx + cos * (r0 + len), cy + sin * (r0 + len));
        ctx.stroke();
      }
      ctx.restore();
    };

    if (!enabled || !analyser) {
      barsRef.current.fill(IDLE_LEVEL);
      draw(barsRef.current); // static idle ring; no rAF
      return;
    }

    const bins = analyser.frequencyBinCount;
    if (!freqRef.current || freqRef.current.length !== bins) {
      freqRef.current = new Uint8Array(bins);
    }
    if (barsRef.current.length !== barCount) {
      barsRef.current = new Float32Array(barCount);
    }
    const freq = freqRef.current;
    const bars = barsRef.current;

    const frame = () => {
      analyser.getByteFrequencyData(freq);
      computeBars(freq, barCount, bars);
      draw(bars);
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [canvasRef, analyser, enabled, accent, glow, barCount]);
}
