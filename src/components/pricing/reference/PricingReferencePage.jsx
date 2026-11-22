import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import PricingStage from '@/components/pricing/reference/PricingStage';
import PrivateListingPlan from '@/components/pricing/reference/PrivateListingPlan';
import DealerSubscriptionPlans from '@/components/pricing/reference/DealerSubscriptionPlans';
import SocialAdPackages from '@/components/pricing/reference/SocialAdPackages';
import PromotionOffer from '@/components/pricing/reference/PromotionOffer';
import '@/components/pricing/reference/pricingReference.css';
export default function PricingReferencePage({ dealer = false }) {
  const { t } = useTranslation();
  return <div className="pr-page"><div className="pr-shell">
    <nav className="pr-breadcrumb" aria-label={t('pricing.page_title')}><Link to="/">{t('breadcrumb.home')}</Link><span>›</span><Link to="/DealerPricing">{t('pricing.page_title')}</Link></nav>
    <header className="pr-header"><h1>{t('pricing.page_title')}</h1><p>{t(dealer ? 'priceRef.dealerIntro' : 'priceRef.privateIntro')}</p></header>
    {dealer && <div className="pr-launch"><span>{t('priceRef.damaged')}</span><strong>{t('priceRef.damagedHint')}</strong><Link to="/DealerRegister?apply=1">{t('priceRef.register')} ›</Link></div>}
    
    <PricingStage id="pricing-plans" number={1} title={t(dealer ? 'priceRef.dealerPlan' : 'priceRef.placement')} hint={t(dealer ? 'priceRef.dealerPlanHint' : 'priceRef.placementHint')}>
      {dealer ? <DealerSubscriptionPlans /> : <PrivateListingPlan />}
    </PricingStage>
    <PricingStage id="pricing-promotion" number={2} label="promotion" title={t('priceRef.promotion')} hint={t('priceRef.promoHint')}>
      <div className="pr-promotion-list">
        <PromotionOffer dealer={dealer} />
        <PromotionOffer top dealer={dealer} />
      </div>
    </PricingStage>
    <PricingStage id="pricing-social" number={3} label="social" title={t('priceRef.social')} hint={t('priceRef.socialHint')}><SocialAdPackages dealer={dealer} /></PricingStage>
    <footer className={dealer ? 'pr-dealer-cta' : 'pr-cta'}>{!dealer && <><h2>{t('priceRef.ready')}</h2><p>{t('priceRef.readyHint')}</p></>}<Link className="pr-button" to={dealer ? '/DealerRegister?apply=1' : '/CreateListing'}>{t(dealer ? 'priceRef.register' : 'priceRef.post')} ›</Link></footer>
  </div></div>;
}