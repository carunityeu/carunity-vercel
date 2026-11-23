import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import { Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import SaleProbability from './analytics/SaleProbability';
import SalesFunnel from './analytics/SalesFunnel';
import CompetitorTable from './analytics/CompetitorTable';
import AiRecommendations from './analytics/AiRecommendations';

function CarSelector({ cars, selectedCar, onSelect, label }) {
  return (
    <div className="bg-[#1b1b22] rounded-2xl border border-[#292a32] p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {cars.slice(0, 6).map(car => (
          <button
            key={car.id}
            onClick={() => onSelect(car.id)}
            className={cn(
              'px-3 py-2 rounded-xl text-sm border transition-all',
              selectedCar?.id === car.id
                ? 'border-emerald-500/40 bg-[#101014] text-white font-medium'
                : 'border-[#292a32] text-slate-400 hover:text-white'
            )}
          >
            {car.brand} {car.model} {car.year}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DealerAnalyticsPremium({ dealerCars, dealerMessages, priceOffers, dealer }) {
  const { t } = useTranslation();
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [premiumTab, setPremiumTab] = useState('overview');

  const activeCars = dealerCars.filter(c => c.status === 'active');
  const selectedCar = selectedCarId ? dealerCars.find(c => c.id === selectedCarId) : activeCars[0];
  const carIds = dealerCars.map(c => c.id);

  const { data: viewHistory = [] } = useQuery({
    queryKey: ['dealerViewHistory', dealer?.id],
    queryFn: async () => {
      const { items } = await entities.ViewHistory.list({ sort: '-viewed_at', limit: 500 });
      return items.filter(v => carIds.includes(v.car_id));
    },
    enabled: carIds.length > 0
  });

  const { data: marketCars = [] } = useQuery({
    queryKey: ['marketCars', selectedCar?.brand, selectedCar?.model],
    queryFn: async () => {
      const { items } = await entities.Car.filter({ brand: selectedCar.brand, model: selectedCar.model, status: 'active' }, { sort: '-created_date', limit: 50 });
      return items;
    },
    enabled: !!selectedCar?.brand
  });

  const carViews = selectedCar ? viewHistory.filter(v => v.car_id === selectedCar.id).length : 0;
  const carContacts = selectedCar
    ? dealerMessages.filter(m => m.car_id === selectedCar.id).length + priceOffers.filter(o => o.car_id === selectedCar.id).length
    : 0;
  const soldCars = dealerCars.filter(c => c.status === 'sold').length;
  const totalViews = dealerCars.reduce((s, c) => s + (c.views_count || 0), 0);

  const TABS = [
    { id: 'overview', label: t('dealer.tab_overview') },
    { id: 'competitors', label: t('dealer.tab_competitors') },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-[#292a32] text-emerald-400 border border-emerald-500/30 gap-1.5">
          <Zap className="w-3 h-3" /> Premium Analytics
        </Badge>
        <span className="text-xs text-slate-400">{t('dealer.premium_desc')}</span>
      </div>

      <div className="flex gap-1 bg-white dark:bg-slate-900 border border-[#292a32] p-1 rounded-xl flex-wrap overflow-x-auto scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setPremiumTab(tab.id)}
            className={cn(
              'px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
              premiumTab === tab.id ? 'bg-[#292a32] text-white' : 'text-slate-400 hover:text-white'
            )}
          >{tab.label}</button>
        ))}
      </div>

      {premiumTab === 'overview' && (
        <div className="space-y-4">
          <CarSelector cars={activeCars} selectedCar={selectedCar} onSelect={setSelectedCarId} label={t('dealer.analyzing_listing')} />

          {selectedCar && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SaleProbability car={selectedCar} marketCars={marketCars} views={carViews} contacts={carContacts} />
                <div className="bg-[#1b1b22] rounded-2xl border border-[#292a32] p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">{t('dealer.sales_funnel')}</p>
                  <SalesFunnel totalViews={totalViews} messages={dealerMessages.length} offers={priceOffers.length} soldCars={soldCars} />
                </div>
              </div>

              <AiRecommendations car={selectedCar} carViews={carViews} carContacts={carContacts} />
            </>
          )}
        </div>
      )}

      {premiumTab === 'competitors' && (
        <div className="space-y-4">
          <CarSelector cars={activeCars} selectedCar={selectedCar} onSelect={setSelectedCarId} label={t('dealer.select_for_analysis')} />
          {selectedCar && (
            <div className="bg-[#1b1b22] rounded-2xl border border-[#292a32] p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
                {t('dealer.tab_competitors')}: {selectedCar.brand} {selectedCar.model} ({marketCars.filter(c => c.id !== selectedCar.id).length} {t('dealer.competitors_found')})
              </p>
              <CompetitorTable car={selectedCar} marketCars={marketCars} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}