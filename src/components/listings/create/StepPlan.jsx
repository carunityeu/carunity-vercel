import React from 'react';
import { BOOST_OPTIONS, BASE_LISTING_PRICE, TOP_SPOT_PRICE } from '@/components/listings/create/constants';
import ListingPlanOption from '@/components/listings/create/ListingPlanOption';
import ListingNotice from '@/components/listings/create/ListingNotice';

export default function StepPlan({ selectedBoost, setSelectedBoost, addTopSpot, setAddTopSpot, isDamaged, onDamagedChange, t }) {
  const basePrice = isDamaged ? 0 : BASE_LISTING_PRICE;
  const period = (price, days) => t('listing.cr_period', { price: price.toFixed(2), days: t('listing.cr_days', { count: days }) });
  return <div className="lc-plans">
    <ListingPlanOption active title={`${t('listing.cr_basic_plan')} ( ${period(basePrice, 30)} )`} description={t('listing.cr_plan_desc')} features={['cr_in_catalog', 'cr_active_30', 'cr_view_stats'].map(k => t('listing.' + k))} />
    <ListingNotice action={<button type="button" aria-pressed={isDamaged} onClick={() => onDamagedChange(!isDamaged)}>{t(isDamaged ? 'listing.cr_damaged_selected' : 'listing.cr_post_damaged')}</button>}>{t('listing.cr_damaged_hint')}</ListingNotice>
    <ListingPlanOption active={addTopSpot} onClick={() => setAddTopSpot(v => !v)} title={`${t('listing.cr_top_spot')} ( ${period(TOP_SPOT_PRICE, 7)} )`} description={t('listing.cr_plan_desc')} features={['cr_top_f1', 'cr_top_catalog', 'cr_top_f2'].map(k => t('listing.' + k))} />
    <ListingPlanOption className="lc-boost" active={!!selectedBoost} title={`${t('listing.cr_boost_title')} ( ${t('listing.cr_from')} ${BOOST_OPTIONS[0].price.toFixed(2)} €)`} description={t('listing.cr_boost_desc')}>
      <div className="lc-boost-options">{BOOST_OPTIONS.map(opt => <button key={opt.days} type="button" aria-pressed={selectedBoost?.days === opt.days} onClick={() => setSelectedBoost(selectedBoost?.days === opt.days ? null : opt)}>
        <div>{t('listing.cr_days', { count: opt.days })}</div><strong>{opt.price.toFixed(2)} €</strong>
      </button>)}</div>
    </ListingPlanOption>
  </div>;
}