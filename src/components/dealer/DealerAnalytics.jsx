import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, PieChart, Pie, Legend
} from 'recharts';
import { BarChart2, TrendingUp, Eye, Car, CheckCircle, Tag, Star, MessageSquare, DollarSign, Filter } from 'lucide-react';
import { subDays, subWeeks, subMonths, format, isAfter, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { formatPrice } from '@/utils/format';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#ec4899', '#d97706', '#06b6d4', '#ef4444'];

const fuelLabels = { petrol: 'Бензин', diesel: 'Дизель', electric: 'Электро', hybrid: 'Гибрид', plugin_hybrid: 'Плагин', gas: 'Газ' };
const bodyLabels = { sedan: 'Седан', hatchback: 'Хэтчбек', suv: 'Внедорожник', crossover: 'Кроссовер', wagon: 'Универсал', coupe: 'Купе', convertible: 'Кабриолет', minivan: 'Минивэн', pickup: 'Пикап' };

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2 text-center">
      <Icon className={`w-6 h-6 ${color}`} />
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export default function DealerAnalytics({ dealerCars, dealerReviews, dealerMessages, priceOffers }) {
  const [timePeriod, setTimePeriod] = useState('week');

  // KPIs
  const totalViews = dealerCars.reduce((s, c) => s + (c.views_count || 0), 0);
  const activeCars = dealerCars.filter(c => c.status === 'active').length;
  const soldCars = dealerCars.filter(c => c.status === 'sold').length;
  const avgRating = dealerReviews.length
    ? (dealerReviews.reduce((s, r) => s + r.rating, 0) / dealerReviews.length).toFixed(1)
    : '—';
  const avgPrice = dealerCars.length
    ? Math.round(dealerCars.reduce((s, c) => s + (c.price || 0), 0) / dealerCars.length)
    : 0;

  // Top cars by views
  const topCars = [...dealerCars].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5);

  // Brand distribution
  const brandMap = {};
  dealerCars.forEach(c => { brandMap[c.brand] = (brandMap[c.brand] || 0) + 1; });
  const brandData = Object.entries(brandMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count }));

  // Body type distribution
  const bodyMap = {};
  dealerCars.forEach(c => { if (c.body_type) bodyMap[bodyLabels[c.body_type] || c.body_type] = (bodyMap[bodyLabels[c.body_type] || c.body_type] || 0) + 1; });
  const bodyData = Object.entries(bodyMap).map(([name, value]) => ({ name, value }));

  // Fuel type distribution
  const fuelMap = {};
  dealerCars.forEach(c => { if (c.fuel_type) fuelMap[fuelLabels[c.fuel_type] || c.fuel_type] = (fuelMap[fuelLabels[c.fuel_type] || c.fuel_type] || 0) + 1; });
  const fuelData = Object.entries(fuelMap).map(([name, value]) => ({ name, value }));

  // Views over time — generate buckets based on car created_date as proxy
  const now = new Date();
  const buildTimeData = () => {
    if (timePeriod === 'day') {
      // last 7 days
      return Array.from({ length: 7 }, (_, i) => {
        const d = subDays(now, 6 - i);
        const label = format(d, 'd MMM', { locale: ru });
        const views = dealerCars
          .filter(c => c.created_date && isAfter(parseISO(c.created_date), subDays(d, 1)) && !isAfter(parseISO(c.created_date), d))
          .reduce((s, c) => s + (c.views_count || 0), 0);
        return { label, views };
      });
    }
    if (timePeriod === 'week') {
      // last 8 weeks
      return Array.from({ length: 8 }, (_, i) => {
        const weekStart = subWeeks(now, 7 - i);
        const weekEnd = subWeeks(now, 6 - i);
        const label = format(weekStart, 'd MMM', { locale: ru });
        const views = dealerCars
          .filter(c => c.created_date && isAfter(parseISO(c.created_date), weekStart) && !isAfter(parseISO(c.created_date), weekEnd))
          .reduce((s, c) => s + (c.views_count || 0), 0);
        return { label, views };
      });
    }
    // month — last 6 months
    return Array.from({ length: 6 }, (_, i) => {
      const monthStart = subMonths(now, 5 - i);
      const monthEnd = subMonths(now, 4 - i);
      const label = format(monthStart, 'MMM yy', { locale: ru });
      const views = dealerCars
        .filter(c => c.created_date && isAfter(parseISO(c.created_date), monthStart) && !isAfter(parseISO(c.created_date), monthEnd))
        .reduce((s, c) => s + (c.views_count || 0), 0);
      return { label, views };
    });
  };
  const timeData = buildTimeData();

  // Funnel
  const acceptedOffers = priceOffers.filter(o => o.status === 'accepted').length;
  const funnelSteps = [
    { label: 'Просмотры', value: totalViews, color: 'bg-emerald-500', pct: 100 },
    { label: 'Сообщения', value: dealerMessages.length, color: 'bg-blue-500', pct: totalViews > 0 ? Math.round((dealerMessages.length / totalViews) * 100) : 0 },
    { label: 'Предложения', value: priceOffers.length, color: 'bg-purple-500', pct: totalViews > 0 ? Math.round((priceOffers.length / totalViews) * 100) : 0 },
    { label: 'Продажи', value: soldCars, color: 'bg-orange-500', pct: totalViews > 0 ? Math.round((soldCars / totalViews) * 100) : 0 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Всего авто" value={dealerCars.length} icon={Car} color="text-emerald-600" />
        <StatCard label="Активных" value={activeCars} icon={CheckCircle} color="text-blue-600" />
        <StatCard label="Продано" value={soldCars} icon={Tag} color="text-purple-600" />
        <StatCard label="Просмотров" value={totalViews.toLocaleString()} icon={Eye} color="text-orange-600" />
        <StatCard label="Рейтинг" value={avgRating} icon={Star} color="text-yellow-500" />
        <StatCard label="Средняя цена" value={avgPrice > 0 ? formatPrice(avgPrice) : '—'} icon={DollarSign} color="text-teal-600" />
      </div>

      {/* Views over time */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Просмотры по времени
          </h3>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {[['day', 'Дни'], ['week', 'Недели'], ['month', 'Месяцы']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setTimePeriod(val)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${timePeriod === val ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >{label}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={timeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Просмотры" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Body + Fuel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-500" /> По типу кузова
          </h3>
          {bodyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={bodyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {bodyData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm text-center py-8">Нет данных</p>}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-500" /> По типу топлива
          </h3>
          {fuelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fuelData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Авто">
                  {fuelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm text-center py-8">Нет данных</p>}
        </div>
      </div>

      {/* Funnel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-emerald-500" /> Воронка конверсии
        </h3>
        <div className="space-y-3">
          {funnelSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-4">
              <div className="w-28 text-right text-sm font-medium text-slate-700 dark:text-slate-300 flex-shrink-0">{step.label}</div>
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-8 overflow-hidden relative">
                <div
                  className={`h-full ${step.color} rounded-full transition-all duration-500 flex items-center pl-3`}
                  style={{ width: `${Math.max(step.pct, step.value > 0 ? 4 : 0)}%` }}
                >
                  {step.value > 0 && <span className="text-white text-xs font-bold whitespace-nowrap">{step.value.toLocaleString()}</span>}
                </div>
              </div>
              <div className="w-12 text-xs text-slate-500 flex-shrink-0">{step.pct}%</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4">* Проценты считаются относительно общего числа просмотров</p>
      </div>

      {/* Brand distribution + Top cars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-500" /> Распределение по маркам
          </h3>
          {brandData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={brandData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Авто">
                  {brandData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm text-center py-8">Нет данных</p>}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Топ авто по просмотрам
          </h3>
          {topCars.length > 0 ? (
            <div className="space-y-3">
              {topCars.map((car, i) => (
                <div key={car.id} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-slate-400">#{i + 1}</span>
                  <div className="w-10 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {car.images?.[0] ? <img src={car.images[0]} alt="" className="w-full h-full object-cover" /> : <Car className="w-4 h-4 m-2 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{car.brand} {car.model} {car.year}</p>
                    <p className="text-xs text-slate-400">{formatPrice(car.price)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Eye className="w-3 h-3" /> {car.views_count || 0}
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-slate-400 text-sm text-center py-8">Нет данных</p>}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Входящих сообщений</p>
          <p className="text-2xl font-bold text-blue-600">{dealerMessages.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Tag className="w-3 h-3" /> Ценовых предложений</p>
          <p className="text-2xl font-bold text-purple-600">{priceOffers.length}</p>
          {acceptedOffers > 0 && <p className="text-xs text-emerald-600 mt-1">{acceptedOffers} принято</p>}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Star className="w-3 h-3" /> Отзывов</p>
          <p className="text-2xl font-bold text-yellow-500">{dealerReviews.length}</p>
          {dealerReviews.length > 0 && <p className="text-xs text-slate-400 mt-1">Средний рейтинг: {avgRating} ★</p>}
        </div>
      </div>
    </div>
  );
}