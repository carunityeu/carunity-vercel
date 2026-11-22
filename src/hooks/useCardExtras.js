import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Extra tile data for a page of listings: the price rating (how expensive the car
 * is compared to similar ones) and the active promotion ('boost' | 'top_spot').
 * Pass the tiles currently on screen — one page, not the whole catalog.
 */
export default function useCardExtras(cars = []) {
  const ids = cars.map((c) => c.id).filter(Boolean);
  const key = ids.join(',');

  const { data: ratings = {} } = useQuery({
    queryKey: ['priceRatings', key],
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = await base44.functions.invoke('getPriceRatings', {
        cars: cars.slice(0, 60).map((c) => ({
          id: c.id,
          brand: c.brand,
          model: c.model,
          body_type: c.body_type,
          car_class: c.car_class,
          year: c.year,
          mileage: c.mileage,
          engine_power: c.engine_power,
          price: c.price,
          features_count: c.features?.length || 0
        }))
      });
      return res.data?.ratings || {};
    }
  });

  const { data: promotions = {} } = useQuery({
    queryKey: ['listingPromotions', key],
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const found = await base44.entities.ListingPromotion.filter({
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