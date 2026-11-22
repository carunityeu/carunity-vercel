import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight } from 'lucide-react';
import PricingLandingBlock from '@/components/pricing/PricingLandingBlock';

const PRIVATE_IMG = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/33321c58d_.png';
const DEALER_IMG = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/0f77f1499_UI-.png';

export default function DealerPricing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 mb-5">
          <Link to={createPageUrl('Home')} className="hover:text-emerald-400 transition-colors">
            {t('breadcrumb.home')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300">{t('pricing.page_title')}</span>
        </nav>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
          {t('pricing.page_title')}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mb-8 sm:mb-10 max-w-2xl">
          {t('pricing.page_subtitle')}
        </p>

        <div className="space-y-6 sm:space-y-8">
          <PricingLandingBlock
            image={PRIVATE_IMG}
            imageAlt={t('pricing.landing_private_title')}
            title={t('pricing.landing_private_title')}
            description={t('pricing.landing_private_desc')}
            buttonText={t('pricing.landing_private_btn')}
            buttonTo="/PrivatePricing"
          />
          <PricingLandingBlock
            image={DEALER_IMG}
            imageAlt={t('pricing.landing_dealer_title')}
            title={t('pricing.landing_dealer_title')}
            description={t('pricing.landing_dealer_desc')}
            buttonText={t('pricing.landing_dealer_btn')}
            buttonTo="/DealershipPricing"
            reverse
          />
        </div>
      </div>
    </div>
  );
}