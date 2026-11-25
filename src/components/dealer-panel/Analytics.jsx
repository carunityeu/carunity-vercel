import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart3, Crown, Eye, Heart, Lock, MessageSquare, Tag } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { formatNumber, formatPrice } from '@/utils/format';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { rateCars } from '@/lib/priceRating';
import { usePricePool } from '@/hooks/useCardExtras';
import PriceRatingBadge from '@/components/cars/PriceRatingBadge';
import { Card, Stat, Bar, EmptyState, Segmented } from './ui';
import { daysOnSale } from './useDealerData';

const pct = (a, b) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

/**
 * Dealer analytics from measured data only: listing views, conversations, price offers and
 * favorites per listing, and the price compared with similar listings on the site.
 * Plan gating: everyone sees the summary; per-listing table from Pro; market comparison on Premium.
 */
export default function Analytics({ data }) {
  const { t } = useTranslation();
  const { cars, chats, offers, favorites, perCar, plan } = data;
  const active = cars.filter((c) => c.status === 'active');
  const [sort, setSort] = useState('views');
  const { data: pool } = usePricePool(plan.hasPremiumAnalytics && active.length > 0);
  const ratings = useMemo(() => (pool ? rateCars(active, pool) : {}), [pool, active.map((c) => c.id).join(',')]);

  const views = active.reduce((s, c) => s + (c.views_count || 0), 0);
  const contacts = chats.length + offers.length;
  const sold = cars.filter((c) => c.status === 'sold').length;
  const funnel = [
    { label: t('dp.views', 'Просмотры'), value: views, icon: Eye },
    { label: t('dp.contacts', 'Обращения и предложения'), value: contacts, icon: MessageSquare },
    { label: t('dp.favorites', 'В избранном'), value: favorites.length, icon: Heart },
    { label: t('dp.sold', 'Продано'), value: sold, icon: Tag },
  ];

  const rows = useMemo(() => active.map((c) => {
    const pc = perCar[c.id] || {};
    return { car: c, views: c.views_count || 0, contacts: (pc.messages || 0) + (pc.offers || 0), favorites: pc.favorites || 0, days: daysOnSale(c), rating: ratings[c.id] };
  }).sort((a, b) => (sort === 'days' ? b.days - a.days : sort === 'contacts' ? b.contacts - a.contacts : b.views - a.views)), [active, perCar, ratings, sort]);

  if (!cars.length) return <Card><EmptyState icon={BarChart3} title={t('dp.analytics_empty', 'Аналитика появится, когда будут объявления')} /></Card>;

  const locked = (text) => (
    <div className="flex items-center gap-3 rounded-xl bg-raised px-4 py-3 text-sm text-ink-2">
      <Lock className="h-4 w-4 flex-shrink-0 text-ink-3" />
      <span className="flex-1">{text}</span>
      <Link to={createPageUrl('DealerPricing')} className="inline-flex items-center gap-1 font-semibold text-brand-text"><Crown className="h-4 w-4" />{t('dp.plans', 'Тарифы')}</Link>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat icon={Eye} label={t('dp.views', 'Просмотры')} value={formatNumber(views)} deltaLabel={t('dp.views_total', 'всего по активным объявлениям')} />
        <Stat icon={MessageSquare} label={t('dp.contacts', 'Обращения и предложения')} value={contacts} deltaLabel={t('dp.contact_rate', '{{p}}% от просмотров', { p: pct(contacts, views) })} />
        <Stat icon={Heart} label={t('dp.favorites', 'В избранном')} value={favorites.length} deltaLabel={t('dp.fav_rate', '{{p}}% от просмотров', { p: pct(favorites.length, views) })} />
        <Stat icon={Tag} label={t('dp.sold', 'Продано')} value={sold} deltaLabel={t('dp.sold_hint', 'отмечено проданными на CarUnity')} />
      </div>

      <Card title={t('dp.funnel', 'От просмотра до сделки')} hint={t('dp.funnel_hint', 'Только измеряемые шаги: без расчётных «показов»')}>
        <div className="space-y-4">
          {funnel.map((step, i) => (
            <div key={step.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-ink"><step.icon className="h-4 w-4 text-ink-3" />{step.label}</span>
                <span className="text-ink-2">
                  <b className="text-ink">{formatNumber(step.value)}</b>
                  {i > 0 && <span className="ml-2 text-xs text-ink-3">{t('dp.of_views', '{{p}}% от просмотров', { p: pct(step.value, views) })}</span>}
                </span>
              </div>
              <Bar value={step.value} max={Math.max(views, 1)} />
            </div>
          ))}
        </div>
      </Card>

      <Card title={t('dp.per_listing', 'По объявлениям')} hint={t('dp.per_listing_hint', 'Активные объявления: интерес покупателей и цена относительно похожих машин на сайте')}
        bodyClassName={plan.hasGoodAnalytics ? 'p-0' : undefined}>
        {!plan.hasGoodAnalytics ? locked(t('dp.lock_per_listing', 'Статистика по каждому объявлению — на тарифах Pro и Premium.')) : (
          <div className="overflow-x-auto">
            <div className="flex items-center gap-3 px-5 pb-3">
              <span className="text-xs text-ink-3">{t('dp.sort', 'Сортировка')}</span>
              <Segmented value={sort} onChange={setSort} items={[
                { value: 'views', label: t('dp.views', 'Просмотры') },
                { value: 'contacts', label: t('dp.contacts_short', 'Обращения') },
                { value: 'days', label: t('dp.days_on_sale', 'Дней в продаже') },
              ]} />
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-3">
                  <th className="px-5 py-2.5 font-medium">{t('dp.listing', 'Объявление')}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t('dp.views', 'Просмотры')}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t('dp.contacts_short', 'Обращения')}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t('dp.favorites_short', 'Избранное')}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t('dp.days_on_sale', 'Дней в продаже')}</th>
                  <th className="px-5 py-2.5 font-medium">{t('dp.vs_market', 'Цена к рынку')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(({ car, views: v, contacts: c, favorites: f, days, rating }) => (
                  <tr key={car.id}>
                    <td className="max-w-[260px] px-5 py-3">
                      <Link to={getCarDetailsPath(car)} className="block truncate font-medium text-ink">{car.brand} {car.model} <span className="font-normal text-ink-3">{car.year}</span></Link>
                      <span className="text-xs text-ink-3">{formatPrice(car.price)}</span>
                    </td>
                    <td className="px-3 py-3 text-right text-ink">{formatNumber(v)}</td>
                    <td className="px-3 py-3 text-right text-ink">{c}<span className="ml-1 text-xs text-ink-3">{v ? `${pct(c, v)}%` : ''}</span></td>
                    <td className="px-3 py-3 text-right text-ink">{f}</td>
                    <td className={`px-3 py-3 text-right ${days > 60 ? 'text-amber-300' : 'text-ink'}`}>{days}</td>
                    <td className="px-5 py-3">
                      {!plan.hasPremiumAnalytics ? <span className="text-xs text-ink-3">{t('dp.premium_only', 'Premium')}</span>
                        : rating ? (
                          <div className="flex items-center gap-2">
                            <PriceRatingBadge score={rating.score} size="lg" />
                            <span className="text-xs text-ink-3">{rating.ratio > 1 ? '+' : ''}{Math.round((rating.ratio - 1) * 100)}%</span>
                          </div>
                        ) : <span className="text-xs text-ink-3">{t('dp.no_peers', 'мало похожих машин')}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {plan.hasGoodAnalytics && !plan.hasPremiumAnalytics && locked(t('dp.lock_market', 'Сравнение цен с похожими машинами на сайте — на тарифе Premium.'))}
    </div>
  );
}
