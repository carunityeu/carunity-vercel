import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { rateCars } from '@/lib/priceRating';
import { entities } from '@/api/entities';

const POOL_COLUMNS = 'id,brand,model,body_type,car_class,year,mileage,engine_power,price,features';

/** Active listings used as the comparison pool for price ratings (only the columns the formula needs). */
export function usePricePool(enabled = true) {
  return useQuery({
    queryKey: ['pricePool'],
    enabled,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.from('cars').select(POOL_COLUMNS).eq('status', 'active')
        .order('created_date', { ascending: false }).limit(500);
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Extra tile data for a page of listings: the price rating (how expensive the car
 * is compared to similar ones) and the active promotion ('boost' | 'top_spot').
 * Pass the tiles currently on screen — one page, not the whole catalog.
 */
export default function useCardExtras(cars = []) {
  const ids = cars.map((c) => c.id).filter(Boolean);
  const key = ids.join(',');

  // Price rating is computed in the browser against all active listings (see lib/priceRating.js)
  const { data: pool } = usePricePool(ids.length > 0);
  const ratings = useMemo(() => (pool ? rateCars(cars, pool) : {}), [pool, key]);

  const { data: promotions = {} } = useQuery({
    queryKey: ['listingPromotions', key],
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const found = await entities.ListingPromotion.filter({
        listing_id: { $in: ids },
        status: 'active'
      });
      const list = Array.isArray(found) ? found : (found?.items || []);
      // A top spot outranks a boost when both are active
      return list.reduce((map, p) => {
        if (p.promotion_type === 'top_spot' || !map[p.listing_id]) {
          map[p.listing_id] = p.promotion_type;
        }
        return map;
      }, {});
    }
  });

  return { ratings, promotions };
}