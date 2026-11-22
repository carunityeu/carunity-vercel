import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getLocationSearchVariants } from '@/utils/locationUtils';

export default function useDealerDirectory({ searchQuery, selectedCountry, selectedCity, verifiedOnly, sortBy, page, language }) {
  const [search, setSearch] = useState(searchQuery.trim());
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchQuery.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  const lang = language?.split('-')[0] || 'en';
  const query = useQuery({
    queryKey: ['dealer-directory', search, selectedCountry, selectedCity, verifiedOnly, sortBy, page, lang],
    queryFn: async () => {
      const searchTerms = search ? [...new Set([
        ...getLocationSearchVariants(search, 'cities', true),
        ...getLocationSearchVariants(search, 'countries', true)
      ])] : [];
      const { data } = await base44.functions.invoke('getDealerDirectory', {
        searchTerms,
        countryValues: selectedCountry === 'all' ? [] : getLocationSearchVariants(selectedCountry, 'countries'),
        cityValues: selectedCity === 'all' ? [] : getLocationSearchVariants(selectedCity, 'cities'),
        verifiedOnly, sortBy, page, language: lang
      });
      if (data.error) throw new Error(data.error);
      return data;
    }
  });
  return { ...query, isSearching: query.isFetching || search !== searchQuery.trim() };
}