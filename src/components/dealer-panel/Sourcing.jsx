import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Crown, Lock } from 'lucide-react';
import { createPageUrl } from '@/utils';
import FastSaleCars from '@/components/dealer/FastSaleCars';
import DealerGetOffers from '@/components/get-offers/DealerGetOffers';
import DealerFavorites from '@/components/dealer/DealerFavorites';
import { Card, Segmented, EmptyState } from './ui';

// Getting cars into stock, in one place: buy outright from private sellers (Premium),
// sell on commission (Pro and Premium), and the cars the dealer saved for later.
export default function Sourcing({ dealer, user, plan, initialView }) {
  const { t } = useTranslation();
  const views = [
    { value: 'buy', label: t('dp.src_buy', 'Выкуп'), allowed: plan.hasFastSale, need: 'Premium' },
    { value: 'commission', label: t('dp.src_commission', 'Комиссия'), allowed: plan.hasGetOffers, need: 'Pro' },
    { value: 'saved', label: t('dp.src_saved', 'Сохранённые'), allowed: true },
  ];
  const first = views.find((v) => v.allowed)?.value || 'saved';
  const [view, setView] = useState(views.some((v) => v.value === initialView) ? initialView : first);
  const current = views.find((v) => v.value === view);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented value={view} onChange={setView} items={views.map((v) => ({ value: v.value, label: v.label }))} />
        <p className="text-sm text-ink-3">
          {view === 'buy' && t('dp.src_buy_hint', 'Машины частников, подходящие под ваши критерии: предложите цену выкупа.')}
          {view === 'commission' && t('dp.src_commission_hint', 'Частники, готовые продать через салон: предложите комиссию.')}
          {view === 'saved' && t('dp.src_saved_hint', 'Объявления, которые вы сохранили в избранное.')}
        </p>
      </div>

      {!current.allowed ? (
        <Card>
          <EmptyState icon={Lock} title={t('dp.src_locked', 'Доступно на тарифе {{plan}}', { plan: current.need })}
            action={<Link to={createPageUrl('DealerPricing')} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand px-4 text-sm font-semibold text-white"><Crown className="h-4 w-4" />{t('dp.plans', 'Тарифы')}</Link>} />
        </Card>
      ) : view === 'buy' ? <FastSaleCars dealer={dealer} />
        : view === 'commission' ? <DealerGetOffers dealer={dealer} />
          : <DealerFavorites user={user} />}
    </div>
  );
}
