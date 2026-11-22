import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Eye, MessageSquare, Heart, TrendingUp, CheckCircle, AlertCircle, Lightbulb, Car, ChevronDown, ChevronUp } from 'lucide-react';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import { ru, enUS, et, lv, lt } from 'date-fns/locale';

const DATE_LOCALES = { ru, en: enUS, et, lv, lt };
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/utils/format';
import InfoHint from '@/components/dealer/InfoHint';

function scoreListingQuality(car, t) {
  let score = 0;
  const tips = [];

  const imgCount = (car.images || []).length;
  if (imgCount >= 8) score += 25;
  else if (imgCount >= 4) { score += 15; tips.push(t('dealer.tip_add_photos', { count: 8 - imgCount, current: imgCount })); }
  else { score += imgCount * 3; tips.push(t('dealer.tip_more_photos', { count: imgCount })); }

  if (car.description && car.description.length > 100) score += 20;
  else if (car.description && car.description.length > 30) { score += 10; tips.push(t('dealer.tip_expand_desc')); }
  else { tips.push(t('dealer.tip_add_desc')); }

  const fields = ['mileage', 'fuel_type', 'transmission', 'body_type', 'engine_power', 'engine_volume', 'drive_type', 'color'];
  const filled = fields.filter(f => car[f] !== undefined && car[f] !== null && car[f] !== '').length;
  score += Math.round((filled / fields.length) * 30);
  if (filled < fields.length) tips.push(t('dealer.tip_fill_specs', { filled, total: fields.length }));

  if (car.vin) score += 10;
  else tips.push(t('dealer.tip_add_vin'));

  if (car.is_premium) score += 15;

  return { score: Math.min(100, score), tips: tips.slice(0, 3) };
}

export default function DealerAnalyticsBasic({ dealerCars, dealerMessages, priceOffers, dealer }) {
  const { t, i18n } = useTranslation();
  const dateLocale = DATE_LOCALES[i18n.language?.slice(0, 2)] || ru;
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const activeCars = dealerCars.filter(c => c.status === 'active');
  const selectedCar = selectedCarId ? dealerCars.find(c => c.id === selectedCarId) : activeCars[0];

  // Fetch view history for dealer's cars
  const carIds = dealerCars.map(c => c.id);
  const { data: viewHistory = [] } = useQuery({
    queryKey: ['dealerViewHistory', dealer?.id],
    queryFn: async () => {
      const all = await base44.entities.ViewHistory.list('-viewed_at', 500);
      return all.filter(v => carIds.includes(v.car_id));
    },
    enabled: carIds.length > 0
  });

  // Fetch favorites for dealer's cars
  const { data: favorites = [] } = useQuery({
    queryKey: ['dealerFavorites', dealer?.id],
    queryFn: async () => {
      const all = await base44.entities.Favorite.list('-created_date', 500);
      return all.filter(f => carIds.includes(f.car_id));
    },
    enabled: carIds.length > 0
  });

  // Fetch similar cars for market comparison
  const { data: marketCars = [] } = useQuery({
    queryKey: ['marketCars', selectedCar?.brand, selectedCar?.model],
    queryFn: () => base44.entities.Car.filter({ brand: selectedCar.brand, model: selectedCar.model, status: 'active' }, '-created_date', 50),
    enabled: !!selectedCar?.brand
  });

  // Views chart for selected car — last 14 days
  const viewsChart = useMemo(() => {
    if (!selectedCar) return [];
    return Array.from({ length: 14 }, (_, i) => {
      const d = subDays(new Date(), 13 - i);
      const label = format(d, 'd MMM', { locale: dateLocale });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const views = viewHistory.filter(v =>
        v.car_id === selectedCar.id &&
        v.viewed_at &&
        new Date(v.viewed_at) >= dayStart &&
        new Date(v.viewed_at) < dayEnd
      ).length;
      return { label, views };
    });
  }, [viewHistory, selectedCar]);

  // Contacts chart — messages per day
  const contactsChart = useMemo(() => {
    if (!selectedCar) return [];
    return Array.from({ length: 14 }, (_, i) => {
      const d = subDays(new Date(), 13 - i);
      const label = format(d, 'd MMM', { locale: dateLocale });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const contacts = dealerMessages.filter(m =>
        m.car_id === selectedCar.id &&
        m.created_date &&
        new Date(m.created_date) >= dayStart &&
        new Date(m.created_date) < dayEnd
      ).length;
      return { label, contacts };
    });
  }, [dealerMessages, selectedCar]);

  // Market comparison
  const marketComparison = useMemo(() => {
    if (!selectedCar || marketCars.length < 2) return null;
    const others = marketCars.filter(c => c.id !== selectedCar.id && c.price > 0);
    if (others.length === 0) return null;
    const avgMarket = Math.round(others.reduce((s, c) => s + c.price, 0) / others.length);
    const diff = selectedCar.price - avgMarket;
    const diffPct = Math.round((diff / avgMarket) * 100);
    return { avgMarket, diff, diffPct, count: others.length };
  }, [selectedCar, marketCars]);

  // Summary stats for selected car
  const carViews = selectedCar ? viewHistory.filter(v => v.car_id === selectedCar.id).length : 0;
  const carUniqueViews = selectedCar ? new Set(viewHistory.filter(v => v.car_id === selectedCar.id).map(v => v.user_email)).size : 0;
  const carContacts = selectedCar ? dealerMessages.filter(m => m.car_id === selectedCar.id).length + priceOffers.filter(o => o.car_id === selectedCar.id).length : 0;
  const carFavs = selectedCar ? favorites.filter(f => f.car_id === selectedCar.id).length : 0;
  const ctr = carViews > 0 ? ((carContacts / carViews) * 100).toFixed(1) : '0';

  const quality = selectedCar ? scoreListingQuality(selectedCar, t) : null;

  const displayCars = showAll ? activeCars : activeCars.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Car selector */}
      <div className="bg-[#1b1b22] rounded-2xl border border-[#292a32] p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{t('dealer.select_listing')}</p>
        <div className="flex flex-wrap gap-2">
          {displayCars.map(car => (
            <button
              key={car.id}
              onClick={() => setSelectedCarId(car.id)}
              className={cn(
                'px-3 py-2 rounded-xl text-sm border transition-all text-left',
                (selectedCar?.id === car.id)
                  ? 'border-emerald-500/40 bg-[#101014] text-white font-medium'
                  : 'border-[#292a32] text-slate-400 hover:border-[#292a32] hover:text-white'
              )}
            >
              {car.brand} {car.model} {car.year}
            </button>
          ))}
          {activeCars.length > 5 && (
            <button
              onClick={() => setShowAll(v => !v)}
              className="px-3 py-2 rounded-xl text-sm border border-dashed border-[#292a32] text-slate-400 hover:text-white flex items-center gap-1"
            >
              {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showAll ? t('dealer.collapse') : `${t('dealer.show_more')} ${activeCars.length - 5}`}
            </button>
          )}
        </div>
        {activeCars.length === 0 && <p className="text-sm text-slate-400">{t('dealer.no_active_listings')}</p>}
      </div>

      {selectedCar && (
        <>
          {/* 1. Summary stats */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{t('dealer.listing_summary')}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: t('dealer.total_views'), value: carViews, sub: `${carUniqueViews} ${t('dealer.unique_views')}`, icon: Eye },
                { label: t('dealer.contacts'), value: carContacts, sub: t('dealer.contacts_sub'), icon: MessageSquare },
                { label: t('dealer.ctr'), value: `${ctr}%`, sub: t('dealer.ctr_sub'), icon: TrendingUp, hint: 'dealer.info_ctr' },
                { label: t('dealer.in_favorites'), value: carFavs, sub: t('dealer.fav_users'), icon: Heart },
              ].map(({ label, value, sub, icon: Icon, hint }) => (
                <div key={label} className="bg-[#1b1b22] rounded-2xl border border-[#292a32] p-5">
                  <Icon className="w-4 h-4 text-slate-400 mb-2" />
                  <p className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{value}</p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">{label}{hint && <InfoHint titleKey={`${hint}_title`} descKey={`${hint}_desc`} />}</p>
                  <p className="text-xs text-slate-300 dark:text-slate-600">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1b1b22] rounded-2xl border border-[#292a32] p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">{t('dealer.views_14days')}</p>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={viewsChart} margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292a32" />
                  <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #292a32', background: '#292a32', color: '#fff' }} labelStyle={{ color: '#9ca3af' }} itemStyle={{ color: '#10b981' }} />
                  <Line type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} dot={false} name={t('dealer.views_label')} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-[#1b1b22] rounded-2xl border border-[#292a32] p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">{t('dealer.contacts_14days')}</p>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={contactsChart} margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292a32" />
                  <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #292a32', background: '#292a32', color: '#fff' }} labelStyle={{ color: '#9ca3af' }} itemStyle={{ color: '#10b981' }} />
                  <Line type="monotone" dataKey="contacts" stroke="#10b981" strokeWidth={2} dot={false} name={t('dealer.contacts_label')} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3 + 4. Quality + Market in one row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quality score */}
            <div className="bg-[#1b1b22] rounded-2xl border border-[#292a32] p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">{t('dealer.listing_quality')}</p>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="#292a32" strokeWidth="6" />
                    <circle
                      cx="32" cy="32" r="26" fill="none"
                      stroke={quality.score >= 70 ? '#10b981' : quality.score >= 40 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="6"
                      strokeDasharray={`${(quality.score / 100) * 163} 163`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{quality.score}</span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {quality.score >= 70 ? t('dealer.quality_good') : quality.score >= 40 ? t('dealer.quality_avg') : t('dealer.quality_poor')}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{t('dealer.quality_of')}</p>
                    <div className="flex gap-1 mt-2">
                    {[t('dealer.quality_photos'), t('dealer.quality_desc'), t('dealer.quality_specs'), t('dealer.quality_vin')].map((f, i) => {
                      const scores = [
                        (selectedCar.images || []).length >= 8,
                        (selectedCar.description || '').length > 100,
                        ['mileage','fuel_type','transmission','body_type','engine_power'].filter(k => selectedCar[k]).length >= 4,
                        !!selectedCar.vin
                      ];
                      return (
                        <div key={f} className={cn('w-2 h-2 rounded-full', scores[i] ? 'bg-emerald-500' : 'bg-[#292a32]')} title={f} />
                      );
                    })}
                  </div>
                </div>
              </div>
              {quality.tips.length > 0 && (
                <div className="space-y-1.5">
                  {quality.tips.map((tip, i) => (
                    <div key={i} className="flex gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
              {quality.tips.length === 0 && (
                <div className="flex gap-2 text-xs text-emerald-600">
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{t('dealer.quality_perfect')}</span>
                </div>
              )}
            </div>

            {/* Market comparison */}
            <div className="bg-[#1b1b22] rounded-2xl border border-[#292a32] p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">{t('dealer.market_comparison')}</p>
              {marketComparison ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400">{t('dealer.your_price')}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{formatPrice(selectedCar.price)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400">{t('dealer.avg_market')} ({marketComparison.count})</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{formatPrice(marketComparison.avgMarket)}</p>
                    </div>
                  </div>
                  <div className={cn(
                    'rounded-xl px-4 py-3 flex items-center gap-3',
                    marketComparison.diffPct > 10 ? 'bg-red-50 dark:bg-red-900/20' :
                    marketComparison.diffPct < -10 ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                    'bg-[#101014]'
                  )}>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {marketComparison.diffPct > 10 ? `⚠️ ${t('dealer.pricier_market')}` :
                         marketComparison.diffPct < -10 ? `✅ ${t('dealer.cheaper_market')}` :
                         `✓ ${t('dealer.in_market')}`}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                        {marketComparison.diffPct > 0 ? `+${marketComparison.diffPct}%` : `${marketComparison.diffPct}%`} {t('dealer.relative_avg')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 py-4 text-center">{t('dealer.no_compare_data')}</p>
              )}
            </div>
          </div>

          {/* 5. Quick recommendations */}
          <div className="bg-[#1b1b22] rounded-2xl border border-[#292a32] p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">{t('dealer.quick_recs')}</p>
            <div className="space-y-2">
              {[
                quality.tips[0] || null,
                marketComparison && marketComparison.diffPct > 10 ? t('dealer.rec_lower_price', { amount: Math.round((marketComparison.diffPct - 5) / 100 * selectedCar.price / 100) * 100 }) : null,
                carContacts === 0 && carViews > 10 ? t('dealer.rec_check_desc') : null,
                (selectedCar.images || []).length < 4 ? t('dealer.rec_add_photos') : null,
              ].filter(Boolean).slice(0, 3).map((tip, i) => (
                <div key={i} className="flex gap-3 p-3 bg-[#101014] rounded-xl">
                  <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700 dark:text-slate-300">{tip}</p>
                </div>
              ))}
              {[quality.tips[0], marketComparison?.diffPct > 10, carContacts === 0 && carViews > 10, (selectedCar.images||[]).length < 4].filter(Boolean).length === 0 && (
                <div className="flex gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">{t('dealer.listing_looks_good')}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}