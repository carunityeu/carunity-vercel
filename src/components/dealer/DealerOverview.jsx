import React, { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Car, MessageSquare, Eye, Target, Star, ArrowRight, ArrowUpRight, ArrowDownRight,
  Zap, TrendingDown, X, Plus, Mail,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/format';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import ContactSupportModal from '@/components/ui/ContactSupportModal';

const CARD = 'bg-card border border-border';
const ACCENT = '#10b981';

const statusBadge = {
  active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  sold: 'bg-slate-500/15 text-slate-300 border border-slate-500/25',
  rejected: 'bg-red-500/15 text-red-400 border border-red-500/25',
};

export default function DealerOverview({ dealerCars, dealerMessages, priceOffers, dealerReviews, dealer, onTabChange }) {
  const { t, i18n } = useTranslation();
  const [contactOpen, setContactOpen] = useState(false);
  const localeMap = { ru: 'ru-RU', en: 'en-GB', et: 'et-EE', lv: 'lv-LV', lt: 'lt-LT' };
  const dateLocaleStr = localeMap[i18n.language?.slice(0, 2)] || 'ru-RU';
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString(dateLocaleStr, { day: '2-digit', month: 'short' }) : '—';

  const activeCars = dealerCars.filter(c => c.status === 'active').length;
  const pendingCars = dealerCars.filter(c => c.status === 'pending').length;
  const soldCars = dealerCars.filter(c => c.status === 'sold').length;
  const totalViews = dealerCars.reduce((sum, c) => sum + (c.views_count || 0), 0);
  const unreadMessages = dealerMessages.filter(m => !m.is_read).length;
  const pendingOffers = priceOffers.filter(o => o.status === 'pending').length;
  const avgRating = dealerReviews.length > 0 ? (dealerReviews.reduce((s, r) => s + (r.rating || 0), 0) / dealerReviews.length).toFixed(1) : '—';

  // 14-day series for trends + performance chart
  const last14 = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      days.push({
        date: ds, label: d.toLocaleDateString(dateLocaleStr, { day: '2-digit', month: '2-digit' }),
        cars: dealerCars.filter(c => c.created_date?.slice(0, 10) === ds).length,
        messages: dealerMessages.filter(c => c.created_date?.slice(0, 10) === ds).length,
        offers: priceOffers.filter(c => c.created_date?.slice(0, 10) === ds).length,
      });
    }
    return days;
  }, [dealerCars, dealerMessages, priceOffers, dateLocaleStr]);

  const last7 = last14.slice(7);
  const prev7 = last14.slice(0, 7);
  const sumKey = (arr, k) => arr.reduce((s, d) => s + (d[k] || 0), 0);
  const trendPct = (last, prev) => {
    if (prev === 0) return last > 0 ? 100 : 0;
    return Math.round(((last - prev) / prev) * 100);
  };
  const carsTrend = trendPct(sumKey(last7, 'cars'), sumKey(prev7, 'cars'));
  const msgTrend = trendPct(sumKey(last7, 'messages'), sumKey(prev7, 'messages'));
  const offTrend = trendPct(sumKey(last7, 'offers'), sumKey(prev7, 'offers'));

  const recentCars = useMemo(() => {
    return [...dealerCars].sort((a, b) => {
      const dateA = new Date(a.created_date || a.updated_date || 0);
      const dateB = new Date(b.created_date || b.updated_date || 0);
      if (dateB - dateA !== 0) return dateB - dateA;
      return new Date(b.updated_date || 0) - new Date(a.updated_date || 0);
    }).slice(0, 6);
  }, [dealerCars]);
  const lowPerfCars = useMemo(() => dealerCars.filter(c => c.status === 'active' && !c.is_premium && (c.views_count || 0) < 20).sort((a, b) => (a.views_count || 0) - (b.views_count || 0)).slice(0, 3), [dealerCars]);

  const viewsChart = useMemo(() => [...dealerCars].filter(c => c.views_count > 0).sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 10).map(c => ({ name: `${c.brand} ${c.model}`.slice(0, 16), views: c.views_count || 0 })), [dealerCars]);
  const maxViews = Math.max(...viewsChart.map(d => d.views), 1);

  const bodyTypeCounts = useMemo(() => {
    const counts = {};
    dealerCars.forEach(c => { if (c.body_type) counts[c.body_type] = (counts[c.body_type] || 0) + 1; });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    const labels = { suv: t('body_types.suv'), sedan: t('body_types.sedan'), hatchback: t('body_types.hatchback'), wagon: t('body_types.wagon'), coupe: t('body_types.coupe'), crossover: t('body_types.crossover'), convertible: t('body_types.convertible'), minivan: t('body_types.minivan'), pickup: t('body_types.pickup') };
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([type, count]) => ({ name: labels[type] || type, count, pct: Math.round((count / total) * 100) }));
  }, [dealerCars, t]);

  const [promoDismissed, setPromoDismissed] = useState(() => localStorage.getItem('dealer_promo_dismissed') === '1');
  const dismissPromo = () => { localStorage.setItem('dealer_promo_dismissed', '1'); setPromoDismissed(true); };

  const kpis = [
    { label: t('dealer.tab_cars', 'Объявления'), value: dealerCars.length, icon: Car, trend: carsTrend, sub: `${activeCars} ${t('dealer.stat_active', 'активных')}` },
    { label: t('dealer.stat_views', 'Просмотры'), value: totalViews.toLocaleString(), icon: Eye, trend: null, sub: t('dealer.stat_total_views', 'суммарно') },
    { label: t('dealer.stat_messages', 'Сообщения'), value: dealerMessages.length, icon: MessageSquare, trend: msgTrend, sub: `${unreadMessages} ${t('dealer.stat_unread', 'непрочитанных')}` },
    { label: t('dealer.stat_offers', 'Предложения'), value: priceOffers.length, icon: Target, trend: offTrend, sub: `${pendingOffers} ${t('dealer.stat_pending', 'ожидают')}` },
  ];

  const TrendBadge = ({ pct }) => {
    if (pct === null || pct === 0) return <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-600" />{t('dealer.no_data_change', '—')}</span>;
    const up = pct > 0;
    return <span className={cn('text-[11px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-md', up ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400')}>{up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{Math.abs(pct)}%</span>;
  };

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((card, i) => (
          <div key={i} className={cn(CARD, 'rounded-xl p-4 sm:p-5')}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-lg bg-border flex items-center justify-center"><card.icon className="w-4 h-4 text-slate-300" /></div>
              <div className="text-slate-300 text-sm font-medium">{card.label}</div>
            </div>
            <div className="text-2xl sm:text-[28px] font-bold text-white leading-none tracking-tight">{card.value}</div>
            <div className="flex items-center gap-2 mt-3">
              <TrendBadge pct={card.trend} />
              <span className="text-muted-foreground text-[11px]">{t('dealer.vs_last_week', 'за неделю')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Promo banner */}
      {!promoDismissed && lowPerfCars.length > 0 && (
        <div className={cn(CARD, 'rounded-xl p-4 sm:p-5 relative')}>
          <button onClick={dismissPromo} className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 p-1 rounded-lg"><X className="w-4 h-4" /></button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-border flex items-center justify-center flex-shrink-0"><TrendingDown className="w-5 h-5 text-amber-400" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-white font-semibold text-sm">{t('dealer.promo_banner_title', 'Некоторые объявления получают мало просмотров')}</h3>
                <span className="bg-border text-slate-300 text-xs px-2 py-0.5 rounded-full">{lowPerfCars.length} {t('dealer.promo_banner_count', 'авто')}</span>
              </div>
              <p className="text-slate-400 text-xs mb-3">{t('dealer.promo_banner_desc', 'Поднимите объявления в топ, добавьте премиум-метку и получите больше просмотров.')}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {lowPerfCars.map((car, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-2.5 py-1.5">
                    <div className="w-6 h-5 rounded overflow-hidden flex-shrink-0">{car.images?.[0] ? <img src={car.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-700 flex items-center justify-center"><Car className="w-3 h-3 text-slate-500" /></div>}</div>
                    <span className="text-slate-300 text-xs truncate max-w-[100px]">{car.brand} {car.model}</span>
                    <span className="text-slate-500 text-xs flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{car.views_count || 0}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
              <Link to="/Advertising" className="flex items-center justify-center gap-2 bg-background border border-border hover:border-primary/40 text-foreground font-medium text-sm px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"><Zap className="w-4 h-4" />{t('dealer.promo_cta', 'Продвинуть')}</Link>
              <Link to="/DealerPricing" className="flex items-center justify-center text-slate-300 hover:text-white text-xs px-3 py-2 rounded-xl border border-border hover:border-border transition-colors whitespace-nowrap">{t('dealer.promo_learn_more', 'Узнать о тарифах')}</Link>
            </div>
          </div>
        </div>
      )}

      {/* Row 2: performance chart (full width) */}
      <div className={cn(CARD, 'rounded-xl p-5')}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-sm">{t('dealer.performance_overview', 'Обзор эффективности')}</h3>
            <p className="text-slate-500 text-xs mt-0.5">{t('dealer.new_listings_per_day', 'Новые объявления по дням')}</p>
          </div>
          <span className="text-xs text-slate-400 bg-border px-2.5 py-1 rounded-lg border border-border">{t('dealer.period_7d', '14 дней')}</span>
        </div>
        <div className="h-[200px] sm:h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last14} margin={{ top: 5, right: 5, bottom: 0, left: -28 }}>
              <defs><linearGradient id="perf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={ACCENT} stopOpacity={0.3} /><stop offset="100%" stopColor={ACCENT} stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={1} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#292a32', border: '1px solid #292a32', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#9ca3af' }} itemStyle={{ color: ACCENT }} formatter={(v) => [v, t('dealer.new_listings_per_day', 'новых')]} />
              <Area type="monotone" dataKey="cars" stroke={ACCENT} strokeWidth={2} fill="url(#perf)" dot={{ r: 2, fill: ACCENT, strokeWidth: 0 }} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: recent listings table + top by views */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className={cn(CARD, 'rounded-xl p-5 xl:col-span-2')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">{t('dealer.recent_listings', 'Последние объявления')}</h3>
            <button onClick={() => onTabChange('cars')} className="text-emerald-400 text-xs hover:underline flex items-center gap-1">{t('dealer.view_all', 'Все')} <ArrowRight className="w-3 h-3" /></button>
          </div>
          {recentCars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10"><Car className="w-10 h-10 text-slate-700 mb-3" /><p className="text-slate-500 text-sm">{t('dealer.no_cars_title', 'Нет объявлений')}</p><button onClick={() => onTabChange('cars')} className="mt-3 text-emerald-400 text-xs flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> {t('dealer.add_car', 'Добавить')}</button></div>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full min-w-[440px]">
                <thead>
                  <tr className="text-left text-slate-500 text-xs border-b border-border">
                    <th className="font-medium py-2 px-2">{t('dealer.col_car', 'Авто')}</th>
                    <th className="font-medium py-2 px-2">{t('dealer.col_price', 'Цена')}</th>
                    <th className="font-medium py-2 px-2 hidden sm:table-cell">{t('dealer.col_status', 'Статус')}</th>
                    <th className="font-medium py-2 px-2">{t('dealer.col_views', 'Просмотры')}</th>
                    <th className="font-medium py-2 px-2 hidden sm:table-cell">{t('dealer.col_date', 'Дата')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentCars.map((car) => (
                    <tr key={car.id} className="hover:bg-background/50 transition-colors">
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-border flex-shrink-0 overflow-hidden">{car.images?.[0] ? <img src={car.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Car className="w-4 h-4 text-muted-foreground" /></div>}</div>
                          <div className="min-w-0"><p className="text-white text-sm font-medium truncate max-w-[140px]">{car.brand} {car.model}</p><p className="text-muted-foreground text-xs">{car.year}</p></div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-emerald-400 text-sm font-semibold whitespace-nowrap">{formatPrice(car.price)}</td>
                      <td className="py-2.5 px-2 hidden sm:table-cell"><span className={cn('text-xs px-2 py-0.5 rounded-md border whitespace-nowrap', statusBadge[car.status] || statusBadge.pending)}>{t('car.status_' + car.status, car.status)}</span></td>
                      <td className="py-2.5 px-2 text-slate-400 text-sm flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {car.views_count || 0}</td>
                      <td className="py-2.5 px-2 hidden sm:table-cell text-slate-500 text-sm whitespace-nowrap">{fmtDate(car.created_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={cn(CARD, 'rounded-xl p-5')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">{t('dealer.top_by_views', 'Топ по просмотрам')}</h3>
            <span className="text-xs text-slate-500 bg-border px-2 py-1 rounded-lg flex items-center gap-1"><Eye className="w-3 h-3" />{totalViews.toLocaleString()}</span>
          </div>
          {viewsChart.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">{t('dealer.no_views_data', 'Нет данных о просмотрах')}</p>
          ) : (
            <div className="space-y-3">
              {viewsChart.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs w-4 tabular-nums">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 truncate pr-2">{item.name}</span>
                      <span className="text-slate-400 tabular-nums whitespace-nowrap flex items-center gap-1"><Eye className="w-3 h-3" />{item.views}</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(item.views / maxViews) * 100}%`, opacity: 1 - i * 0.12 }} /></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 4: categories + subscription */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className={cn(CARD, 'rounded-xl p-5')}>
          <h3 className="text-white font-semibold text-sm mb-4">{t('dealer.top_categories', 'Топ категории')}</h3>
          {bodyTypeCounts.length === 0 ? <p className="text-slate-500 text-sm text-center py-6">{t('dealer.no_data', 'Нет данных')}</p> : (
            <div className="space-y-3.5">
              {bodyTypeCounts.map((cat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs w-4 tabular-nums">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-300">{cat.name}</span><span className="text-slate-400 tabular-nums">{cat.pct}%</span></div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${cat.pct}%`, opacity: 1 - i * 0.15 }} /></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={cn(CARD, 'rounded-xl p-5 xl:col-span-2')}>
          <h3 className="text-white font-semibold text-sm mb-4">{t('dealer.subscription', 'Подписка')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={cn('rounded-xl p-4 border bg-background border-border')}>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm uppercase text-white">{t('dealer.plan_' + (dealer?.subscription_type || 'starter'), (dealer?.subscription_type || 'Starter'))}</span>
              </div>
              {dealer?.subscription_until && (() => {
                const daysLeft = Math.max(0, Math.ceil((new Date(dealer.subscription_until) - new Date()) / 86400000));
                return (
                  <div className="mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-emerald-400/80 font-medium uppercase tracking-wide">{t('dealer.active_until', 'Активна до')}</span>
                      <span className="text-[11px] text-emerald-400 font-semibold">{daysLeft} {t('dealer.days_left', 'дн. осталось')}</span>
                    </div>
                    <p className="text-emerald-400 font-bold text-lg mt-0.5">{new Date(dealer.subscription_until).toLocaleDateString(dateLocaleStr, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </div>
                );
              })()}
              {dealer?.is_verified && <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-400" />{t('dealer.verified', 'Верифицирован')}</div>}
            </div>
            <div className="space-y-2">
            <button onClick={() => setContactOpen(true)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-background border border-border hover:border-emerald-500/40 hover:text-white transition-colors group">
              <span className="text-sm text-slate-300 group-hover:text-white flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{t('dealer.contact_us', 'Связаться с нами')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-400" />
            </button>
            </div>
            </div>
            </div>
            </div>

            <ContactSupportModal open={contactOpen} onOpenChange={setContactOpen} />
            </div>
            );
            }