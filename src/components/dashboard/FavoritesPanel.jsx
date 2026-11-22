import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ListCarCard from '@/components/cars/ListCarCard';
import DashboardTabHeader from '@/components/dashboard/DashboardTabHeader';
import { cn } from '@/lib/utils';
import ListPagination from '@/components/ui/ListPagination';
import { useFavorites } from '@/components/favorites/FavoritesContext';

const CARD = 'bg-[#1b1b22] border border-[#292a32]';

export default function FavoritesPanel({ user, cars = [], isLoading = false, pagination }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;
  const totalPages = Math.max(1, Math.ceil(cars.length / PAGE_SIZE));
  const pagedCars = pagination ? cars : cars.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const queryClient = useQueryClient();
  const { favoriteIds, toggleFavorite } = useFavorites();

  useEffect(() => base44.entities.Car.subscribe(event => {
    const existing = cars.find(car => car.id === event.id);
    if (!existing || (event.type !== 'delete' && (!event.data?.status || event.data.status === existing.status))) return;
    queryClient.invalidateQueries({ queryKey: ['favoriteCars'] });
  }), [cars, queryClient]);

  // Same price comparison the catalog list view uses
  const { data: priceRatings = {} } = useQuery({
    queryKey: ['priceRatings', pagedCars.filter(car => car.status === 'active').map(car => car.id).join(',')],
    enabled: pagedCars.some(car => car.status === 'active'),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = await base44.functions.invoke('getPriceRatings', {
        cars: pagedCars.filter(car => car.status === 'active').slice(0, 60).map((car) => ({
          id: car.id,
          brand: car.brand,
          model: car.model,
          body_type: car.body_type,
          car_class: car.car_class,
          year: car.year,
          mileage: car.mileage,
          engine_power: car.engine_power,
          price: car.price,
          features_count: car.features?.length || 0
        }))
      });
      return res.data?.ratings || {};
    }
  });

  const removeFavorite = async (carId) => {
    // Remove through the shared favorites store so every screen stays in sync (no extra request)
    if (favoriteIds.includes(carId)) {
      await toggleFavorite(carId);
    } else {
      // Fallback: read from the server so a stale cached list can never leave favourites behind
      const matches = await base44.entities.Favorite.filter({ user_email: user.email, car_id: carId });
      await Promise.all(matches.map((favorite) => base44.entities.Favorite.delete(favorite.id)));
    }
    queryClient.invalidateQueries({ queryKey: ['favorites'] });
    queryClient.invalidateQueries({ queryKey: ['favoriteCars'] });
    toast.success(t('dashboard.removed_favorite'));
  };

  return (
    <div className="space-y-4">
      <DashboardTabHeader
        icon={Heart}
        title={t('account.nav_favorites')}
        count={isLoading ? undefined : (pagination?.totalCount ?? cars.length)}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
        </div>
      ) : cars.length === 0 ? (
        <div className={cn(CARD, 'rounded-xl p-10 text-center')}>
          <div className="w-14 h-14 bg-[#292a32] rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('dashboard.no_favorites_title')}</h3>
          <p className="text-slate-500 mb-6">{t('dashboard.no_favorites_desc')}</p>
          <Link to="/Catalog">
            <Button className="bg-emerald-500 hover:bg-emerald-600">{t('dashboard.go_catalog')}</Button>
          </Link>
        </div>
      ) : (
        <>
        <div className="flex flex-col gap-3">
          {pagedCars.map((car) => (
            <ListCarCard
              key={car.id}
              car={car}
              showLocation
              rating={priceRatings[car.id]}
              onFavoriteToggle={removeFavorite}
            />
          ))}
        </div>
        {pagination ? pagination.hasMore && (
          <div className="flex justify-center">
            <Button variant="outline" className="w-full sm:w-auto" disabled={pagination.loadingMore} onClick={pagination.onLoadMore}>
              {pagination.loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('pagination.load_more')}
            </Button>
          </div>
        ) : <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}