import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import useSearchSaveToggle from '@/hooks/useSearchSaveToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Loader2,
  Bookmark,
  BookmarkCheck,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/lib/utils';
import CompactCarCard from '@/components/cars/CompactCarCard';
import ListCarCard from '@/components/cars/ListCarCard';
import CarGridSkeleton from '@/components/cars/CarGridSkeleton';
import LandingFilters from '@/components/search/LandingFilters';
import { DEFAULT_EXTENDED } from '@/components/search/CatalogExtendedSearch';
import DraggableFilterPanel from '@/components/search/DraggableFilterPanel';
import FilterActionButtons from '@/components/search/FilterActionButtons';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import AdBanner from '@/components/ads/AdBanner';
import useCardExtras from '@/hooks/useCardExtras';
import { parseCatalogSearch, buildCatalogQuery } from '@/lib/catalogSearch';

export default function Catalog() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();


  const sortOptions = [
    { value: '-created_date', label: t('catalog.sort_newest') },
    { value: 'created_date',  label: t('catalog.sort_oldest') },
    { value: 'price',         label: t('catalog.sort_price_asc') },
    { value: '-price',        label: t('catalog.sort_price_desc') },
    { value: '-year',         label: t('catalog.sort_year_new') },
    { value: 'year',          label: t('catalog.sort_year_old') },
    { value: 'mileage',       label: t('catalog.sort_mileage_asc') },
  ];
  const [filters, setFilters] = useState(() => parseCatalogSearch(window.location.search).filters);
  const [extFilters, setExtFilters] = useState(() => parseCatalogSearch(window.location.search).ext);
  const [sortBy, setSortBy] = useState('-created_date');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const PAGE_SIZE = 20;
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('catalog-view') || 'grid');
  const { searchSaved, pending: searchSavePending, toggle: toggleSearch } = useSearchSaveToggle(JSON.stringify([filters, extFilters]));
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('catalog-view', mode);
  };

  // Keep shareable detailed-search parameters in sync with the results.
  useEffect(() => {
    const parsed = parseCatalogSearch(location.search);
    setFilters(parsed.filters);
    setExtFilters(parsed.ext);
  }, [location.search]);

  const carQuery = useMemo(() => buildCatalogQuery(filters, extFilters), [filters, extFilters]);
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['cars', carQuery, sortBy],
    initialPageParam: null,
    staleTime: 60 * 1000,
    queryFn: ({ pageParam }) => base44.entities.Car.filter(carQuery, { sort: sortBy, limit: PAGE_SIZE, ...(pageParam ? { cursor: pageParam } : {}) }),
    getNextPageParam: lastPage => lastPage.has_more ? lastPage.next_cursor : undefined,
  });
  const cars = data?.pages.flatMap(result => result.items) || [];
  const { data: totalCount = 0 } = useQuery({
    queryKey: ['catalogCount', carQuery],
    queryFn: () => base44.entities.Car.count(carQuery),
    staleTime: 60 * 1000,
  });
  const { data: modelCounts = {} } = useQuery({
    queryKey: ['catalogModelCounts', carQuery],
    enabled: !!filters.brand,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const result = await base44.entities.Car.aggregate({ query: carQuery, groupBy: 'model', limit: 1000 });
      return Object.fromEntries(result.rows.map(row => [row.model, row.count]));
    },
  });

  const activeFiltersCount = Object.entries(carQuery).filter(([key]) => key !== 'status').length;

  const handleSaveSearch = async () => {
    // Serialize to flat URL params (serializable & re-applicable)
    const flat = {};
    if (filters.brands?.length) flat.brands = filters.brands.join(',');
    else if (filters.brand && filters.brand !== 'any') flat.brand = filters.brand;
    if (filters.model && filters.model !== 'any') flat.model = filters.model;
    if (filters.fuelType && filters.fuelType !== 'any') flat.fuelType = filters.fuelType;
    if (filters.bodyType && filters.bodyType !== 'any') flat.bodyType = filters.bodyType;
    if (filters.transmission && filters.transmission !== 'any') flat.transmission = filters.transmission;
    if (filters.driveType && filters.driveType !== 'any') flat.driveType = filters.driveType;
    if (filters.country && filters.country !== 'any') flat.country = filters.country;
    if (filters.city) flat.city = filters.city;
    if (filters.color && filters.color !== 'any') flat.color = filters.color;
    if (filters.priceRange?.[0] > 0) flat.priceFrom = filters.priceRange[0].toString();
    if (filters.priceRange?.[1] < 200000) flat.priceTo = filters.priceRange[1].toString();
    if (filters.powerRange?.[0] > 0) flat.powerFrom = Math.round(filters.powerRange[0] * 1.36).toString();
    if (filters.powerRange?.[1] < 400) flat.powerTo = Math.round(filters.powerRange[1] * 1.36).toString();
    if (filters.yearFrom && filters.yearFrom !== 'any') flat.yearFrom = filters.yearFrom;
    if (filters.yearTo && filters.yearTo !== 'any') flat.yearTo = filters.yearTo;
    if (filters.mileageFrom) flat.mileageFrom = filters.mileageFrom;
    if (filters.mileageTo) flat.mileageTo = filters.mileageTo;
    if (filters.condition) flat.condition = filters.condition;
    if (filters.features?.length) flat.features = filters.features.join(',');
    Object.assign(flat, filters.advanced || {});
    // Extended filters
    Object.entries(extFilters).forEach(([k, v]) => {
      if (v === true) flat[k] = 'true';
      else if (v !== '' && v !== 'any') flat[k] = v;
    });
    const brandPart = filters.brands?.length ? filters.brands[0] : (filters.brand && filters.brand !== 'any' ? filters.brand : '');
    const pricePart = (filters.priceRange?.[0] > 0 || filters.priceRange?.[1] < 200000) ? `, ${filters.priceRange[0] || ''}–${filters.priceRange[1] === 200000 ? '' : filters.priceRange[1]}€` : '';
    const name = brandPart ? `${brandPart}${filters.model && filters.model !== 'any' ? ' ' + filters.model : ''}${pricePart}` : t('catalog.search_name_default');
    await toggleSearch({ name, filters: flat });
  };

  const pagedCars = cars;

  // Price rating + active promotion for every tile on this page (grid and list)
  const { ratings: priceRatings, promotions } = useCardExtras(pagedCars);

  const listCars = viewMode === 'list' ? pagedCars : [];

  // Who is selling — dealer block for the list view
  const dealerIds = [...new Set(listCars.filter((c) => c.dealer_id).map((c) => c.dealer_id))];
  const { data: dealersMap = {} } = useQuery({
    queryKey: ['catalogDealers', dealerIds.join(',')],
    enabled: dealerIds.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const list = await base44.entities.Dealer.filter({ id: { $in: dealerIds } });
      return Object.fromEntries(list.map((d) => [d.id, d]));
    }
  });

  const handleFiltersChange = (newFilters) => {
    const explicitBounds = { ...newFilters.explicitBounds };
    for (const [key, prefix] of [['priceRange', 'price'], ['powerRange', 'power']]) {
      if (JSON.stringify(newFilters[key]) !== JSON.stringify(filters[key])) { delete explicitBounds[prefix+'From']; delete explicitBounds[prefix+'To']; }
    }
    setFilters({ ...newFilters, explicitBounds });

  };

  const saveSearchButton = (
    <button
      type="button"
      onClick={handleSaveSearch}
      title={t(searchSaved ? 'searchRef.removeSearch' : 'catalog.save_search')}
      aria-label={t(searchSaved ? 'searchRef.removeSearch' : 'catalog.save_search')}
      disabled={searchSavePending}
      aria-pressed={searchSaved}
      className={cn(
        'flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-medium transition-colors disabled:opacity-50',
        searchSaved
          ? 'bg-emerald-500 text-white'
          : 'text-slate-500 hover:bg-slate-200 hover:text-emerald-600 dark:hover:bg-slate-700 dark:hover:text-emerald-400'
      )}
    >
      {searchSavePending ? <Loader2 className="h-4 w-4 animate-spin" /> : searchSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      <span className="hidden sm:inline">{t(searchSaved ? 'searchRef.removeSearch' : 'catalog.save_search')}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile filter sheet */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md p-0 overflow-y-auto">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between w-full">
              <SheetTitle>{t('catalog.filters')}</SheetTitle>
              {saveSearchButton}
            </div>
          </SheetHeader>
          <div className="p-4">
            <LandingFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              vehicleType="car"
              resultsCount={totalCount}
              modelCounts={modelCounts}
            />
          </div>
          <div className="p-3 border-t border-slate-200 dark:border-slate-700">
            <FilterActionButtons onSearch={() => setMobileFiltersOpen(false)} onReset={() => { setFilters({ priceRange: [0, 200000], powerRange: [0, 400] }); setExtFilters({ ...DEFAULT_EXTENDED });  }} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <CatalogHeader
          title={t('catalog.all_cars', 'Все автомобили')}
          count={totalCount}
          countLabel={t('catalog.cars', 'автомобилей')}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOptions={sortOptions}
          onShowFilters={() => setMobileFiltersOpen(true)}
          filterCount={activeFiltersCount}
          breadcrumbLabel={t('catalog.all_cars', 'Все автомобили')}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />

        {/* Active filter badges */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.brand && filters.brand !== 'any' && (
              <Badge variant="secondary" className="gap-1">
                {filters.brand}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, brand: '', brands: []})} />
              </Badge>
            )}
            {filters.fuelType && filters.fuelType !== 'any' && (
              <Badge variant="secondary" className="gap-1">
                {t('fuel_types.' + filters.fuelType)}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, fuelType: ''})} />
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-500 h-6 px-2"
              onClick={() => { setFilters({ priceRange: [0, 200000], powerRange: [0, 400] }); setExtFilters({ ...DEFAULT_EXTENDED }); }}
            >
              {t('catalog.reset_all')}
            </Button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block flex-shrink-0 lg:w-[26%] xl:w-[340px]">
            <DraggableFilterPanel
              storageKey="catalog-filters"
              headerExtra={saveSearchButton}
              footer={
                <FilterActionButtons onSearch={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onReset={() => { setFilters({ priceRange: [0, 200000], powerRange: [0, 400] }); setExtFilters({ ...DEFAULT_EXTENDED });  }} />
              }
            >
              <LandingFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                vehicleType="car"
                resultsCount={totalCount}
                modelCounts={modelCounts}
              />
            </DraggableFilterPanel>
            {/* AD — вертикальный баннер в сайдбаре (десктоп) */}
            <AdBanner size="sidebar" slot="catalog-sidebar" className="mt-4" />
          </aside>

          {/* Car Grid */}
          <main className="flex-1">
            {isLoading ? (
              <CarGridSkeleton count={viewMode === 'list' ? 6 : 9} viewMode={viewMode} />
            ) : isError ? (
              <div role="alert" className="rounded-2xl border border-border bg-card p-8 text-center"><p className="text-sm text-muted-foreground">{t('searchRef.failed')}</p><Button variant="outline" onClick={() => refetch()} className="mt-4">{t('searchRef.retry')}</Button></div>
            ) : cars.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SlidersHorizontal className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('catalog.not_found_title')}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">{t('catalog.not_found_desc')}</p>
                <Button onClick={() => { setFilters({}); setExtFilters({ ...DEFAULT_EXTENDED }); }}>{t('catalog.reset_filters')}</Button>
              </div>
            ) : (
              <>
                <div className={viewMode === 'list' ? 'flex flex-col gap-3' : 'grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4'}>
                  {pagedCars.map((car, index) => (
                    <React.Fragment key={car.id}>
                      {viewMode === 'list'
                        ? <ListCarCard car={car} showLocation rating={priceRatings[car.id]} promotion={promotions[car.id]} dealer={dealersMap[car.dealer_id] || null} />
                        : <CompactCarCard car={car} showLocation rating={priceRatings[car.id]} promotion={promotions[car.id]} />}
                      {/* AD — после 6-го объявления */}
                      {index === 5 && (
                        <div className={viewMode === 'list' ? 'w-full' : 'col-span-full'}>
                          <AdBanner size="leaderboard" slot="catalog-mid" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                {hasNextPage && <div className="mt-8 flex justify-center"><Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="min-h-11 w-full gap-2 rounded-xl sm:w-auto">{isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" />}{t('searchRef.loadMore')}</Button></div>}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}