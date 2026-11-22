import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import ListCarCard from '@/components/cars/ListCarCard';
import useCardExtras from '@/hooks/useCardExtras';

export default function CaroResults({ ids }) {
  const { t } = useTranslation();
  const { data: cars = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['caroListings', ids.join(',')],
    queryFn: async () => (await base44.entities.Car.filter({ status: 'active', id: { $in: ids } }, { limit: 3 })).items,
    staleTime: 60000
  });
  const { ratings, promotions } = useCardExtras(cars);
  const dealerIds = [...new Set(cars.map(car => car.dealer_id).filter(Boolean))];
  const { data: dealers = [] } = useQuery({
    queryKey: ['caroDealers', dealerIds.join(',')], enabled: dealerIds.length > 0,
    queryFn: async () => (await base44.entities.Dealer.filter({ id: { $in: dealerIds } }, { limit: 3 })).items,
    staleTime: 300000
  });
  if (isLoading) return <p className="caro-status" role="status">{t('caro.loading')}</p>;
  if (isError) return <div className="caro-error" role="alert">{t('caro.error')}<button onClick={() => refetch()}>{t('caro.retry')}</button></div>;
  if (!cars.length) return <p className="caro-status">{t('caro.unavailable')}</p>;
  return <div className="caro-results">{ids.map(id => {
    const car = cars.find(item => item.id === id);
    return car ? <ListCarCard key={id} car={car} showLocation rating={ratings[id]} promotion={promotions[id]} dealer={dealers.find(dealer => dealer.id === car.dealer_id)} /> : null;
  })}</div>;
}