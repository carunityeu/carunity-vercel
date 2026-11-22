import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/utils/format';

export default function CompetitorTable({ car, marketCars }) {
  const { t } = useTranslation();
  const competitors = useMemo(() => {
    return marketCars
      .filter(c => c.id !== car.id && c.price > 0)
      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
      .slice(0, 6);
  }, [car, marketCars]);

  if (competitors.length === 0) return <p className="text-sm text-slate-400 py-4 text-center">{t('dealer.no_competitors')}</p>;

  const avgPrice = Math.round(competitors.reduce((s, c) => s + c.price, 0) / competitors.length);

  return (
    <div>
      <div className="divide-y divide-slate-50 dark:divide-slate-800">
        {competitors.map((comp, i) => {
          const priceDiff = comp.price - car.price;
          const viewsMore = (comp.views_count || 0) > (car.views_count || 0);
          return (
            <div key={comp.id} className="py-2.5 flex items-center gap-3">
              <span className="text-xs text-slate-300 w-4">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{comp.brand} {comp.model} {comp.year}</p>
                <p className="text-xs text-slate-400">{comp.mileage ? `${Math.round(comp.mileage / 1000)}k ${t('dealer.km')}` : ''} {comp.fuel_type || ''}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{formatPrice(comp.price)}</p>
                <p className={cn('text-xs tabular-nums', priceDiff < 0 ? 'text-red-500' : 'text-emerald-600')}>
                  {priceDiff < 0 ? `−${formatPrice(Math.abs(priceDiff))}` : `+${formatPrice(priceDiff)}`}
                </p>
              </div>
              <div className="text-right flex-shrink-0 w-14">
                <div className="flex items-center justify-end gap-1">
                  <Eye className="w-3 h-3 text-slate-400" />
                  <span className={cn('text-xs font-semibold tabular-nums', viewsMore ? 'text-red-500' : 'text-slate-600')}>{comp.views_count || 0}</span>
                </div>
                {viewsMore && <p className="text-[10px] text-red-400">{t('dealer.competitor_overtakes')}</p>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-[#292a32] flex flex-wrap gap-4 text-xs text-slate-500">
        <span>{t('dealer.avg_competitor_price')}: <span className="font-semibold text-slate-800 dark:text-slate-200">{formatPrice(avgPrice)}</span></span>
        <span>{t('dealer.your_label')}: <span className={cn('font-semibold', car.price > avgPrice ? 'text-red-500' : 'text-emerald-600')}>{formatPrice(car.price)}</span></span>
      </div>
    </div>
  );
}