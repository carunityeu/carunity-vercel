import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { auth } from '@/api/auth';
import { startCheckout } from '@/lib/stripeCheckout';
import PaymentConsent from '@/components/PaymentConsent';
import DealerPlanComparison from '@/components/pricing/reference/DealerPlanComparison';

const PLAN_IDS = ['starter', 'pro', 'premium'];

export default function DealerSubscriptionPlans() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(true);
  const [busyPlan, setBusyPlan] = useState(null);
  const [consent, setConsent] = useState(false);
  const [consentHighlight, setConsentHighlight] = useState(false);
  const descriptions = t('priceRef.planDescriptions', { returnObjects: true });
  const limits = t('priceRef.carLimits', { returnObjects: true });
  const plans = [['STARTER', 59, 49.17], ['PRO', 119, 99.17], ['PREMIUM', 149, 124.17]];

  const choosePlan = async (planId) => {
    if (busyPlan) return;
    if (!consent) {
      setConsentHighlight(true);
      document.getElementById('plan-consent')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      toast.error(t('payment.consent_required', 'Отметьте согласие перед оплатой'));
      return;
    }
    setBusyPlan(planId);
    try {
      const isAuthed = await auth.isAuthenticated();
      if (!isAuthed) { auth.redirectToLogin(); return; }
      const me = await auth.me();
      if (!me?.dealer_id) { navigate('/DealerRegister?apply=1'); return; }
      await startCheckout({ planId, billing: yearly ? 'yearly' : 'monthly' });
    } catch (err) {
      const key = err?.message === 'popup_blocked' ? 'payment.popup_blocked'
        : err?.message === 'dealer_profile_required' ? 'payment.dealer_only'
          : 'payment.failed';
      toast.error(t(key));
    } finally {
      setBusyPlan(null);
    }
  };

  return <>
    <div className="pr-billing" aria-label={t('priceRef.dealerPlan')}><button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)}>{t('priceRef.monthly')}</button><button type="button" aria-pressed={yearly} onClick={() => setYearly(true)}>{t('priceRef.yearly')} <span>{t('priceRef.saving')}</span></button></div>
    <div id="plan-consent" className="mx-auto mb-4 max-w-3xl"><PaymentConsent checked={consent} onChange={(v) => { setConsent(v); setConsentHighlight(false); }} highlight={consentHighlight} /></div>
    <div className="pr-plan-grid">{plans.map(([name, monthly, annual], i) => <article key={name} className={`pr-plan ${i === 1 ? 'pr-popular' : ''}`}>
      {i === 1 && <span className="pr-popular-label">{t('priceRef.best')}</span>}
      <h3>{name}</h3><p className="pr-plan-description">{descriptions[i]}</p>
      <p className="pr-price"><span className="pr-price-value">{(yearly ? annual : monthly).toFixed(2)}€</span><small>/ {t('priceRef.month')} <span>{t('priceRef.vat')}</span></small></p>
      <p className="pr-plan-saving">{yearly && <><s>{monthly.toFixed(2)}€</s> {t('priceRef.discount')} + {t('priceRef.trial')}</>}</p>
      <p className="pr-limit">{limits[i]}</p>{i === 2 && <p className="pr-purple-note">{t('priceRef.priority')}</p>}
      <button type="button" disabled={!!busyPlan} onClick={() => choosePlan(PLAN_IDS[i])} className={`pr-button ${i !== 1 ? 'pr-button-neutral' : ''}`}>
        {busyPlan === PLAN_IDS[i] ? t('payment.redirecting') : `${t('priceRef.choose')} ${name}`}
      </button>
    </article>)}</div><DealerPlanComparison />
  </>;
}