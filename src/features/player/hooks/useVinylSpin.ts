import { useRef } from 'react';
import type { RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const SECONDS_PER_REV = 5;
const RAMP = 0.6;

/**
 * Spins `targetRef` like a turntable platter. A single infinite GSAP tween
 * accumulates rotation, so pausing/resuming continues from the EXACT current
 * angle (never snaps to 0). `isActive` drives a smooth timeScale spin-up/down.
 *
 * NOTE: GSAP writes an inline transform, which the prefers-reduced-motion CSS
 * backstop cannot neutralize — callers MUST pass isActive=false when reduced.
 */
export function useVinylSpin(targetRef: RefObject<HTMLElement | null>, isActive: boolean): void {
  const spinRef = useRef<gsap.core.Tween | null>(null);
  const rampRef = useRef<gsap.core.Tween | null>(null);

  // Create the accumulating tween once, scoped to the target (auto-reverts).
  useGSAP(
    () => {
      if (!targetRef.current) return;
      const spin = gsap.to(targetRef.current, {
        rotation: '+=360',
        duration: SECONDS_PER_REV,
        ease: 'none',
        repeat: -1,
        paused: true,
      });
      spin.timeScale(0); // start stationary; the sync effect ramps it up
      spinRef.current = spin;
    },
    { scope: targetRef },
  );

  // Sync playback to `isActive` with an eased spin-up / spin-down.
  useGSAP(
    () => {
      const spin = spinRef.current;
      if (!spin) return;
      rampRef.current?.kill();

      if (isActive) {
        spin.play();
        rampRef.current = gsap.to(spin, { timeScale: 1, duration: RAMP, ease: 'power1.out' });
      } else {
        rampRef.current = gsap.to(spin, {
          timeScale: 0,
          duration: RAMP,
          ease: 'power1.in',
          onComplete: () => spin.pause(), // stop ticking once stationary
        });
      }
    },
    { dependencies: [isActive], scope: targetRef },
  );
}
