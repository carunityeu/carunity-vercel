import React, { useMemo, useState } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Car, Building2, MessageSquare, Eye, TrendingUp, Zap,
  Users, Star, AlertTriangle, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { formatPrice } from '@/utils/format';
import AdminMonthlyStats from './AdminMonthlyStats';

const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#059669', '#047857', '#475569', '#64748b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#292a32] border border-[#292a32] rounded-lg p-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value?.toLocaleString('ru-RU')}</span></p>
      ))}
    </div>
  );
};

export default function AdminAnalytics({ allCars = [], dealers = [], allMessages = [], reports = [], applications = [], dealerLeads = [], users = [], views = [], saleFeedback = [] }) {
  const [period, setPeriod] = useState(30);
  const cutoff = useMemo(() => subDays(new Date(), period), [period]);
  const recent = (arr) => arr.filter(item => item.created_date && new Date(item.created_date) >= cutoff);

  const recentCars = recent(allCars);
  const recentDealers = recent(dealers);
  const recentMessages = recent(allMessages);
  const recentLeads = recent(dealerLeads);

  const dailyActivity = useMemo(() => {
    const days = [];
    for (let i = period - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      days.push({
        date: format(d, period <= 14 ? 'dd.MM' : 'dd.MM'),
        cars: allCars.filter(c => c.created_date?.slice(0, 10) === dateStr).length,
        messages: allMessages.filter(c => c.created_date?.slice(0, 10) === dateStr).length,
      });
    }
    return days;
  }, [allCars, allMessages, period]);

  const brandData = useMemo(() => {
    const counts = {};
    allCars.forEach(c => { if (c.brand) counts[c.brand] = (counts[c.brand] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [allCars]);

  const fuelData = useMemo(() => {
    const labels = { petrol: 'Бензин', diesel: 'Дизель', electric: 'Электро', hybrid: 'Гибрид', plugin_hybrid: 'Плагин', gas: 'Газ' };
    const counts = {};
    allCars.forEach(c => { if (c.fuel_type) counts[c.fuel_type] = (counts[c.fuel_type] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([type, value]) => ({ name: labels[type] || type, value }));
  }, [allCars]);

  const statusFunnel = useMemo(() => [
    { name: 'Все', value: allCars.length, color: '#475569' },
    { name: 'Активные', value: allCars.filter(c => c.status === 'active').length, color: '#10b981' },
    { name: 'Модерация', value: allCars.filter(c => c.status === 'pending').length, color: '#94a3b8' },
    { name: 'Продано', value: allCars.filter(c => c.status === 'sold').length, color: '#64748b' },
    { name: 'Отклонено', value: allCars.filter(c => c.status === 'rejected').length, color: '#ef4444' },
  ], [allCars]);

  const leadStatus = useMemo(() => {
    const labels = { new: 'Новые', contacted: 'Контакт', meeting: 'Встреча', sold: 'Продажа', rejected: 'Отказ' };
    const counts = {};
    dealerLeads.forEach(l => { if (l.status) counts[l.status] = (counts[l.status] || 0) + 1; });
    return Object.entries(counts).map(([k, v]) => ({ name: labels[k] || k, value: v }));
  }, [dealerLeads]);

  const yearData = useMemo(() => {
    const counts = {};
    allCars.forEach(c => { if (c.year) counts[c.year] = (counts[c.year] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => Number(a[0]) - Number(b[0])).map(([year, value]) => ({ year, value }));
  }, [allCars]);

  const totalViews = allCars.reduce((s, c) => s + (c.views_count || 0), 0);
  const avgPrice = allCars.filter(c => c.price).length ? Math.round(allCars.filter(c => c.price).reduce((s, c) => s + c.price, 0) / allCars.filter(c => c.price).length) : 0;
  const conversionRate = allCars.length ? Math.round((allCars.filter(c => c.status === 'sold').length / allCars.length) * 100) : 0;
  const verifiedDealers = dealers.filter(d => d.is_verified).length;

  const visitors = useMemo(
    () => new Set(views.filter(v => v.user_email && new Date(v.viewed_at || v.created_date || 0) >= cutoff).map(v => v.user_email)).size,
    [views, cutoff]
  );
  const recentUsers = users.filter(u => u.created_date && new Date(u.created_date) >= cutoff).length;

  const kpis = [
    { label: 'Пользователей', value: users.length, icon: Users, sub: `+${recentUsers}` },
    { label: 'Посетителей', value: visitors, icon: Eye, sub: 'уникальных' },
    { label: 'Объявлений', value: allCars.length, icon: Car, sub: `+${recentCars.length}` },
    { label: 'Дилеров', value: dealers.length, icon: Building2, sub: `${verifiedDealers} вериф.` },
    { label: 'Лидов', value: dealerLeads.length, icon: Zap, sub: `+${recentLeads.length}` },
    { label: 'Сообщений', value: allMessages.length, icon: MessageSquare, sub: `+${recentMessages.length}` },
    { label: 'Просмотров', value: totalViews.toLocaleString('ru-RU'), icon: Eye, sub: 'суммарно' },
    { label: 'Конверсия', value: `${conversionRate}%`, icon: TrendingUp, sub: 'объяв.→продано' },
    { label: 'Продано через CarUnity', value: saleFeedback.filter(f => f.answer === 'sold').length, icon: Star, sub: `из ${allCars.filter(c => c.status === 'sold').length} проданных` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-white font-bold text-lg">Аналитика платформы</h2>
        <div className="flex gap-1 bg-[#1b1b22] border border-[#292a32] rounded-xl p-1">
          {[7, 14, 30, 90].map(d => (
            <button key={d} onClick={() => setPeriod(d)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", period === d ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white')}
            >{d}д</button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#292a32] flex items-center justify-center flex-shrink-0">
                <kpi.icon className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white leading-none">{kpi.value}</div>
            <div className="text-slate-400 text-xs mt-1">{kpi.label}</div>
            <div className="text-slate-600 text-xs">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <AdminMonthlyStats
        users={users}
        cars={allCars}
        messages={allMessages}
        dealers={dealers}
        leads={dealerLeads}
      />

      {/* Activity chart */}
      <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-4 sm:p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Активность за {period} дней</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyActivity} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="ag_cars" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ag_msgs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} interval={period > 14 ? Math.floor(period / 7) - 1 : 0} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cars" name="Объявления" stroke="#34d399" strokeWidth={2} fill="url(#ag_cars)" dot={false} />
              <Area type="monotone" dataKey="messages" name="Сообщения" stroke="#10b981" strokeWidth={2} fill="url(#ag_msgs)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row: Brands + Status funnel + Fuel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-4 sm:p-5">
          <h3 className="text-white font-semibold text-sm mb-3">Топ марок</h3>
          {brandData.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">Нет данных</p>
          ) : (
            <div className="space-y-2.5">
              {brandData.map((b, i) => {
                const pct = Math.round((b.value / (brandData[0]?.value || 1)) * 100);
                return (
                  <div key={b.name} className="flex items-center gap-2.5">
                    <span className="text-slate-600 text-xs w-4 tabular-nums">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 truncate">{b.name}</span>
                        <span className="text-slate-400 ml-2">{b.value}</span>
                      </div>
                      <div className="h-1.5 bg-[#292a32] rounded-full">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-4 sm:p-5">
          <h3 className="text-white font-semibold text-sm mb-3">Воронка объявлений</h3>
          <div className="space-y-2.5">
            {statusFunnel.map((item) => {
              const pct = statusFunnel[0].value ? Math.round((item.value / statusFunnel[0].value) * 100) : 0;
              return (
                <div key={item.name} className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{item.name}</span>
                      <span className="text-white font-semibold">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-[#292a32] rounded-full">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-[#292a32] flex justify-between text-xs">
            <span className="text-slate-500">Средняя цена</span>
            <span className="text-emerald-400 font-bold">{avgPrice ? formatPrice(avgPrice) : '—'}</span>
          </div>
        </div>

        <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-4 sm:p-5">
          <h3 className="text-white font-semibold text-sm mb-3">Тип топлива</h3>
          {fuelData.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">Нет данных</p>
          ) : (
            <>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={fuelData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                      {fuelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {fuelData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-slate-400 truncate">{item.name}</span>
                    <span className="text-xs text-slate-600 ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Row: Year chart + Lead statuses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-4 sm:p-5">
          <h3 className="text-white font-semibold text-sm mb-3">Распределение по годам</h3>
          {yearData.length === 0 ? <p className="text-slate-500 text-sm text-center py-6">Нет данных</p> : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yearData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="yr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} interval={Math.floor(yearData.length / 8)} />
                  <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" name="объявлений" stroke="#34d399" strokeWidth={2} fill="url(#yr)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-4 sm:p-5">
          <h3 className="text-white font-semibold text-sm mb-3">Статусы лидов</h3>
          {leadStatus.length === 0 ? <p className="text-slate-500 text-sm text-center py-6">Нет лидов</p> : (
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={leadStatus} cx="50%" cy="50%" outerRadius={50} paddingAngle={3} dataKey="value">
                    {leadStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="space-y-1 mt-2">
            {leadStatus.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />{item.name}
                </span>
                <span className="text-white font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom summary — no emojis */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Заявки дилеров', value: applications.length, sub: `${applications.filter(a => a.status === 'pending').length} ожидают`, icon: Activity },
          { label: 'Жалобы', value: reports.length, sub: 'на рассмотрении', icon: AlertTriangle },
          { label: 'Premium дилеров', value: dealers.filter(d => d.subscription_type === 'premium').length, sub: 'из ' + dealers.length, icon: Star },
          { label: 'Новых за период', value: recentCars.length + recentDealers.length, sub: `за ${period}д`, icon: Users },
        ].map((item, i) => (
          <div key={i} className="bg-[#1b1b22] border border-[#292a32] rounded-xl p-3">
            <item.icon className="w-4 h-4 text-slate-400 mb-2" />
            <div className="text-white font-bold text-lg">{item.value}</div>
            <div className="text-slate-400 text-xs">{item.label}</div>
            <div className="text-slate-600 text-xs">{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}