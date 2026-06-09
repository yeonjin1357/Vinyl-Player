import { AnimatePresence, motion } from 'motion/react';
import { IconButton } from '@/components/IconButton';
import { MoonIcon, SunIcon } from '@/components/icons';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { usePlayerStore } from '@/store/usePlayerStore';

// Shows the icon of the theme you'll switch TO. M6 i18n: swap for t('a11y.toLight'/'a11y.toDark').
const LABEL = {
  'dark-neon': 'Switch to light theme',
  'light-minimal': 'Switch to dark theme',
} as const;

export function ThemeToggle() {
  const theme = usePlayerStore((s) => s.theme);
  const toggleTheme = usePlayerStore((s) => s.toggleTheme);
  const reduced = usePrefersReducedMotion();
  const isDark = theme === 'dark-neon';
  const Icon = isDark ? SunIcon : MoonIcon;

  return (
    <IconButton label={LABEL[theme]} onClick={toggleTheme} variant="ghost" size="sm">
      {reduced ? (
        <Icon size={18} />
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="inline-grid place-items-center"
          >
            <Icon size={18} />
          </motion.span>
        </AnimatePresence>
      )}
    </IconButton>
  );
}
