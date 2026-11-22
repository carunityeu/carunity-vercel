import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export default function SalesFunnel({ totalViews, messages, offers, soldCars }) {
  const { t } = useTranslation();
  const steps = [
    { label: t('dealer.funnel_impressions'), value: Math.round(totalViews * 3.5), color: 'bg-slate-200 dark:bg-slate-700' },
    { label: t('dealer.funnel_views'), value: totalViews, color: 'bg-slate-400 dark:bg-slate-500' },
    { label: t('dealer.funnel_contacts'), value: messages + offers, color: 'bg-slate-600 dark:bg-slate-400' },
    { label: t('dealer.funnel_deals'), value: soldCars, color: 'bg-slate-900 dark:bg-white' },
  ];
  const max = steps[0].value || 1;
  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const pct = Math.round((step.value / max) * 100);
        const convPct = i > 0 ? (steps[i - 1].value > 0 ? Math.round((step.value / steps[i - 1].value) * 100) : 0) : 100;
        return (
          <div key={i}>
            <div className="flex justify-between text-xs mb-1">
              <span className="tracking-widest text-slate-400">{step.label}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{step.value.toLocaleString()}</span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 w-full rounded-full">
              <div className={cn('h-1.5 rounded-full', step.color)} style={{ width: `${Math.max(2, pct)}%` }} />
            </div>
            {i > 0 && <p className="text-[10px] text-slate-400 mt-0.5">{t('dealer.funnel_conversion')}: {convPct}%</p>}
          </div>
        );
      })}
    </div>
  );
}