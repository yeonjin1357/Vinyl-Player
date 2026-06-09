import { useTranslation } from 'react-i18next';
import { IconButton } from '@/components/IconButton';
import { usePlayerStore } from '@/store/usePlayerStore';

/** EN ⇄ KO toggle. Shows the language you'll switch TO (matches ThemeToggle). */
export function LanguageToggle() {
  const { t } = useTranslation();
  const language = usePlayerStore((s) => s.language);
  const setLanguage = usePlayerStore((s) => s.setLanguage);
  const next = language === 'en' ? 'ko' : 'en';

  return (
    <IconButton
      label={t('a11y.toggleLanguage')}
      onClick={() => setLanguage(next)}
      variant="ghost"
      size="sm"
    >
      <span className="text-xs font-bold tracking-wide uppercase">
        {next === 'ko' ? 'KO' : 'EN'}
      </span>
    </IconButton>
  );
}
