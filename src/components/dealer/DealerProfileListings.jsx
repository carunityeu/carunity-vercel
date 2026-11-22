import React from 'react';
import CompactCarCard from '@/components/cars/CompactCarCard';
import ListCarCard from '@/components/cars/ListCarCard';
import useCardExtras from '@/hooks/useCardExtras';

export default function DealerProfileListings({ cars, dealer, viewMode }) {
  const { ratings, promotions } = useCardExtras(cars);
  return viewMode === 'list' ? (
    <div className="space-y-3">
      {cars.map(car => <ListCarCard key={car.id} car={car} showLocation dealer={dealer} rating={ratings[car.id]} promotion={promotions[car.id]} />)}
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {cars.map(car => <CompactCarCard key={car.id} car={car} showLocation rating={ratings[car.id]} promotion={promotions[car.id]} />)}
    </div>
  );
}