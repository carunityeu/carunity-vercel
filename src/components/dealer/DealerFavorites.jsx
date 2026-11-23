import React from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import FavoritesPanel from '@/components/dashboard/FavoritesPanel';

export default function DealerFavorites({ user }) {
  const query = { user_email: user.email };
  const count = useQuery({
    queryKey: ['favorites', 'dealer-count', user.email],
    queryFn: () => entities.Favorite.count(query)
  });
  const favorites = useInfiniteQuery({
    queryKey: ['favoriteCars', 'dealer', user.email],
    initialPageParam: null,
    queryFn: async ({ pageParam }) => {
      const page = await entities.Favorite.filter(query, { sort: '-created_date', limit: 6, ...(pageParam ? { cursor: pageParam } : {}) });
      const ids = page.items.map(favorite => favorite.car_id);
      const cars = ids.length ? await entities.Car.filter({ id: { $in: ids } }, { limit: 6 }) : { items: [] };
      const byId = new Map(cars.items.map(car => [car.id, car]));
      return { ...page, items: ids.map(id => byId.get(id) || { id, status: 'inactive', is_missing: true }) };
    },
    getNextPageParam: page => page.has_more ? page.next_cursor : undefined
  });
  if (favorites.error || count.error) throw favorites.error || count.error;
  return <FavoritesPanel user={user} cars={favorites.data?.pages.flatMap(page => page.items) || []}
    isLoading={favorites.isPending || count.isPending}
    pagination={{ totalCount: count.data, hasMore: favorites.hasNextPage, loadingMore: favorites.isFetchingNextPage, onLoadMore: () => favorites.fetchNextPage() }} />;
}