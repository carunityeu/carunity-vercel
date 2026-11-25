import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import { usePricePool } from '@/hooks/useCardExtras';
import { rateCars } from '@/lib/priceRating';
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

  useEffect(() => entities.Car.subscribe(event => {
    const existing = cars.find(car => car.id === event.id);
    if (!existing || (event.type !== 'delete' && (!event.data?.status || event.data.status === existing.status))) return;
    queryClient.invalidateQueries({ queryKey: ['favoriteCars'] });
  }), [cars, queryClient]);

  // Same price comparison the catalog uses (computed in the browser, lib/priceRating.js)
  const activeCars = pagedCars.filter(car => car.status === 'active');
  const { data: pricePool } = usePricePool(activeCars.length > 0);
  const priceRatings = useMemo(() => (pricePool ? rateCars(activeCars, pricePool) : {}), [pricePool, activeCars.map(c => c.id).join(',')]);

  const removeFavorite = async (carId) => {
    // Remove through the shared favorites store so every screen stays in sync (no extra request)
    if (favoriteIds.includes(carId)) {
      await toggleFavorite(carId);
    } else {
      // Fallback: read from the server so a stale cached list can never leave favourites behind
      const matches = await entities.Favorite.filter({ user_email: user.email, car_id: carId });
      await Promise.all(matches.map((favorite) => entities.Favorite.delete(favorite.id)));
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