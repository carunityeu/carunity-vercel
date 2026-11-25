import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Building2, Crown, Loader2, Lock, LogOut, Plus, Rocket, UserCog } from 'lucide-react';
import { auth } from '@/api/auth';
import { entities } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { canAddListing, getRemainingSlots } from '@/lib/dealerPlans';
import { readViewAs, clearViewAs } from '@/lib/adminViewAs';
import { Button } from '@/components/ui/button';
import Footer from '@/components/ui/Footer';
import AccountWorkspace from '@/components/account/AccountWorkspace';
import DealerSidebar from '@/components/dealer/DealerSidebar';
import DealerLeads from '@/components/dealer/DealerLeads';
import ViewDeclineBanner from '@/components/dealer/ViewDeclineBanner';
import PromoteListingModal from '@/components/listings/PromoteListingModal';
import useDealerData from '@/components/dealer-panel/useDealerData';
import Overview from '@/components/dealer-panel/Overview';
import Listings from '@/components/dealer-panel/Listings';
import Sourcing from '@/components/dealer-panel/Sourcing';
import Analytics from '@/components/dealer-panel/Analytics';
import SalonSettings from '@/components/dealer-panel/SalonSettings';
import { Notice } from '@/components/dealer-panel/ui';

// Sections (?tab=...). Old links (?tab=fast-sale, get-offers, favorites) open "Sourcing".
const TABS = {
  dashboard: { key: 'dp.nav_overview', fallback: 'Обзор', hint: 'dp.hint_overview', hintFallback: 'Главное о салоне за последние дни' },
  cars: { key: 'dp.nav_listings', fallback: 'Объявления', hint: 'dp.hint_listings', hintFallback: 'Все объявления салона по статусам' },
  leads: { key: 'dp.nav_leads', fallback: 'Лиды', hint: 'dp.hint_leads', hintFallback: 'Покупатели, которые проявили интерес к вашим машинам' },
  sourcing: { key: 'dp.nav_sourcing', fallback: 'Закупка', hint: 'dp.hint_sourcing', hintFallback: 'Пополнение склада: выкуп и комиссия' },
  analytics: { key: 'dp.nav_analytics', fallback: 'Аналитика', hint: 'dp.hint_analytics', hintFallback: 'Интерес покупателей и цены относительно рынка' },
  profile: { key: 'dp.nav_salon', fallback: 'Салон', hint: 'dp.hint_salon', hintFallback: 'Данные салона, оформление и команда' },
};
const LEGACY = { 'fast-sale': ['sourcing', 'buy'], 'get-offers': ['sourcing', 'commission'], favorites: ['sourcing', 'saved'], import: ['cars'] };

export default function DealerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [dealer, setDealer] = useState(null);
  const [dealerIds, setDealerIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [impersonating, setImpersonating] = useState(false);
  const [promoteCars, setPromoteCars] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerPreselected, setPickerPreselected] = useState([]);

  const rawTab = params.get('tab');
  const [legacyTab, legacyView] = LEGACY[rawTab] || [];
  const tab = TABS[rawTab] ? rawTab : legacyTab || 'dashboard';
  const view = params.get('view') || legacyView;

  /** Opens a section (and an inner view: status for listings, sub-section for sourcing). */
  const go = useCallback((nextTab, nextView) => {
    const next = new URLSearchParams();
    if (nextTab && nextTab !== 'dashboard') next.set('tab', nextTab);
    if (nextView) next.set('view', nextView);
    setParams(next);
    window.scrollTo({ top: 0 });
  }, [setParams]);

  useEffect(() => {
    const load = async () => {
      try {
        if (!(await auth.isAuthenticated())) { auth.redirectToLogin(); return; }
        const me = await auth.me();
        setUser(me);
        // An admin previews exactly the chosen salon
        const viewAs = me.role === 'admin' ? readViewAs() : null;
        const asDealer = viewAs?.type === 'dealer' ? viewAs : null;
        if (asDealer) setImpersonating(true);
        const email = asDealer?.email || me.email;
        const { items: requests } = await entities.DealerApplication.filter({ applicant_email: email }, { sort: '-created_date', limit: 1 });
        if (requests[0] && requests[0].status !== 'approved') { navigate('/DealerRegister?apply=1', { replace: true }); return; }
        const dealers = asDealer?.id
          ? [await entities.Dealer.get(asDealer.id).catch(() => null)].filter(Boolean)
          : await entities.Dealer.filter({ owner_email: email });
        if (!dealers.length && me.user_type !== 'dealer' && !asDealer) { navigate(createPageUrl('Dashboard'), { replace: true }); return; }
        if (dealers.length) { setDealer(dealers[0]); setDealerIds(dealers.map((d) => d.id)); }
      } catch (error) {
        if ((error.status || error.response?.status) === 401) auth.redirectToLogin(window.location.href);
        else throw error;
      } finally { setIsLoading(false); }
    };
    load();
  }, [navigate]);

  const data = useDealerData(dealer, impersonating ? { email: dealer?.owner_email } : user);
  const ownerEmail = impersonating ? dealer?.owner_email : user?.email;

  // ?promote=<car id> (from notifications) opens the promotion picker
  useEffect(() => {
    const id = params.get('promote');
    if (id && dealer) { setPickerPreselected([id]); setPickerOpen(true); }
  }, [dealer]);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-page"><Loader2 className="h-8 w-8 animate-spin text-brand-text" /></div>;

  if (!dealer) return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <Building2 className="mx-auto mb-4 h-14 w-14 text-ink-3" />
        <h1 className="mb-2 text-2xl font-bold text-ink">{t('dealer.no_profile_title')}</h1>
        <p className="mb-6 text-ink-2">{t('dealer.no_profile_desc')}</p>
        <Button asChild><Link to={createPageUrl('DealerRegister')}>{t('dealer.register_btn')}</Link></Button>
      </div>
    </div>
  );

  const { plan, cars, loadingCars } = data;
  const remaining = getRemainingSlots(dealer.subscription_type, cars.length);
  const canAdd = canAddListing(dealer.subscription_type, cars.length);
  const meta = TABS[tab];
  const activeCars = cars.filter((c) => c.status === 'active');

  return (
    <>
      <AccountWorkspace sidebar={<DealerSidebar activeTab={tab} onTabChange={(k) => go(k)} carsCount={cars.length} dealer={dealer} />}>
        <main className="min-w-0 space-y-5">
          {impersonating && (
            <Notice tone="warn" icon={UserCog}
              action={<button type="button" onClick={() => { clearViewAs(); window.location.href = '/x9-admin'; }} className="inline-flex items-center gap-1.5 font-semibold"><LogOut className="h-4 w-4" />{t('dealer.exit_preview')}</button>}>
              {t('dealer.impersonating', { name: dealer.name || '—' })}
            </Notice>
          )}

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-ink">{t(meta.key, meta.fallback)}</h1>
              <p className="mt-1 text-sm text-ink-3">{t(meta.hint, meta.hintFallback)}</p>
            </div>
            {(tab === 'dashboard' || tab === 'cars') && (
              <div className="flex flex-shrink-0 items-center gap-2">
                {activeCars.length > 0 && (
                  <Button variant="secondary" onClick={() => { setPickerPreselected([]); setPickerOpen(true); }}><Rocket />{t('view_decline.manual_promote', 'Продвинуть')}</Button>
                )}
                <Button asChild disabled={loadingCars}>
                  <Link to={canAdd ? createPageUrl('CreateListing') + `?dealer_id=${dealer.id}` : createPageUrl('DealerPricing')}><Plus />{t('dealer.add_car', 'Добавить авто')}</Link>
                </Button>
              </div>
            )}
          </div>

          <ViewDeclineBanner dealer={{ ...dealer, email: ownerEmail }} onPromote={(ids) => { setPickerPreselected(ids); setPickerOpen(true); }} />

          {!loadingCars && plan.maxListings !== Infinity && remaining <= 2 && (
            <Notice tone={remaining === 0 ? 'danger' : 'warn'} icon={remaining === 0 ? Lock : AlertTriangle}
              action={<Link to={createPageUrl('DealerPricing')} className="inline-flex items-center gap-1 font-semibold"><Crown className="h-4 w-4" />{t('dealer.upgrade_plan', 'Улучшить тариф')}</Link>}>
              {remaining === 0
                ? t('dp.limit_reached', 'Достигнут лимит тарифа: {{n}} объявлений.', { n: plan.maxListings })
                : t('dp.limit_near', 'Осталось мест для объявлений: {{n}} из {{max}}.', { n: remaining, max: plan.maxListings })}
            </Notice>
          )}

          {tab === 'dashboard' && <Overview dealer={dealer} data={data} go={go} />}
          {tab === 'cars' && <Listings key={view} dealer={dealer} data={data} initialStatus={view} onPromote={(car) => setPromoteCars([car])} />}
          {tab === 'leads' && (plan.hasLeads
            ? <DealerLeads dealerId={dealer.id} dealerIds={dealerIds} cars={cars} dealerEmail={ownerEmail} />
            : <Notice icon={Lock} action={<Link to={createPageUrl('DealerPricing')} className="font-semibold">{t('dp.plans', 'Тарифы')}</Link>}>{t('dp.leads_locked', 'Лиды доступны на тарифе Premium.')}</Notice>)}
          {tab === 'sourcing' && <Sourcing key={view} dealer={dealer} user={user} plan={plan} initialView={view} />}
          {tab === 'analytics' && <Analytics data={data} />}
          {tab === 'profile' && <SalonSettings dealer={dealer} cars={cars} onSaved={setDealer} />}
        </main>
      </AccountWorkspace>
      <Footer />
      <PromoteListingModal
        cars={pickerOpen ? activeCars : promoteCars}
        initialSelectedIds={pickerOpen ? pickerPreselected : undefined}
        open={pickerOpen || promoteCars.length > 0}
        onClose={() => { setPickerOpen(false); setPromoteCars([]); }}
        onSuccess={async (results = []) => {
          queryClient.invalidateQueries({ queryKey: ['dealerOwnCars'] });
          // The "views are dropping" notices of promoted listings are done with
          const carIds = results.map((r) => r.carId).filter(Boolean);
          if (carIds.length && ownerEmail) {
            await entities.Notification.updateMany({ user_email: ownerEmail, type: 'view_decline', car_id: { $in: carIds }, is_read: false }, { $set: { is_read: true } }).catch(() => {});
            queryClient.invalidateQueries({ queryKey: ['viewDeclineNotifs'] });
          }
        }}
        sellerEmail={ownerEmail} dealerId={dealer.id}
      />
    </>
  );
}
