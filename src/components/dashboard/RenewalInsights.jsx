import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const roundPrice = (value) => Math.round(value / 100) * 100;
const formatRangePart = (value, locale) => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);

export default function RenewalInsights({ car, onRenewed }) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [renewing, setRenewing] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['renewalStats', car.id],
    queryFn: async () => {
      const [favorites, messages, similar] = await Promise.all([
        entities.Favorite.count({ car_id: car.id }),
        entities.Message.count({ car_id: car.id }),
        entities.Car.filter({ brand: car.brand, status: 'active' }, { sort: '-created_date', limit: 60 }),
      ]);
      const prices = (similar?.items || [])
        .filter(other => other.id !== car.id && other.price > 0 && (
          other.model === car.model ||
          (other.body_type && other.body_type === car.body_type && Math.abs((other.year || 0) - (car.year || 0)) <= 2)
        ))
        .map(other => other.price)
        .sort((a, b) => a - b);
      const range = prices.length >= 2 && prices[prices.length - 1] - prices[0] >= 100
        ? [roundPrice(prices[0]), roundPrice(prices[prices.length - 1])]
        : null;
      return { favorites, messages, range };
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleRenew = async () => {
    setRenewing(true);
    try {
      await base44.functions.invoke('renewListing', { carId: car.id });
      toast.success(t('renewal.renewed'));
      queryClient.invalidateQueries(['listingRenewals']);
      onRenewed?.();
    } finally {
      setRenewing(false);
    }
  };

  const tiles = [
    { value: car.views_count || 0, label: t('renewal.views') },
    { value: stats?.favorites ?? '—', label: t('renewal.favorites') },
    { value: stats?.messages ?? '—', label: t('renewal.messages') },
  ];

  return (
    <div className="mt-3 rounded-lg border border-[#292a32] bg-[#101014] p-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">{t('renewal.title')}</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-md border border-[#292a32] bg-[#1b1b22] px-2 py-1.5 text-center">
            <p className="text-sm font-semibold leading-none text-white">{tile.value}</p>
            <p className="mt-1 text-[10px] leading-tight text-slate-500">{tile.label}</p>
          </div>
        ))}
      </div>
      {stats?.range && (
        <div className="mt-2.5 space-y-1">
          <p className="text-xs leading-relaxed text-slate-400">
            {t('renewal.price_hint', {
              from: formatRangePart(stats.range[0], i18n.language),
              to: `${formatRangePart(stats.range[1], i18n.language)} €`,
            })}
          </p>
          {car.price > stats.range[1] && (
            <p className="text-xs leading-relaxed text-emerald-400">{t('renewal.price_advice')}</p>
          )}
        </div>
      )}
      <p className="mt-2.5 text-xs font-medium leading-snug text-emerald-400">{t('renewal.bonus')}</p>
      <Button
        onClick={handleRenew}
        disabled={renewing}
        className="mt-2.5 h-8 w-full px-3 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 sm:w-auto"
      >
        {renewing ? t('renewal.renewing') : t('renewal.button')}
      </Button>
    </div>
  );
}