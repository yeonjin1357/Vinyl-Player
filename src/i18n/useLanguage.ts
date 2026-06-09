import { useEffect } from 'react';
import i18n from '@/i18n/config';
import { usePlayerStore } from '@/store/usePlayerStore';

/**
 * Bridges store.language -> i18next + <html lang>. Mount once (App), next to
 * useTheme(). The store is the single source; the init `lng` and persist rehydrate
 * agree (same lp-player key), so the first run is a no-op. StrictMode-safe.
 */
export function useLanguage(): void {
  const language = usePlayerStore((s) => s.language);
  useEffect(() => {
    if (i18n.language !== language) void i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }, [language]);
}
