import React from 'react';
import { BOOST_OPTIONS, LISTING_PLANS, TOP_SPOT_PRICE } from '@/components/listings/create/constants';
import PaymentConsent from '@/components/PaymentConsent';
import ListingPlanOption from '@/components/listings/create/ListingPlanOption';
import ListingNotice from '@/components/listings/create/ListingNotice';

export default function StepPlan({ selectedBoost, setSelectedBoost, addTopSpot, setAddTopSpot, isDamaged, onDamagedChange, listingPlan, setListingPlan, total, consent, setConsent, consentHighlight, t }) {
  const period = (price, days) => t('listing.cr_period', { price: price.toFixed(2), days: t('listing.cr_days', { count: days }) });
  return <div className="lc-plans">
    <ListingPlanOption className="lc-boost" active title={isDamaged ? `${t('listing.cr_basic_plan')} ( ${period(0, 30)} )` : t('listing.cr_basic_plan')} description={t('listing.cr_plan_desc')}
      features={[t('listing.cr_in_catalog'), t('listing.cr_active_days', 'Активно {{n}} дней', { n: isDamaged ? 30 : listingPlan.days }), t('listing.cr_view_stats')]}>
      {!isDamaged && <div className="lc-boost-options">{LISTING_PLANS.map(plan => <button key={plan.id} type="button" aria-pressed={listingPlan.id === plan.id} onClick={() => setListingPlan(plan)}>
        <div>{t('listing.cr_days', { count: plan.days })}</div><strong>{plan.price.toFixed(2)} €</strong>
      </button>)}</div>}
    </ListingPlanOption>
    <ListingNotice action={<button type="button" aria-pressed={isDamaged} onClick={() => onDamagedChange(!isDamaged)}>{t(isDamaged ? 'listing.cr_damaged_selected' : 'listing.cr_post_damaged')}</button>}>{t('listing.cr_damaged_hint')}</ListingNotice>
    <ListingPlanOption active={addTopSpot} onClick={() => setAddTopSpot(v => !v)} title={`${t('listing.cr_top_spot')} ( ${period(TOP_SPOT_PRICE, 7)} )`} description={t('listing.cr_plan_desc')} features={['cr_top_f1', 'cr_top_catalog', 'cr_top_f2'].map(k => t('listing.' + k))} />
    <ListingPlanOption className="lc-boost" active={!!selectedBoost} title={`${t('listing.cr_boost_title')} ( ${t('listing.cr_from')} ${BOOST_OPTIONS[0].price.toFixed(2)} €)`} description={t('listing.cr_boost_desc')}>
      <div className="lc-boost-options">{BOOST_OPTIONS.map(opt => <button key={opt.days} type="button" aria-pressed={selectedBoost?.days === opt.days} onClick={() => setSelectedBoost(selectedBoost?.days === opt.days ? null : opt)}>
        <div>{t('listing.cr_days', { count: opt.days })}</div><strong>{opt.price.toFixed(2)} €</strong>
      </button>)}</div>
    </ListingPlanOption>
    {total > 0 && <PaymentConsent checked={consent} onChange={setConsent} highlight={consentHighlight} />}
  </div>;
}