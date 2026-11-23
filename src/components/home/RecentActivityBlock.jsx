import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { entities } from '@/api/entities';
import { useTranslation } from 'react-i18next';
import { History, Car, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const formatPrice = (price) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(price) + ' €';

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
    queryFn: async () => { const ok = await base44.auth.isAuthenticated(); if (!ok) return null; return base44.auth.me(); },
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

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-2 lg:px-2 mt-3 sm:mt-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Section card — same style as Top cars */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          {/* Header with title */}
          <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <History className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">{t('home.recently_viewed_head')}</h3>
            </div>
            <Link
              to={createPageUrl('Dashboard') + '?tab=history'}
              className="flex items-center gap-0.5 text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors whitespace-nowrap flex-shrink-0">
              {t('home.see_all_viewed')}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Content — slate background with bordered cards */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800/50">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
              {recentCars.map(car => (
                <Link key={car.id} to={getCarDetailsPath(car)} className="block bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors group">
                  <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    {car.images?.[0] ? <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Car className="w-5 h-5 text-slate-400" /></div>}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{car.brand} {car.model} {car.year}</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(car.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}