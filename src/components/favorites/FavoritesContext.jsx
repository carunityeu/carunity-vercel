import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { redirectToAccount } from '@/components/auth/requireAccount';
import { useAuth } from '@/lib/AuthContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {

  const [dbFavs, setDbFavs] = useState(new Set());
  const { user, isLoadingAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;
    if (!user) {
      setDbFavs(new Set());
      setLoading(isLoadingAuth);
      return;
    }
    setLoading(true);
    base44.entities.Favorite.filter({ user_email: user.email })
      .then(favs => { if (mounted) setDbFavs(new Set(favs.map(f => f.car_id))); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user?.id, isLoadingAuth]);

  const isFavorite = useCallback((carId) => {
    if (user) return dbFavs.has(carId);
    return false;
  }, [user, dbFavs]);

  const toggleFavorite = useCallback(async (carId) => {
    if (user) {
      const isFav = dbFavs.has(carId);
      if (isFav) {
        const existing = await base44.entities.Favorite.filter({ user_email: user.email, car_id: carId });
        if (existing.length > 0) await base44.entities.Favorite.delete(existing[0].id);
        setDbFavs(prev => { const next = new Set(prev); next.delete(carId); return next; });
      } else {
        await base44.entities.Favorite.create({ user_email: user.email, car_id: carId });
        setDbFavs(prev => { const next = new Set(prev); next.add(carId); return next; });
      }
      queryClient.invalidateQueries(['favorites']);
      queryClient.invalidateQueries(['favoriteCars']);
    } else {
      redirectToAccount();
    }
  }, [user, dbFavs, queryClient]);

  const favoriteIds = user ? [...dbFavs] : [];

  return (
    <FavoritesContext.Provider value={{ isFavorite, toggleFavorite, favoriteIds, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) return { isFavorite: () => false, toggleFavorite: () => {}, favoriteIds: [], loading: true };
  return ctx;
}