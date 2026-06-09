import type { Language } from '@/types/player';

const SUPPORTED: readonly Language[] = ['en', 'ko'];
const isLanguage = (v: unknown): v is Language =>
  typeof v === 'string' && (SUPPORTED as readonly string[]).includes(v);

/**
 * First-paint language, shared by i18n init (config.ts) and the store's initial
 * `language` so both agree on the first render (no flash) — mirrors initialTheme().
 * Priority: persisted store (lp-player.state.language) → navigator.language → 'en'.
 * Pure: no i18n side effects (so the store can import it without pulling in i18next).
 */
export function detectLanguage(): Language {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('lp-player');
      const persisted = raw ? (JSON.parse(raw).state ?? {}).language : null;
      if (isLanguage(persisted)) return persisted;
    } catch {
      /* corrupt/unavailable storage — fall through */
    }
  }
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('ko')) {
    return 'ko';
  }
  return 'en';
}
