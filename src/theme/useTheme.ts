import { useEffect } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';

/**
 * Bridges store.theme -> <html data-theme>. Mount once (App). The store's initial
 * theme is seeded from the FOUC-applied data-theme and persist rehydrate agrees
 * with it, so the first run is a no-op write (no flash). After that, every
 * toggleTheme/setTheme flips the rendered theme live. StrictMode-safe (idempotent).
 */
export function useTheme(): void {
  const theme = usePlayerStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
}
