import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdvertisingPanel from '@/components/advertising/AdvertisingPanel';

export default function Advertising() {
  const { t } = useTranslation();
  const [section, setSection] = useState('formats');
  const sections = ['formats', 'targeting'];
  return (
    <div className="min-h-screen bg-background pt-12 text-foreground sm:pt-0">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-7 max-w-3xl">
          <h1 className="text-2xl font-semibold sm:text-3xl">{t('advertising_info.hero_title')}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{t('advertising_info.hero_desc')}</p>
        </header>
        <div role="tablist" aria-label={t('advertising_info.hero_title')} className="mb-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {sections.map(id => (
            <button key={id} id={`advertising-tab-${id}`} type="button" role="tab" aria-selected={section === id} aria-controls="advertising-panel" onClick={() => setSection(id)} className={`min-h-11 rounded-lg border px-3 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4 ${section === id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}>
              {t(`advertising_info.tile_${id}_title`)}
            </button>
          ))}
        </div>
        <AdvertisingPanel section={section} />
      </div>
    </div>
  );
}