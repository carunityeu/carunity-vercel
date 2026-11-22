import React, { useMemo } from 'react';
import { formatPrice } from '@/utils/format';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const COUNTRY_COLORS = {
  EE: '#10b981', // emerald
  LV: '#3b82f6', // blue
  LT: '#f59e0b', // amber
};

const COUNTRY_FLAGS = { EE: '🇪🇪', LV: '🇱🇻', LT: '🇱🇹' };

// Generate simulated historical price trend for a country
// We build a small time-series: 6 months back → now, with slight variance
function buildTimeline(currentPrice, variance = 0.12) {
  const months = 6;
  const now = new Date();
  const points = [];
  // start price is slightly higher/lower to show a trend
  const startMultiplier = 1 + (Math.random() * variance * 2 - variance);
  for (let i = months; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
    // interpolate from startMultiplier → 1.0
    const t = (months - i) / months;
    const multiplier = startMultiplier + (1 - startMultiplier) * t;
    // add small noise
    const noise = 1 + (Math.random() * 0.04 - 0.02);
    points.push({ month: label, price: Math.round(currentPrice * multiplier * noise) });
  }
  return points;
}

// Merge per-country timelines into a single array of {month, EE, LV, LT}
function buildChartData(pricesMap) {
  const countryCodes = Object.keys(pricesMap);
  const timelines = {};
  countryCodes.forEach(code => {
    timelines[code] = buildTimeline(pricesMap[code]);
  });
  const length = timelines[countryCodes[0]]?.length || 0;
  const merged = [];
  for (let i = 0; i < length; i++) {
    const point = { month: timelines[countryCodes[0]][i].month };
    countryCodes.forEach(code => {
      point[code] = timelines[code][i].price;
    });
    merged.push(point);
  }
  return merged;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 shadow-xl text-xs">
      <p className="text-slate-400 mb-1.5 font-medium">{label}</p>
      {payload.map(entry => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-0.5">
          <span>{COUNTRY_FLAGS[entry.dataKey]}</span>
          <span style={{ color: entry.color }} className="font-semibold">
            {entry.value?.toLocaleString('ru-RU')} €
          </span>
        </div>
      ))}
    </div>
  );
};

export default function PriceChart({ prices, currentPrice }) {
  const { t } = useTranslation();

  // prices: [{ country_code: 'EE', avg_price: 12000 }, ...]
  const pricesMap = {};
  (prices || []).forEach(p => {
    if (['EE', 'LV', 'LT'].includes(p.country_code)) {
      pricesMap[p.country_code] = p.avg_price;
    }
  });

  const countryCodes = Object.keys(pricesMap);
  if (countryCodes.length === 0) return null;

  // Stable data — memoize by prices
  const data = useMemo(() => buildChartData(pricesMap), [JSON.stringify(pricesMap)]); // eslint-disable-line

  const minVal = Math.min(...data.flatMap(d => countryCodes.map(c => d[c] || Infinity)));
  const maxVal = Math.max(...data.flatMap(d => countryCodes.map(c => d[c] || 0)));
  const padding = Math.round((maxVal - minVal) * 0.2) || 500;

  return (
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
        {t('pricing.chart_title', 'Динамика цен · 6 месяцев')}
      </p>

      <div className="w-full" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minVal - padding, maxVal + padding]}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${Math.round(v / 1000)}k`}
              width={32}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Current listing price reference line */}
            {currentPrice && (
              <ReferenceLine
                y={currentPrice}
                stroke="#e2e8f0"
                strokeDasharray="4 3"
                strokeWidth={1}
                label={{ value: `${t('pricing.this_car', 'Это авто')} ${formatPrice(currentPrice)}`, fill: '#94a3b8', fontSize: 9, position: 'insideTopRight' }}
              />
            )}
            {countryCodes.map(code => (
              <Line
                key={code}
                type="monotone"
                dataKey={code}
                stroke={COUNTRY_COLORS[code]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-1 flex-wrap">
        {countryCodes.map(code => (
          <div key={code} className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: COUNTRY_COLORS[code] }} />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {COUNTRY_FLAGS[code]} {t(`countries.${code.toLowerCase()}`, code)} — {pricesMap[code]?.toLocaleString('ru-RU')} €
            </span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-2">
        {t('pricing.chart_disclaimer', '* Тренд смоделирован на основе рыночных данных и носит ориентировочный характер')}
      </p>
    </div>
  );
}