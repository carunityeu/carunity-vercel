import React from 'react';
import { useTranslation } from 'react-i18next';
import AdvertisingFormats from '@/components/advertising/AdvertisingFormats';
import AdvertisingAdProducts from '@/components/advertising/AdvertisingAdProducts';

const CONTACT_KEYS = {
  formats: 'formats_contact',
  targeting: 'targeting_closing_2',
};

export default function AdvertisingPanel({ section }) {
  const { t } = useTranslation();
  return (
    <section id="advertising-panel" role="tabpanel" aria-labelledby={`advertising-tab-${section}`} className="min-w-0">
      {section !== 'targeting' && (
        <header className="mb-6 max-w-3xl">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{t(`advertising_info.${section}_title`)}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`advertising_info.${section}_body`)}</p>
        </header>
      )}

      {section === 'formats' && <AdvertisingFormats />}

      {section === 'targeting' && (
        <div className="space-y-8">
          <AdvertisingAdProducts />
        </div>
      )}

      <footer className="mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">{t(`advertising_info.${CONTACT_KEYS[section]}`)}</p>
        <a href={`mailto:contact@carunity.eu?subject=${encodeURIComponent(t('advertising.email_subject'))}`} className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto">{t('advertising_info.contact_cta')}</a>
      </footer>
    </section>
  );
}