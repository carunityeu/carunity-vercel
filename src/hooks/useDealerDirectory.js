import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import { getLocationSearchVariants } from '@/utils/locationUtils';

const PAGE_SIZE = 12;
const norm = (v) => (v || '').toString().trim().toLowerCase();

// All dealerships with their active listing counts, read straight from Supabase (the list is small).
// Replaces the Base44 function getDealerDirectory, which no longer answers.
async function loadDirectory() {
  const dealers = await entities.Dealer.filter({}, '-created_date', 1000);
  const ids = dealers.map((d) => d.id);
  const { rows } = ids.length
    ? await entities.Car.aggregate({ query: { status: 'active', dealer_id: { $in: ids } }, groupBy: 'dealer_id' })
    : { rows: [] };
  const counts = Object.fromEntries(rows.map((r) => [r.dealer_id, r.count]));
  return dealers.map((d) => ({ ...d, car_count: counts[d.id] || 0 }));
}

export default function useDealerDirectory({ searchQuery, selectedCountry, selectedCity, verifiedOnly, sortBy, page, language }) {
  const [search, setSearch] = useState(searchQuery.trim());
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchQuery.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  const lang = language?.split('-')[0] || 'en';

  const all = useQuery({ queryKey: ['dealer-directory-all'], queryFn: loadDirectory, staleTime: 5 * 60 * 1000 });

  const query = useQuery({
    queryKey: ['dealer-directory', search, selectedCountry, selectedCity, verifiedOnly, sortBy, page, lang, all.dataUpdatedAt],
    enabled: !!all.data,
    queryFn: () => {
      const dealers = all.data;
      // The same matching as before: search in name, city and country, in every site language
      const terms = search ? [...new Set([search, ...getLocationSearchVariants(search, 'cities', true), ...getLocationSearchVariants(search, 'countries', true)])].map(norm) : [];
      const countries = selectedCountry === 'all' ? [] : getLocationSearchVariants(selectedCountry, 'countries').map(norm);
      const cities = selectedCity === 'all' ? [] : getLocationSearchVariants(selectedCity, 'cities').map(norm);
      const matched = dealers.filter((d) =>
        (!terms.length || terms.some((term) => [d.name, d.city, d.country].some((f) => norm(f).includes(term))))
        && (!countries.length || countries.includes(norm(d.country)))
        && (!cities.length || cities.includes(norm(d.city)))
        && (!verifiedOnly || d.is_verified === true));
      const compare = (a, b) => {
        let order = 0;
        if (sortBy === 'cars') order = b.car_count - a.car_count;
        if (sortBy === 'rating') order = (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'name') order = (a.name || '').localeCompare(b.name || '', lang, { sensitivity: 'base' });
        return order || (b.created_date || '').localeCompare(a.created_date || '') || String(a.id).localeCompare(String(b.id));
      };
      matched.sort(compare);
      const total = matched.length;
      const currentPage = Math.min(page, Math.max(1, Math.ceil(total / PAGE_SIZE)));
      return {
        items: matched.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
        total,
        allTotal: dealers.length,
        cities: [...new Set(dealers.map((d) => d.city).filter(Boolean))],
        page: currentPage,
      };
    },
  });
  return {
    ...query,
    isLoading: all.isLoading || query.isLoading,
    isError: all.isError || query.isError,
    error: all.error || query.error,
    refetch: () => (all.isError ? all.refetch() : query.refetch()),
    isSearching: all.isLoading || query.isFetching || search !== searchQuery.trim(),
  };
}
