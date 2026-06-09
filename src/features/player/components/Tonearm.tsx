import { motion } from 'motion/react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { usePlayerStore } from '@/store/usePlayerStore';

/**
 * M1 tonearm: a simple arm that swings onto the record while playing and lifts
 * off when paused. Pivots about the base at the disc's top-right. Decorative.
 * (M3 replaces this with the polished spring + needle-drop sequence.)
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

      {/* arm assembly, rotating about the pivot (top-right) */}
      <motion.div
        className="absolute top-[18px] right-[18px] h-3 origin-right"
        style={{ width: '78%' }}
        initial={false}
        animate={{ rotate: isPlaying ? -46 : -28 }}
        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 140, damping: 20 }}
      >
        {/* tube */}
        <div className="absolute top-1/2 h-[4px] w-full -translate-y-1/2 rounded-full bg-text/70" />
        {/* headshell at the far (left) end */}
        <div className="absolute top-1/2 left-0 h-6 w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-sm bg-text/80 shadow-card" />
      </motion.div>
    </div>
  );
}
