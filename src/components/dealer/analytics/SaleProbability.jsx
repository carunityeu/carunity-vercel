import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/utils/format';

export function scoreListingQuality(car) {
  let score = 0;
  const imgCount = (car.images || []).length;
  if (imgCount >= 8) score += 25;
  else if (imgCount >= 4) score += 15;
  else score += imgCount * 3;
  if (car.description && car.description.length > 100) score += 20;
  else if (car.description && car.description.length > 30) score += 10;
  const fields = ['mileage', 'fuel_type', 'transmission', 'body_type', 'engine_power', 'engine_volume', 'drive_type', 'color'];
  const filled = fields.filter(f => car[f] !== undefined && car[f] !== null && car[f] !== '').length;
  score += Math.round((filled / fields.length) * 30);
  if (car.vin) score += 10;
  if (car.is_premium) score += 15;
  return Math.min(100, score);
}

export default function SaleProbability({ car, marketCars, views, contacts }) {
  const { t } = useTranslation();

  const score = useMemo(() => {
    let p = 30;
    p += (scoreListingQuality(car) / 100) * 25;
    if (contacts > 0) p += Math.min(20, contacts * 5);
    if (views > 50) p += 10;
    else if (views > 20) p += 5;
    if (marketCars.length > 1) {
      const others = marketCars.filter(c => c.id !== car.id && c.price > 0);
      if (others.length > 0) {
        const avg = others.reduce((s, c) => s + c.price, 0) / others.length;
        if (car.price <= avg) p += 15;
        else if (car.price <= avg * 1.05) p += 8;
      }
    }
    return Math.min(95, Math.round(p));
  }, [car, marketCars, views, contacts]);

  const tips = useMemo(() => {
    const list = [];
    const imgCount = (car.images || []).length;
    if (imgCount < 8) list.push(t('dealer.tip_photos', { count: imgCount, recommended: 8 }));
    if (!car.description || car.description.length < 100) list.push(t('dealer.tip_description'));
    const others = marketCars.filter(c => c.id !== car.id && c.price > 0);
    if (others.length > 0) {
      const avg = others.reduce((s, c) => s + c.price, 0) / others.length;
      if (car.price > avg * 1.05) list.push(t('dealer.tip_price_high', { diff: formatPrice(Math.round(car.price - avg)) }));
    }
    if (views < 20) list.push(t('dealer.tip_views'));
    if (contacts === 0) list.push(t('dealer.tip_no_contacts'));
    if (!car.is_premium) list.push(t('dealer.tip_premium'));
    return list.slice(0, 3);
  }, [car, marketCars, views, contacts, t]);

  const daysEstimate = score >= 70 ? '7–21' : score >= 50 ? '21–45' : '45–90+';

  return (
    <div className="bg-[#1b1b22] rounded-2xl border border-[#292a32] p-4 sm:p-5 flex flex-col">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">{t('dealer.sale_forecast')}</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">{t('dealer.sale_probability')}</p>
          <p className={cn('text-4xl font-bold tabular-nums', score >= 70 ? 'text-emerald-600' : score >= 50 ? 'text-amber-500' : 'text-red-500')}>{score}%</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">{t('dealer.expected_term')}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{daysEstimate}</p>
          <p className="text-xs text-slate-400">{t('dealer.days')}</p>
        </div>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-400')}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-2">
        {score >= 70 ? t('dealer.sale_high') : score >= 50 ? t('dealer.sale_medium') : t('dealer.sale_low')}
      </p>

      <div className="mt-4 pt-3 border-t border-[#292a32]">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">{t('dealer.tips_title')}</p>
        <ul className="space-y-1.5">
          {(tips.length > 0 ? tips : [t('dealer.tip_ok')]).map((tip, i) => (
            <li key={i} className="flex gap-2 text-xs leading-relaxed text-slate-400">
              <span aria-hidden="true" className="flex-shrink-0">–</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}