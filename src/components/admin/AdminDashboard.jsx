import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Car, Building2, Clock, AlertTriangle, Zap, Plus, TrendingUp, TrendingDown,
  ArrowRight, Star, MessageSquare, Flag, Users, CheckCircle, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function AdminDashboard({ stats, onTabChange }) {
  const {
    carsCount, dealersCount, appsCount, reportsCount,
    allCars = [], dealers = [], allMessages = [], reports = [], applications = [],
    dealerLeads = []
  } = stats;

  // --- Real derived stats ---
  const activeCars = allCars.filter(c => c.status === 'active').length;
  const pendingCars = allCars.filter(c => c.status === 'pending').length;
  const soldCars = allCars.filter(c => c.status === 'sold').length;
  const totalViews = allCars.reduce((sum, c) => sum + (c.views_count || 0), 0);
  const unreadMessages = allMessages.filter(m => !m.is_read).length;
  const verifiedDealers = dealers.filter(d => d.is_verified).length;
  const premiumDealers = dealers.filter(d => d.subscription_type === 'premium').length;

  // --- Top body types from real cars ---
  const bodyTypeCounts = useMemo(() => {
    const counts = {};
    allCars.forEach(c => {
      if (c.body_type) counts[c.body_type] = (counts[c.body_type] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    const bodyLabels = {
      suv: 'SUV', sedan: 'Седан', hatchback: 'Хэтчбек',
      wagon: 'Универсал', coupe: 'Купе', crossover: 'Кроссовер',
      convertible: 'Кабриолет', minivan: 'Минивэн', pickup: 'Пикап'
    };
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({
        name: bodyLabels[type] || type,
        count,
        pct: Math.round((count / total) * 100)
      }));
  }, [allCars]);

  // --- Top brands from real cars ---
  const brandCounts = useMemo(() => {
    const counts = {};
    allCars.forEach(c => { if (c.brand) counts[c.brand] = (counts[c.brand] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [allCars]);

  // --- Cars by day (last 7 days sparklines) ---
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({
        date: dateStr,
        cars: allCars.filter(c => c.created_date?.slice(0, 10) === dateStr).length,
        dealers: dealers.filter(c => c.created_date?.slice(0, 10) === dateStr).length,
        messages: allMessages.filter(c => c.created_date?.slice(0, 10) === dateStr).length,
        reports: reports.filter(c => c.created_date?.slice(0, 10) === dateStr).length,
      });
    }
    return days;
  }, [allCars, dealers, allMessages, reports]);

  // --- Recent activity from real data ---
  const recentActivity = useMemo(() => {
    const items = [];
    allCars.slice(0, 3).forEach(c => {
      items.push({
        text: `${c.brand} ${c.model} ${c.year} добавлен`,
        date: c.created_date,
        color: 'bg-emerald-500'
      });
    });
    dealers.slice(0, 2).forEach(d => {
      items.push({
        text: `Новый дилер: ${d.name}`,
        date: d.created_date,
        color: 'bg-emerald-400'
      });
    });
    reports.slice(0, 2).forEach(r => {
      items.push({
        text: `Жалоба: ${r.reason}`,
        date: r.created_date,
        color: 'bg-red-500'
      });
    });
    allMessages.filter(m => !m.is_read).slice(0, 2).forEach(m => {
      items.push({
        text: `Новое сообщение от ${m.sender_email}`,
        date: m.created_date,
        color: 'bg-slate-400'
      });
    });
    return items
      .filter(i => i.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);
  }, [allCars, dealers, reports, allMessages]);

  // --- Conversion funnel from real data ---
  const conversionData = [
    { name: 'Все объявления', value: carsCount, color: '#475569' },
    { name: 'Активные', value: activeCars, color: '#10b981' },
    { name: 'На модерации', value: pendingCars, color: '#94a3b8' },
    { name: 'Продано', value: soldCars, color: '#64748b' },
  ];
  const maxConv = Math.max(...conversionData.map(d => d.value), 1);

  // --- New dealers (real, sorted by date) ---
  const newDealers = useMemo(() => {
    return [...dealers]
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 3);
  }, [dealers]);

  // --- Stat cards with real sparklines ---
  const statCards = [
    {
      label: 'Объявления', value: carsCount,
      icon: Car, iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-400',
      chartColor: '#10b981', chartKey: 'cars',
      sub: `${activeCars} активных`
    },
    {
      label: 'Дилеры', value: dealersCount,
      icon: Building2, iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-400',
      chartColor: '#34d399', chartKey: 'dealers',
      sub: `${verifiedDealers} верифицировано`
    },
    {
      label: 'Ожид. заявки', value: appsCount,
      icon: Clock, iconBg: 'bg-slate-500/20', iconColor: 'text-slate-400',
      chartColor: '#94a3b8', chartKey: 'messages',
      sub: `${applications.length} всего`
    },
    {
      label: 'Жалобы', value: reportsCount,
      icon: AlertTriangle, iconBg: 'bg-red-500/20', iconColor: 'text-red-400',
      chartColor: '#ef4444', chartKey: 'reports',
      sub: 'на рассмотрении'
    },
  ];

  // --- Top cars by views (real data) ---
  const viewsChart = useMemo(() => {
    return [...allCars]
      .filter(c => c.views_count > 0)
      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
      .slice(0, 10)
      .map(c => ({
        name: `${c.brand} ${c.model}`.slice(0, 16),
        views: c.views_count || 0
      }));
  }, [allCars]);

  const maxViews = Math.max(...viewsChart.map(d => d.views), 1);

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <div key={i} className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-4 overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", card.iconBg)}>
                <card.icon className={cn("w-5 h-5", card.iconColor)} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-0.5">{card.value}</div>
            <div className="text-slate-400 text-sm mb-1">{card.label}</div>
            <div className="text-slate-600 text-xs mb-3">{card.sub}</div>
            <div className="h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7Days} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={`sg${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={card.chartColor} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={card.chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey={card.chartKey} stroke={card.chartColor} strokeWidth={1.5} fill={`url(#sg${i})`} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: AI Match + Platform Activity + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AI Match */}
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">AI Match Центр</h3>
            <button onClick={() => onTabChange('aimatch')} className="w-6 h-6 rounded-full border border-[#292a32] flex items-center justify-center text-slate-400 hover:text-white">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <div className="absolute inset-0 rounded-full bg-emerald-500/5 animate-pulse" />
            </div>
            <div className="text-4xl font-bold text-white mb-1">{dealerLeads.length}</div>
            <div className="text-slate-400 text-sm mb-4 text-center">лидов в системе</div>
            <button
              onClick={() => onTabChange('aimatch')}
              className="px-5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
            >
              Открыть AI Match
            </button>
          </div>
          <p className="text-xs text-slate-600 text-center mt-3">
            {activeCars > 0
              ? `${activeCars} активных объявлений готовы к показу`
              : 'Нет активных объявлений'}
          </p>
        </div>

        {/* Views List — top cars by real views_count */}
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Топ по просмотрам</h3>
            <span className="text-xs text-slate-500 bg-[#292a32] px-2 py-1 rounded-lg flex items-center gap-1">
              <Eye className="w-3 h-3" />{totalViews.toLocaleString('ru-RU')}
            </span>
          </div>
          {viewsChart.length === 0 ? (
            <div className="py-8 text-center text-slate-600 text-sm">Нет данных о просмотрах</div>
          ) : (
            <div className="space-y-2.5">
              {viewsChart.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="text-slate-600 text-xs w-4 tabular-nums text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 truncate pr-2">{item.name}</span>
                      <span className="text-slate-400 tabular-nums whitespace-nowrap">{item.views}</span>
                    </div>
                    <div className="h-1.5 bg-[#292a32] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(item.views / maxViews) * 100}%`, opacity: 1 - i * 0.08 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity — real */}
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Последняя активность</h3>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Нет активности</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", item.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-sm leading-snug">{item.text}</p>
                  </div>
                  <span className="text-slate-600 text-xs flex-shrink-0 whitespace-nowrap">
                    {formatDistanceToNow(new Date(item.date), { locale: ru, addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Cars trend + Conversion + Top body types + New dealers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cars added last 7 days */}
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-1">Объявления за 7 дней</h3>
          <div className="text-slate-500 text-xs mb-4">Новые добавления по дням</div>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
                <defs>
                  <linearGradient id="carg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 9 }} tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#292a32', border: 'none', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(v) => [v, 'новых']}
                />
                <Area type="monotone" dataKey="cars" stroke="#10b981" strokeWidth={2} fill="url(#carg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-emerald-400 font-bold text-sm">{activeCars}</div>
              <div className="text-slate-600 text-xs">Активных</div>
            </div>
            <div>
              <div className="text-slate-400 font-bold text-sm">{pendingCars}</div>
              <div className="text-slate-600 text-xs">Ожидают</div>
            </div>
            <div>
              <div className="text-slate-400 font-bold text-sm">{soldCars}</div>
              <div className="text-slate-600 text-xs">Продано</div>
            </div>
          </div>
        </div>

        {/* Conversion — real pipeline */}
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Статусы объявлений</h3>
          <div className="space-y-3">
            {conversionData.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 truncate">{item.name}</span>
                    <span className="text-white font-semibold ml-2">{item.value}</span>
                  </div>
                  <div className="h-1.5 bg-[#292a32] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(item.value / maxConv) * 100}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#292a32]">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Непрочитанных сообщений</span>
              <span className="text-emerald-400 font-bold">{unreadMessages}</span>
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span className="text-slate-500">Premium дилеров</span>
              <span className="text-slate-400 font-bold">{premiumDealers}</span>
            </div>
          </div>
        </div>

        {/* Top body types — real */}
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Топ категории</h3>
          {bodyTypeCounts.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">Нет данных</p>
          ) : (
            <div className="space-y-3">
              {bodyTypeCounts.map((cat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-[#292a32] flex items-center justify-center flex-shrink-0">
                    <Car className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{cat.name}</span>
                      <span className="text-slate-400">{cat.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-[#292a32] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${cat.pct}%`,
                          backgroundColor: ['#10b981', '#34d399', '#6ee7b7', '#059669', '#475569'][i]
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Dealers — real */}
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Новые дилеры</h3>
            <button onClick={() => onTabChange('dealers')} className="text-emerald-400 text-xs hover:underline flex items-center gap-1">
              Все <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {newDealers.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">Нет дилеров</p>
          ) : (
            <div className="space-y-3 mb-4">
              {newDealers.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#292a32] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {d.logo
                      ? <img src={d.logo} alt="" className="w-full h-full object-cover" />
                      : <Building2 className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{d.name}</p>
                    <p className="text-slate-500 text-xs truncate">{d.city}{d.country ? `, ${d.country}` : ''}</p>
                  </div>
                  <span className="text-slate-600 text-xs whitespace-nowrap">
                    {d.created_date ? formatDistanceToNow(new Date(d.created_date), { locale: ru, addSuffix: true }) : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Luxury segment */}
          <div className="pt-3 border-t border-[#292a32]">
            <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 text-sm font-medium">Luxury сегмент</span>
                </div>
                <Link to="/LuxuryAdmin">
                  <button className="text-emerald-400 text-xs hover:underline">Смотреть</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom stats row — real data */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Всего объявлений', value: carsCount, icon: Car },
          { label: 'Активных', value: activeCars, icon: CheckCircle },
          { label: 'Всего дилеров', value: dealersCount, icon: Building2 },
          { label: 'Верифицировано', value: verifiedDealers, icon: CheckCircle },
          { label: 'Непрочит. сообщ.', value: unreadMessages, icon: MessageSquare },
          { label: 'Просмотров всего', value: totalViews.toLocaleString('ru-RU'), icon: Eye },
        ].map((item, i) => (
          <div key={i} className="bg-[#1b1b22] border border-[#292a32] rounded-xl p-3">
            <item.icon className="w-4 h-4 text-slate-400 mb-1.5" />
            <div className="text-white font-bold text-lg leading-none mb-1">{item.value}</div>
            <div className="text-slate-500 text-xs leading-tight">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}