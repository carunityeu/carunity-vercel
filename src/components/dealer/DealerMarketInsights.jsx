import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { formatPrice } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Loader2,
  Clock, DollarSign, Target, Zap, BarChart2, Users, RefreshCw,
  Star, Package
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { useTranslation } from 'react-i18next';

const EMERALD = '#10b981';
const EMERALD_DIM = '#34d399';
const SLATE = '#64748b';
const SLATE_LIGHT = '#cbd5e1';

function RecommendationItem({ type, text }) {
  const cfg = {
    success: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
    warning: { icon: AlertTriangle, color: 'text-slate-600 dark:text-slate-300',    bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' },
    danger:  { icon: TrendingDown,  color: 'text-slate-700 dark:text-slate-200',    bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600' },
    info:    { icon: Zap,           color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50/60 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900' },
  }[type] || { icon: Zap, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' };
  const Icon = cfg.icon;
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg}`}>
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.color}`} />
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{text}</p>
    </div>
  );
}

export default function DealerMarketInsights({ dealer, dealerCars }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');

  const TABS = [
    { id: 'inventory',   label: t('dealer.insights_tab_inventory', 'Инвентарь'),   icon: Package },
    { id: 'market',      label: t('dealer.insights_tab_market', 'Рынок'),           icon: TrendingUp },
    { id: 'pricing',     label: t('dealer.insights_tab_pricing', 'Цены'),           icon: DollarSign },
    { id: 'competitors', label: t('dealer.insights_tab_competitors', 'Конкуренты'), icon: Users },
  ];

  // ── pre-computed chart data ──────────────────────────────────────────────────
  const activeCars  = dealerCars.filter(c => c.status === 'active');
  const soldCars    = dealerCars.filter(c => c.status === 'sold');
  const pendingCars = dealerCars.filter(c => c.status === 'pending');
  const now = Date.now();

  const withAge = activeCars.map(c => ({
    ...c,
    daysListed: c.created_date ? Math.round((now - new Date(c.created_date).getTime()) / 86400000) : 0,
  }));
  const staleCars   = withAge.filter(c => c.daysListed > 30);
  const topViewsCar = [...activeCars].sort((a, b) => (b.views_count || 0) - (a.views_count || 0))[0];
  const avgPrice    = activeCars.length ? Math.round(activeCars.reduce((s, c) => s + (c.price || 0), 0) / activeCars.length) : 0;

  // Brand distribution for pie
  const brandMap = {};
  activeCars.forEach(c => { brandMap[c.brand] = (brandMap[c.brand] || 0) + 1; });
  const brandData = Object.entries(brandMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([name, value]) => ({ name, value }));

  // Price buckets for bar chart
  const priceBuckets = [
    { label: '<5k',    range: [0, 5000] },
    { label: '5-10k',  range: [5000, 10000] },
    { label: '10-20k', range: [10000, 20000] },
    { label: '20-40k', range: [20000, 40000] },
    { label: '>40k',   range: [40000, Infinity] },
  ].map(b => ({ label: b.label, count: activeCars.filter(c => c.price >= b.range[0] && c.price < b.range[1]).length }));

  // Top 6 by views for bar chart
  const topByViews = [...activeCars]
    .sort((a,b) => (b.views_count||0) - (a.views_count||0))
    .slice(0,6)
    .map(c => ({ name: `${c.brand} ${c.model.slice(0,6)}`, views: c.views_count||0 }));

  // Status pie
  const statusData = [
    { name: t('dealer.status_active','Активные'), value: activeCars.length },
    { name: t('dealer.status_sold','Проданные'),  value: soldCars.length },
    { name: t('dealer.status_pending','Ожидание'), value: pendingCars.length },
  ].filter(d => d.value > 0);

  const PIE_COLORS = [EMERALD, SLATE, SLATE_LIGHT];
  const BRAND_COLORS = ['#10b981','#34d399','#6ee7b7','#a7f3d0','#d1fae5','#64748b'];

  // ── LLM ─────────────────────────────────────────────────────────────────────
  const generateInsights = async () => {
    if (dealerCars.length === 0) return;
    setLoading(true);

    const byViews = [...activeCars].sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    const topCar  = byViews[0];
    const lowCar  = byViews[byViews.length - 1];
    const oldCars = withAge.filter(c => c.daysListed > 30).sort((a,b) => b.daysListed - a.daysListed);
    const topBrands = Object.entries(brandMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const prices = activeCars.map(c => c.price||0).filter(Boolean);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;

    const prompt = `
Ты — эксперт по автомобильному рынку Прибалтики (Эстония, Латвия, Литва). 
Проанализируй инвентарь дилера и дай конкретные, actionable советы.

Данные дилера:
- Название: ${dealer.name}
- Город: ${dealer.city||''}, ${dealer.country||''}
- Всего авто: ${dealerCars.length}
- Активных: ${activeCars.length}
- Продано: ${soldCars.length}
- Топ авто по просмотрам: ${topCar ? `${topCar.brand} ${topCar.model} ${topCar.year} (${topCar.views_count||0} просмотров, ${topCar.price?.toLocaleString()}€)` : 'нет данных'}
- Низкий интерес: ${lowCar && lowCar.id!==topCar?.id ? `${lowCar.brand} ${lowCar.model} ${lowCar.year} (${lowCar.views_count||0} просмотров)` : 'нет данных'}
- Долго стоят (>30 дней): ${oldCars.length>0 ? oldCars.slice(0,5).map(c=>`${c.brand} ${c.model} ${c.year} — ${c.daysListed} дней, ${formatPrice(c.price)}`).join('; ') : 'нет'}
- Бренды: ${topBrands.map(([b,n])=>`${b}: ${n}`).join(', ')}
- Средняя цена: ${formatPrice(avgPrice)}
- Диапазон цен: ${formatPrice(minPrice)} — ${formatPrice(maxPrice)}

Верни JSON строго такого формата:
{
  "inventory": { "star_listing": "...", "avoid_listing": "...", "recommendations": [{"type":"success|warning|danger|info","text":"..."}] },
  "market":    { "segment": "...", "hot_categories": ["..."], "avoid_categories": ["..."], "recommendations": [{"type":"...","text":"..."}] },
  "pricing":   { "price_assessment": "...", "recommendations": [{"type":"...","text":"..."}] },
  "competitors":{ "competitive_position": "...", "recommendations": [{"type":"...","text":"..."}] }
}
Дай конкретные практичные советы на русском языке.
`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: { type:'object', properties:{ inventory:{type:'object'}, market:{type:'object'}, pricing:{type:'object'}, competitors:{type:'object'} } },
    });
    setInsights(result);
    setLoading(false);
  };

  // ── tab renders ──────────────────────────────────────────────────────────────
  const renderInventory = () => {
    const d = insights?.inventory;
    return (
      <div className="space-y-6">
        {/* Views chart */}
        {topByViews.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              {t('dealer.insights_chart_views','Просмотры по авто')}
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topByViews} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize:11, fill: SLATE }} />
                <YAxis tick={{ fontSize:11, fill: SLATE }} />
                <Tooltip
                  contentStyle={{ backgroundColor:'#1b1b22', border:'none', borderRadius:8, color:'#f1f5f9', fontSize:12 }}
                  cursor={{ fill:'rgba(224,80,46,0.08)' }}
                />
                <Bar dataKey="views" fill={EMERALD} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {d && (
          <>
            {d.star_listing && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <Star className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">{t('dealer.insights_star','⭐ Звезда инвентаря')}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{d.star_listing}</p>
                </div>
              </div>
            )}
            {d.avoid_listing && (
              <div className="flex items-start gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <AlertTriangle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t('dealer.insights_weak','⚠️ Слабое звено')}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{d.avoid_listing}</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {(d.recommendations||[]).map((r,i) => <RecommendationItem key={i} type={r.type} text={r.text} />)}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderMarket = () => {
    const d = insights?.market;
    return (
      <div className="space-y-6">
        {/* Brand distribution pie */}
        {brandData.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              {t('dealer.insights_chart_brands','Бренды в инвентаре')}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={brandData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {brandData.map((_, i) => <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor:'#1b1b22', border:'none', borderRadius:8, color:'#f1f5f9', fontSize:12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap sm:flex-col gap-2 justify-center sm:justify-start">
                {brandData.map((b,i) => (
                  <div key={b.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: BRAND_COLORS[i % BRAND_COLORS.length] }} />
                    <span className="text-xs text-slate-600 dark:text-slate-400">{b.name} ({b.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {d && (
          <>
            {d.segment && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('dealer.insights_segment','Сегмент дилера')}</p>
                <p className="text-sm font-medium text-slate-800 dark:text-white">{d.segment}</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {d.hot_categories?.length > 0 && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> {t('dealer.insights_hot','Брать в инвентарь')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {d.hot_categories.map((c,i) => (
                      <Badge key={i} className="bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200 text-xs">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {d.avoid_categories?.length > 0 && (
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" /> {t('dealer.insights_avoid','Избегать')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {d.avoid_categories.map((c,i) => (
                      <Badge key={i} className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 text-xs">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {(d.recommendations||[]).map((r,i) => <RecommendationItem key={i} type={r.type} text={r.text} />)}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderPricing = () => {
    const d = insights?.pricing;
    return (
      <div className="space-y-6">
        {/* Price distribution */}
        {priceBuckets.some(b => b.count > 0) && (
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              {t('dealer.insights_chart_prices','Распределение по ценам')}
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={priceBuckets} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize:11, fill: SLATE }} />
                <YAxis tick={{ fontSize:11, fill: SLATE }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor:'#1b1b22', border:'none', borderRadius:8, color:'#f1f5f9', fontSize:12 }}
                  cursor={{ fill:'rgba(224,80,46,0.08)' }}
                  formatter={(v) => [v, t('dealer.insights_cars','авто')]}
                />
                <Bar dataKey="count" fill={EMERALD} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {d && (
          <>
            {d.price_assessment && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('dealer.insights_price_assess','Оценка ценовой политики')}</p>
                <p className="text-sm text-slate-800 dark:text-white">{d.price_assessment}</p>
              </div>
            )}
            <div className="space-y-2">
              {(d.recommendations||[]).map((r,i) => <RecommendationItem key={i} type={r.type} text={r.text} />)}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderCompetitors = () => {
    const d = insights?.competitors;
    return (
      <div className="space-y-6">
        {/* Status distribution */}
        {statusData.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              {t('dealer.insights_chart_status','Статусы объявлений')}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={65} paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor:'#1b1b22', border:'none', borderRadius:8, color:'#f1f5f9', fontSize:12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap sm:flex-col gap-2 justify-center">
                {statusData.map((s,i) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-xs text-slate-600 dark:text-slate-400">{s.name} ({s.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {d && (
          <>
            {d.competitive_position && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" /> {t('dealer.insights_comp_pos','Конкурентная позиция')}
                </p>
                <p className="text-sm text-slate-800 dark:text-white">{d.competitive_position}</p>
              </div>
            )}
            <div className="space-y-2">
              {(d.recommendations||[]).map((r,i) => <RecommendationItem key={i} type={r.type} text={r.text} />)}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':   return renderInventory();
      case 'market':      return renderMarket();
      case 'pricing':     return renderPricing();
      case 'competitors': return renderCompetitors();
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { value: activeCars.length,        label: t('dealer.insights_stat_active','Активных авто'),      accent: true },
          { value: staleCars.length,          label: t('dealer.insights_stat_stale','>30 дней в продаже'), accent: false },
          { value: topViewsCar?.views_count||0, label: t('dealer.insights_stat_top_views','Просмотров у топ авто'), accent: false },
          { value: avgPrice > 0 ? `${(avgPrice/1000).toFixed(0)}k€` : '—', label: t('dealer.insights_stat_avg','Средняя цена'), accent: false },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-center">
            <p className={`text-2xl font-bold ${s.accent ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* AI Analysis block */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white text-sm md:text-base">AI Market Insights</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('dealer.insights_subtitle','Анализ инвентаря, рынка, цен и конкурентов')}</p>
            </div>
          </div>
          <Button
            onClick={generateInsights}
            disabled={loading || dealerCars.length === 0}
            className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-sm w-full sm:w-auto"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {insights ? t('dealer.insights_refresh','Обновить анализ') : t('dealer.insights_run','Запустить анализ')}
          </Button>
        </div>

        {dealerCars.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">{t('dealer.insights_empty','Добавьте автомобили для анализа')}</p>
          </div>
        )}

        {loading && (
          <div className="p-12 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">{t('dealer.insights_loading','Анализируем инвентарь и рынок...')}</p>
            <p className="text-slate-400 text-xs mt-1">{t('dealer.insights_loading_hint','Это займёт 10–20 секунд')}</p>
          </div>
        )}

        {!loading && dealerCars.length > 0 && (
          <>
            {/* Tabs */}
            <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-100 dark:border-slate-800">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-4 md:p-6">
              {!insights && !loading && (
                <div className="py-8 text-center">
                  <BarChart2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">{t('dealer.insights_ready','Готово к анализу')}</p>
                  <p className="text-slate-400 text-sm">{t('dealer.insights_ready_hint','Нажмите «Запустить анализ» для AI-рекомендаций')}</p>
                </div>
              )}
              {insights && renderContent()}
              {!insights && !loading && renderContent()}
            </div>
          </>
        )}
      </div>

      {/* Stale listings */}
      {staleCars.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              {t('dealer.insights_stale_title','Долго стоят в продаже')} ({staleCars.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {staleCars.slice(0,5).map(car => (
              <div key={car.id} className="p-3 flex items-center gap-3">
                <div className="w-10 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  {car.images?.[0]
                    ? <img src={car.images[0]} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">—</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{car.brand} {car.model} {car.year}</p>
                  <p className="text-xs text-slate-400">{formatPrice(car.price)}</p>
                </div>
                <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 text-xs flex-shrink-0">
                  {car.daysListed} {t('dealer.insights_days','дней')}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}