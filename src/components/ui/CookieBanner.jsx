import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getConsent, setConsent, OPEN_SETTINGS_EVENT } from '@/lib/cookieConsent';

/**
 * Cookie choice: "Accept" and "Decline" look the same and weigh the same (no nudging).
 * Shown until the visitor chooses; the footer link "Cookie settings" opens it again.
 */
export default function CookieBanner() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(() => !getConsent());
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, show);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, show);
  }, []);
  if (!open) return null;
  const choose = (value) => { setConsent(value); setOpen(false); };
  const current = getConsent();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4" role="dialog" aria-live="polite" aria-label={t('cookie.title')}>
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-2xl md:flex-row md:items-center">
        <span className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-raised md:flex"><Cookie className="h-5 w-5 text-ink-2" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{t('cookie.title')}</p>
          <p className="mt-1 text-sm text-ink-2">
            {t('cookie.body_short', 'Необходимые cookie нужны для работы сайта. Аналитику и рекламные трекеры мы включаем только с вашего согласия.')}{' '}
            <Link to="/CookiePolicy" className="text-brand-text underline underline-offset-2">{t('footer.cookie_policy')}</Link>
          </p>
          {current && <p className="mt-1 text-xs text-ink-3">{current === 'accepted' ? t('cookie.state_on', 'Сейчас аналитика разрешена.') : t('cookie.state_off', 'Сейчас аналитика выключена.')}</p>}
        </div>
        <div className="grid flex-shrink-0 grid-cols-2 gap-2 md:w-72">
          <Button variant="secondary" onClick={() => choose('declined')}>{t('cookie.decline')}</Button>
          <Button variant="secondary" onClick={() => choose('accepted')}>{t('cookie.accept')}</Button>
        </div>
      </div>
    </div>
  );
}
