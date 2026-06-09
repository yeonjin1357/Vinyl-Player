import clsx from 'clsx';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface IconButtonProps {
  /** Accessible label (also the tooltip). */
  label: string;
  children: ReactNode;
  onClick?: () => void;
  variant?: 'ghost' | 'primary';
  /** Highlights the control as toggled-on (shuffle/repeat). */
  active?: boolean;
  /** Reflected as aria-pressed for toggle buttons. */
  pressed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-16 w-16',
} as const;

export function IconButton({
  label,
  children,
  onClick,
  variant = 'ghost',
  active = false,
  pressed,
  size = 'md',
  className,
}: IconButtonProps) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      whileTap={reduced ? undefined : { scale: 0.9 }}
      whileHover={reduced ? undefined : { scale: 1.06 }}
      className={clsx(
        'inline-grid place-items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent',
        sizeMap[size],
        variant === 'primary'
          ? 'bg-accent text-white shadow-[0_0_22px_var(--accent)]'
          : active
            ? 'text-accent'
            : 'text-muted hover:bg-surface hover:text-text',
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
