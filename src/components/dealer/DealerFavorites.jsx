import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Heart, Loader2 } from 'lucide-react';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/components/favorites/FavoritesContext';
import { Card, EmptyState } from '@/components/dealer-panel/ui';
import { TILE_GRID, SourcingTile, Loading, useRatings } from '@/components/dealer-panel/sourcingParts';

const PAGE = 12;

/** Cars the dealer saved, as the same tiles as on the site. Unsaving (heart) hides a tile at once. */
export default function DealerFavorites({ user }) {
  const { t } = useTranslation();
  const { favoriteIds } = useFavorites();
  const favorites = useInfiniteQuery({
    queryKey: ['favoriteCars', 'dealer', user.email],
    initialPageParam: null,
    queryFn: async ({ pageParam }) => {
      const page = await entities.Favorite.filter({ user_email: user.email }, { sort: '-created_date', limit: PAGE, ...(pageParam ? { cursor: pageParam } : {}) });
      const ids = page.items.map((f) => f.car_id);
      const cars = ids.length ? await entities.Car.filter({ id: { $in: ids } }, { limit: PAGE }) : { items: [] };
      const byId = new Map(cars.items.map((car) => [car.id, car]));
      return { ...page, items: ids.map((id) => byId.get(id)).filter(Boolean) };
    },
    getNextPageParam: (page) => (page.has_more ? page.next_cursor : undefined),
  });
  if (favorites.error) throw favorites.error;

  const saved = new Set(favoriteIds);
  const cars = (favorites.data?.pages.flatMap((p) => p.items) || []).filter((c) => c.status === 'active' && saved.has(c.id));
  const ratings = useRatings(cars);

  if (favorites.isPending) return <Loading />;
  if (!cars.length) {
    return (
      <Card>
        <EmptyState icon={Heart} title={t('dashboard.no_favorites_title')} text={t('dashboard.no_favorites_desc')}
          action={<Button asChild variant="secondary"><Link to="/Catalog">{t('dashboard.go_catalog')}</Link></Button>} />
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      <div className={TILE_GRID}>
        {cars.map((car) => <SourcingTile key={car.id} car={car} rating={ratings[car.id]} />)}
      </div>
      {favorites.hasNextPage && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => favorites.fetchNextPage()} disabled={favorites.isFetchingNextPage}>
            {favorites.isFetchingNextPage && <Loader2 className="animate-spin" />}{t('dp.show_more', 'Показать ещё')}
          </Button>
        </div>
      )}
    </div>
  );
}
