import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, MapPin } from 'lucide-react';
import { hasAnalyticsConsent, onConsentChange } from '@/lib/cookieConsent';

/**
 * Seller location on Google Maps (embedded map, no API key). Google sets its own cookies, so the
 * map loads right away only when the visitor accepted cookies; otherwise one tap shows it.
 * A link always opens the address in Google Maps.
 */
export default function SellerMap({ query }) {
  const { t, i18n } = useTranslation();
  const [show, setShow] = useState(hasAnalyticsConsent);
  useEffect(() => onConsentChange((value) => value === 'accepted' && setShow(true)), []);
  if (!query) return null;

  const q = encodeURIComponent(query);
  const lang = (i18n.language || 'ru').slice(0, 2);
  const openUrl = `https://www.google.com/maps/search/?api=1&query=${q}`;

  return (
    <div className="mt-5">
      <div className="relative h-64 overflow-hidden rounded-xl bg-raised md:h-80">
        {show ? (
          <iframe title={t('carPage.map', 'Карта')} src={`https://www.google.com/maps?q=${q}&hl=${lang}&z=15&output=embed`}
            className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <MapPin className="h-7 w-7 text-ink-3" />
            <p className="max-w-xs text-sm text-ink-2">{t('carPage.map_consent', 'Карта загружается с Google Maps, который использует свои cookie.')}</p>
            <button type="button" onClick={() => setShow(true)} className="h-10 rounded-xl bg-surface px-4 text-sm font-semibold text-ink">
              {t('carPage.map_show', 'Показать карту')}
            </button>
          </div>
        )}
      </div>
      <a href={openUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-text">
        {t('carPage.map_open', 'Открыть в Google Maps')}<ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
