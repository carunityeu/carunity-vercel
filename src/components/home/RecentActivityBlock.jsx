import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { auth } from '@/api/auth';
import { entities } from '@/api/entities';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/ds';
import ListingTile from '@/components/cars/ListingTile';

const GUEST_STORAGE_KEY = 'recentlyViewed';
const MAX_CARDS = 6;

export default function RecentActivityBlock() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  React.useEffect(() => entities.Car.subscribe(event => {
    if (event.type === 'delete' || (event.type === 'update' && event.data?.status && event.data.status !== 'active')) {
      queryClient.invalidateQueries({ queryKey: ['recentViewCars'] });
    }
  }), [queryClient]);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: async () => { const ok = await auth.isAuthenticated(); if (!ok) return null; return auth.me(); },
    staleTime: 5 * 60 * 1000,
  });

  const guestIds = React.useMemo(() => {
    try {
      const ids = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '[]');
      return Array.isArray(ids) ? ids.slice(0, MAX_CARDS) : [];
    } catch { return []; }
  }, []);

  const { data: viewHistory = [] } = useQuery({
    queryKey: ['recentViews', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return entities.ViewHistory.filter({ user_email: user.email }, '-created_date', MAX_CARDS);
    },
    enabled: !!user,
  });

  const carIds = user
    ? viewHistory.map(h => h.car_id).slice(0, MAX_CARDS)
    : guestIds;

  const { data: cars = [] } = useQuery({
    queryKey: ['recentViewCars', carIds],
    queryFn: async () => {
      if (carIds.length === 0) return [];
      const { items } = await entities.Car.filter({ id: { $in: carIds }, status: 'active' }, { limit: MAX_CARDS });
      return items;
    },
    enabled: carIds.length > 0,
  });

  const seenIds = new Set();
  const orderedIds = user ? viewHistory.map(h => h.car_id) : guestIds;
  const recentCars = orderedIds
    .filter(id => { if (seenIds.has(id)) return false; seenIds.add(id); return true; })
    .slice(0, MAX_CARDS)
    .map(id => cars.find(c => c.id === id))
    .filter(Boolean);

  if (!user && guestIds.length === 0) return null;
  if (recentCars.length === 0) return null;

  // A card inside the page gutters (Container): title and link, then the same short tiles as elsewhere
  // (photo with browsing, save and compare; name, year and price) — nothing else.
  return (
    <Container as="section" className="py-6 sm:py-8" aria-labelledby="recently-viewed-title">
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 id="recently-viewed-title" className="text-lg font-bold text-ink">{t('home.recently_viewed_head')}</h2>
          <Link to={createPageUrl('Dashboard') + '?tab=history'} className="flex-shrink-0 text-sm font-medium text-brand-text">{t('home.see_all', 'Все')}</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
          {recentCars.map((car) => <ListingTile key={car.id} car={car} compact />)}
        </div>
      </div>
    </Container>
  );
}
