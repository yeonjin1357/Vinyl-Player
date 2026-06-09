import { motion } from 'motion/react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { usePlayerStore } from '@/store/usePlayerStore';

const DOWN = -46; // resting in the groove (playing)
const UP = -24; // lifted & parked outward (paused)

/**
 * M3 tonearm — a needle-drop. On play the arm swings IN and sets onto the record
 * (rotate, settling with a slight overshoot); on pause it lifts UP (y) and swings
 * slightly OUT. Direction-aware springs; instant under reduced-motion. Decorative.
 */
export function Tonearm() {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const reduced = usePrefersReducedMotion();

  return (
    <div aria-hidden="true" className="absolute -top-[3%] right-[2%] z-20 h-[58%] w-[58%]">
      {/* pivot base (counterweight) */}
      <div className="absolute top-0 right-0 h-10 w-10 rounded-full bg-surface shadow-card ring-1 ring-border">
        <div className="absolute inset-[28%] rounded-full bg-accent/80" />
      </div>

      {/* arm assembly, rotating about the pivot (top-right); y lifts off the disc */}
      <motion.div
        className="absolute top-[18px] right-[18px] h-3 origin-right will-change-transform"
        style={{ width: '78%' }}
        initial={false}
        animate={{ rotate: isPlaying ? DOWN : UP, y: isPlaying ? 0 : -6 }}
        transition={
          reduced
            ? { duration: 0 }
            : isPlaying
              ? { type: 'spring', stiffness: 120, damping: 14 } // drop: settles with overshoot
              : { type: 'spring', stiffness: 220, damping: 26 } // lift: snappy, no overshoot
        }
      >
        <div className="absolute top-1/2 h-[4px] w-full -translate-y-1/2 rounded-full bg-text/70" />
        <div className="absolute top-1/2 left-0 h-6 w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-sm bg-text/80 shadow-card" />
      </motion.div>
    </div>
  );
}
