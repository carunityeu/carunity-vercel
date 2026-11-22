import React from 'react';
import { useTranslation } from 'react-i18next';
import SocialAdPackages from '@/components/pricing/reference/SocialAdPackages';
import '@/components/pricing/reference/pricingReference.css';

export default function AdvertisingAdProducts() {
  const { t } = useTranslation();
  return (
    <div className="space-y-10">
      <section>
        <h3 className="text-lg font-semibold text-foreground">{t('priceRef.social')}</h3>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">{t('priceRef.socialHint')}</p>
        <div className="mt-6">
          <SocialAdPackages />
        </div>
      </section>
    </div>
  );
}