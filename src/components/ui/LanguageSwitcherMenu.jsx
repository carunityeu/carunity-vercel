import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LANGUAGES = [
  { code: 'ru', label: 'RU — Русский', flag: '🇷🇺' },
  { code: 'en', label: 'EN — English', flag: '🇬🇧' },
  { code: 'et', label: 'ET — Eesti', flag: '🇪🇪' },
  { code: 'lv', label: 'LV — Latviešu', flag: '🇱🇻' },
  { code: 'lt', label: 'LT — Lietuvių', flag: '🇱🇹' },
];

// placement: 'top' opens upward (footer), 'bottom' opens downward (header)
export function LanguageSwitcherDropdown({ buttonClassName, placement = 'top' }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const currentLang = i18n.language?.slice(0, 2) || 'ru';
  const current = LANGUAGES.find((l) => l.code === currentLang);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold text-ink-2 hover:text-ink hover:bg-raised transition-colors",
          buttonClassName
        )}>
        <span className="uppercase tracking-wide text-sm font-semibold">{current?.code}</span>
        <ChevronDown className={cn('w-3 h-3 text-ink-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div className={cn('absolute right-0 z-[61] min-w-[150px] overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-xl', placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5')}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
                className={cn(
                  'w-full flex items-center justify-between gap-2 px-3.5 py-2 text-sm transition-colors hover:bg-raised',
                  currentLang === lang.code
                    ? 'text-brand-text font-semibold'
                    : 'text-ink-2'
                )}>
                <span>{lang.label}</span>
                {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-brand-text" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function LanguagePills({ className }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2) || 'ru';
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => i18n.changeLanguage(l.code)}
          className={cn(
            'flex h-8 items-center gap-1 px-2.5 rounded-lg text-xs font-semibold transition-colors',
            current === l.code
              ? 'bg-brand text-white'
              : 'bg-raised text-ink-2 hover:text-ink'
          )}>
          <span>{l.flag}</span>
          <span>{l.label.slice(0, 2)}</span>
        </button>
      ))}
    </div>
  );
}