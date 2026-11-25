import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { auth } from '@/api/auth';
import { entities } from '@/api/entities';
import requireAccount from '@/components/auth/requireAccount';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Heart, X, Loader2, SlidersHorizontal, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { checkIfPremiumCar } from '@/utils/premiumCarMatcher';
import { getModelsForBrand, csvBrands } from '@/utils/carData';
import { generationsDB } from '@/components/search/GenerationPicker';
import LandingFilters from '@/components/search/LandingFilters';
import { DEFAULT_EXTENDED } from '@/components/search/CatalogExtendedSearch';
import DraggableFilterPanel from '@/components/search/DraggableFilterPanel';
import FilterActionButtons from '@/components/search/FilterActionButtons';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import CompactCarCard from '@/components/cars/CompactCarCard';
import AdBanner from '@/components/ads/AdBanner';
import ListPagination from '@/components/ui/ListPagination';

const allBrands = csvBrands;
const PAGE_SIZE = 20;

export default function LuxuryCatalog() {
  const { t } = useTranslation();
  const location = useLocation();
  const queryClient = useQueryClient();

  const sortOptions = [
    { value: '-created_date', label: t('catalog.sort_newest') },
    { value: 'created_date',  label: t('catalog.sort_oldest') },
    { value: 'price',         label: t('catalog.sort_price_asc') },
    { value: '-price',        label: t('catalog.sort_price_desc') },
    { value: '-year',         label: t('catalog.sort_year_new') },
    { value: 'year',          label: t('catalog.sort_year_old') },
    { value: 'mileage',       label: t('catalog.sort_mileage_asc') },
  ];

  const { data: allCarsRaw = [], isLoading } = useQuery({
    queryKey: ['activeCarsForPremium'],
    queryFn: () => entities.Car.filter({ status: 'active' }, '-created_date', 1000),
    staleTime: 5 * 60 * 1000,
  });

  const allCars = useMemo(() => {
    return (allCarsRaw || []).filter(c => checkIfPremiumCar(c));
  }, [allCarsRaw]);

  const [filters, setFilters] = useState({
    brand: '', model: '',
    priceRange: [0, 200000], powerRange: [0, 400],
    yearFrom: '', yearTo: '', fuelType: '', bodyType: '',
    country: '', color: '', transmission: '', driveType: '',
  });
  const [extFilters, setExtFilters] = useState({ ...DEFAULT_EXTENDED });
  const [sortBy, setSortBy] = useState('-created_date');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Parse URL params whenever URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const f = {
      brand: urlParams.get('brand') || '',
      model: '',
      priceRange: [0, 200000], powerRange: [0, 400],
      yearFrom: '', yearTo: '', fuelType: '', bodyType: '',
      country: '', color: '', transmission: '', driveType: '',
    };
    if (urlParams.get('model')) f.model = urlParams.get('model');
    if (urlParams.get('priceFrom') || urlParams.get('priceTo')) {
      f.priceRange = [urlParams.get('priceFrom') ? parseInt(urlParams.get('priceFrom')) : 0, urlParams.get('priceTo') ? parseInt(urlParams.get('priceTo')) : 200000];
    }
    if (urlParams.get('powerFrom') || urlParams.get('powerTo')) {
      f.powerRange = [Math.round((urlParams.get('powerFrom') ? parseInt(urlParams.get('powerFrom')) : 0) / 1.36), Math.round((urlParams.get('powerTo') ? parseInt(urlParams.get('powerTo')) : 400) / 1.36)];
    }
    if (urlParams.get('yearFrom')) f.yearFrom = urlParams.get('yearFrom');
    if (urlParams.get('yearTo')) f.yearTo = urlParams.get('yearTo');
    if (urlParams.get('fuelType')) f.fuelType = urlParams.get('fuelType');
    if (urlParams.get('bodyType')) f.bodyType = urlParams.get('bodyType');
    if (urlParams.get('transmission')) f.transmission = urlParams.get('transmission');
    if (urlParams.get('driveType')) f.driveType = urlParams.get('driveType');
    if (urlParams.get('country')) f.country = urlParams.get('country');
    if (urlParams.get('color')) f.color = urlParams.get('color');
    if (urlParams.get('condition')) f.condition = urlParams.get('condition');
    setFilters(f);

    const ext = { ...DEFAULT_EXTENDED };
    if (urlParams.get('ext_condition') || urlParams.get('condition')) ext.condition = urlParams.get('ext_condition') || urlParams.get('condition');
    if (urlParams.get('ownersCount')) ext.ownersCount = urlParams.get('ownersCount');
    if (urlParams.get('colorInterior')) ext.colorInterior = urlParams.get('colorInterior');
    if (urlParams.get('interiorMaterial')) ext.interiorMaterial = urlParams.get('interiorMaterial');
    if (urlParams.get('doors')) ext.doors = urlParams.get('doors');
    if (urlParams.get('seats')) ext.seats = urlParams.get('seats');
    if (urlParams.get('particulateFilter') === 'true') ext.particulateFilter = true;
    if (urlParams.get('warranty') === 'true') ext.warranty = true;
    if (urlParams.get('serviceBook') === 'true') ext.serviceBook = true;
    if (urlParams.get('vatDeductible') === 'true') ext.vatDeductible = true;
    setExtFilters(ext);
    setPage(1);
  }, [location.search]);

  // Model counts for selected brand
  const modelCounts = useMemo(() => {
    if (!filters.brand) return {};
    const counts = {};
    allCars.forEach(car => {
      if (car.brand === filters.brand && car.model) {
        counts[car.model] = (counts[car.model] || 0) + 1;
      }
    });
    return counts;
  }, [allCars, filters.brand]);

  const filtered = useMemo(() => {
    let result = [...allCars];
    if (filters.brand && filters.brand !== 'any') result = result.filter(c => c.brand === filters.brand);
    if (filters.model && filters.model !== 'any') result = result.filter(c => c.model === filters.model);
    if (filters.priceRange[0] > 0) result = result.filter(c => c.price >= filters.priceRange[0]);
    if (filters.priceRange[1] < 200000) result = result.filter(c => c.price <= filters.priceRange[1]);
    if (filters.powerRange[0] > 0) result = result.filter(c => c.engine_power && c.engine_power >= filters.powerRange[0] * 1.36);
    if (filters.powerRange[1] < 400) result = result.filter(c => c.engine_power && c.engine_power <= filters.powerRange[1] * 1.36);
    if (filters.yearFrom && filters.yearFrom !== 'any') result = result.filter(c => c.year >= Number(filters.yearFrom));
    if (filters.yearTo && filters.yearTo !== 'any') result = result.filter(c => c.year <= Number(filters.yearTo));
    if (filters.fuelType && filters.fuelType !== 'any') result = result.filter(c => c.fuel_type === filters.fuelType);
    if (filters.bodyType && filters.bodyType !== 'any') result = result.filter(c => c.body_type === filters.bodyType);
    if (filters.country && filters.country !== 'any') result = result.filter(c => c.country === filters.country);
    if (filters.color && filters.color !== 'any') result = result.filter(c => c.color === filters.color);
    if (filters.transmission && filters.transmission !== 'any') result = result.filter(c => c.transmission === filters.transmission);
    if (filters.driveType && filters.driveType !== 'any') result = result.filter(c => c.drive_type === filters.driveType);
    if (filters.condition && filters.condition !== 'any') result = result.filter(c => c.condition === filters.condition);
    // Extended filters
    if (extFilters.condition && extFilters.condition !== 'any') result = result.filter(c => (c.condition || '').toLowerCase() === extFilters.condition.toLowerCase());
    if (extFilters.ownersCount) result = result.filter(c => c.owners_count === parseInt(extFilters.ownersCount));
    if (extFilters.colorInterior) result = result.filter(c => (c.color_interior || '') === extFilters.colorInterior);
    if (extFilters.interiorMaterial) result = result.filter(c => (c.interior_material || '') === extFilters.interiorMaterial);
    if (extFilters.doors) result = result.filter(c => {
      const carDoors = c.doors ? (c.doors >= 6 ? '6/7' : c.doors >= 4 ? '4/5' : '2/3') : '';
      return carDoors === extFilters.doors;
    });
    if (extFilters.seats) result = result.filter(c => c.seats === parseInt(extFilters.seats));
    if (extFilters.particulateFilter) result = result.filter(c => c.particulate_filter);
    if (extFilters.warranty) result = result.filter(c => c.warranty);
    if (extFilters.serviceBook) result = result.filter(c => c.service_book);
    if (extFilters.vatDeductible) result = result.filter(c => c.vat_deductible);
    return result.sort((a, b) => {
      if (sortBy === 'created_date') return new Date(a.created_date || 0) - new Date(b.created_date || 0);
      if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
      if (sortBy === '-price') return (b.price || 0) - (a.price || 0);
      if (sortBy === '-year') return (b.year || 0) - (a.year || 0);
      if (sortBy === 'year') return (a.year || 0) - (b.year || 0);
      if (sortBy === 'mileage') return (a.mileage || 0) - (b.mileage || 0);
      return new Date(b.created_date || 0) - new Date(a.created_date || 0);
    });
  }, [allCars, filters, extFilters, sortBy]);

  const resetFilters = () => { setFilters({ priceRange: [0, 200000], powerRange: [0, 400] }); setExtFilters({ ...DEFAULT_EXTENDED }); setPage(1); };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'priceRange') return value[0] > 0 || value[1] < 200000;
    if (key === 'powerRange') return value[0] > 0 || value[1] < 400;
    return value && value !== '' && value !== 'any' && !(Array.isArray(value) && value.length === 0);
  }).length;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedCars = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSaveSearch = async () => {
    if (!await requireAccount()) return;
    const user = await auth.me();
    const flat = { premium: 'true' };
    if (filters.brand && filters.brand !== 'any') flat.brand = filters.brand;
    if (filters.model && filters.model !== 'any') flat.model = filters.model;
    if (filters.fuelType && filters.fuelType !== 'any') flat.fuelType = filters.fuelType;
    if (filters.bodyType && filters.bodyType !== 'any') flat.bodyType = filters.bodyType;
    if (filters.transmission && filters.transmission !== 'any') flat.transmission = filters.transmission;
    if (filters.driveType && filters.driveType !== 'any') flat.driveType = filters.driveType;
    if (filters.country && filters.country !== 'any') flat.country = filters.country;
    if (filters.color && filters.color !== 'any') flat.color = filters.color;
    if (filters.condition) flat.condition = filters.condition;
    if (filters.priceRange?.[0] > 0) flat.priceFrom = filters.priceRange[0].toString();
    if (filters.priceRange?.[1] < 200000) flat.priceTo = filters.priceRange[1].toString();
    if (filters.powerRange?.[0] > 0) flat.powerFrom = Math.round(filters.powerRange[0] * 1.36).toString();
    if (filters.powerRange?.[1] < 400) flat.powerTo = Math.round(filters.powerRange[1] * 1.36).toString();
    if (filters.yearFrom && filters.yearFrom !== 'any') flat.yearFrom = filters.yearFrom;
    if (filters.yearTo && filters.yearTo !== 'any') flat.yearTo = filters.yearTo;
    Object.entries(extFilters).forEach(([k, v]) => {
      if (v === true) flat[k] = 'true';
      else if (v !== '' && v !== 'any') flat[k] = v;
    });
    const brandPart = filters.brand && filters.brand !== 'any' ? filters.brand : '';
    const pricePart = (filters.priceRange?.[0] > 0 || filters.priceRange?.[1] < 200000) ? `, ${filters.priceRange[0] || ''}–${filters.priceRange[1] === 200000 ? '' : filters.priceRange[1]}€` : '';
    const name = brandPart ? `${brandPart}${filters.model && filters.model !== 'any' ? ' ' + filters.model : ''}${pricePart}` : t('catalog.search_name_default');
    await entities.SavedSearch.create({ user_email: user.email, name, filters: flat });
    queryClient.invalidateQueries({ queryKey: ['recentSearches'] });
    toast.success(t('catalog.search_saved'));
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile filter sheet */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md p-0 overflow-y-auto">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between w-full">
              <SheetTitle>{t('catalog.filters')}</SheetTitle>
              <button onClick={handleSaveSearch} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400" title={t('catalog.save_search')}>
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </SheetHeader>
          <div className="p-4">
            <LandingFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              vehicleType="car"
              resultsCount={filtered.length}
              modelCounts={modelCounts}
              hideTypeSelector={true}
            />
          </div>
          <div className="p-3 border-t border-slate-200 dark:border-slate-700">
            <FilterActionButtons onSearch={() => setMobileFiltersOpen(false)} onReset={resetFilters} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <CatalogHeader
          title={t('luxury.all_cars', 'Все люкс машины')}
          count={filtered.length}
          countLabel={t('catalog.cars', 'автомобилей')}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOptions={sortOptions}
          onShowFilters={() => setMobileFiltersOpen(true)}
          filterCount={activeFilterCount}
          breadcrumbLabel={t('luxury.all_cars', 'Все люкс машины')}
        />

        {/* Active filter badges */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.brand && filters.brand !== 'any' && (
              <Badge variant="secondary" className="gap-1">
                {filters.brand}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({ ...filters, brand: '', brands: [] })} />
              </Badge>
            )}
            {filters.fuelType && filters.fuelType !== 'any' && (
              <Badge variant="secondary" className="gap-1">
                {t('fuel_types.' + filters.fuelType)}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({ ...filters, fuelType: '' })} />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 h-6 px-2"
              onClick={resetFilters}
            >
              {t('catalog.reset_all')}
            </Button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block flex-shrink-0 lg:w-[26%] xl:w-[340px]">
            <DraggableFilterPanel
              storageKey="luxury-filters"
              headerExtra={
                <button onClick={handleSaveSearch} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400" title={t('catalog.save_search')}>
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
              }
              footer={
                <FilterActionButtons onSearch={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onReset={resetFilters} />
              }
            >
              <LandingFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                vehicleType="car"
                resultsCount={filtered.length}
                modelCounts={modelCounts}
                hideTypeSelector={true}
              />
            </DraggableFilterPanel>
          </aside>

          {/* Grid */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('catalog.not_found_title')}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">{t('catalog.not_found_desc')}</p>
                <Button onClick={resetFilters}>{t('catalog.reset_filters')}</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                  {pagedCars.map((car, index) => (
                    <React.Fragment key={car.id}>
                      <CompactCarCard car={car} showLocation />
                      {index === 5 && (
                        <div className="col-span-full">
                          <AdBanner size="leaderboard" slot="catalog-mid" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}