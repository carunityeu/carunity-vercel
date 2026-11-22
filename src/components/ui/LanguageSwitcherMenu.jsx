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

export function LanguageSwitcherDropdown({ buttonClassName }) {
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
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors",
          buttonClassName
        )}>
        <span className="uppercase tracking-wide text-sm font-semibold">{current?.code}</span>
        <ChevronDown className={cn('w-3 h-3 text-slate-500 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 bottom-full mb-1.5 z-[9999] bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[150px] py-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
                className={cn(
                  'w-full flex items-center justify-between gap-2 px-3.5 py-2 text-sm transition-colors hover:bg-slate-700/60',
                  currentLang === lang.code
                    ? 'text-emerald-400 font-semibold'
                    : 'text-slate-300'
                )}>
                <span>{lang.label}</span>
                {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-emerald-500" />}
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
            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors',
            current === l.code
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          )}>
          <span>{l.flag}</span>
          <span>{l.label.slice(0, 2)}</span>
        </button>
      ))}
    </div>
  );
}