import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import useSearchSaveToggle from '@/hooks/useSearchSaveToggle';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Car, X, Loader2, SlidersHorizontal, Bookmark, BookmarkCheck } from 'lucide-react';
import LandingFilters from '@/components/search/LandingFilters';
import { DEFAULT_EXTENDED } from '@/components/search/CatalogExtendedSearch';
import DraggableFilterPanel from '@/components/search/DraggableFilterPanel';
import FilterActionButtons from '@/components/search/FilterActionButtons';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import CompactCarCard from '@/components/cars/CompactCarCard';
import AdBanner from '@/components/ads/AdBanner';
import ListPagination from '@/components/ui/ListPagination';

const ENTITY_MAP = {
  moto: 'Motorcycle',
  bus: 'Bus',
  special: 'SpecialEquipment',
  truck: 'Truck',
  boat: 'Boat',
  motorhome: 'Motorhome',
  trailer: 'Trailer',
};

const TITLE_KEYS = {
  moto: 'home.vtype_moto',
  bus: 'home.vtype_bus',
  special: 'home.vtype_special',
  truck: 'home.vtype_truck',
  boat: 'home.vtype_boat',
  motorhome: 'home.vtype_motorhome',
  trailer: 'home.vtype_trailer',
};

const subTypeOptions = {
  moto: ['sport', 'naked', 'touring', 'cruiser', 'enduro', 'scooter', 'chopper', 'motocross', 'quad'],
  bus: ['minibus', 'midi', 'full_size', 'double_decker', 'school', 'tourist'],
  special: ['excavator', 'bulldozer', 'crane', 'loader', 'tractor', 'harvester', 'forklift', 'compressor', 'generator', 'other'],
  truck: ['semi_truck', 'box_truck', 'flatbed', 'refrigerated', 'tanker', 'tipper', 'curtainsider', 'other'],
  boat: ['motorboat', 'sailboat', 'yacht', 'pontoon', 'speedboat', 'fishing', 'inflatable', 'catamaran', 'jet_ski', 'other'],
  motorhome: ['alcove', 'semi_integrated', 'integrated', 'van_conversion', 'campervan', 'fifth_wheel'],
  trailer: ['caravan', 'car_trailer', 'boat_trailer', 'flatbed_trailer', 'curtainsider', 'refrigerated', 'tanker', 'livestock', 'other'],
};

const subTypePrefix = {
  moto: 'moto_types', bus: 'bus_types', special: 'equipment_types',
  truck: 'truck_types', boat: 'boat_types', motorhome: 'motorhome_types', trailer: 'trailer_types',
};

const typeFieldMap = {
  moto: 'moto_type',
  bus: 'bus_type',
  special: 'equipment_type',
  truck: 'truck_type',
  boat: 'boat_type',
  motorhome: 'motorhome_type',
  trailer: 'trailer_type',
};

function getFuelOptions(vehicleType) {
  if (vehicleType === 'boat') return [{ value: 'petrol' }, { value: 'diesel' }, { value: 'electric' }, { value: 'sail' }];
  if (vehicleType === 'moto') return [{ value: 'petrol' }, { value: 'electric' }];
  if (vehicleType === 'trailer') return [];
  return [{ value: 'petrol' }, { value: 'diesel' }, { value: 'electric' }, { value: 'hybrid' }, { value: 'gas' }];
}

const PAGE_SIZE = 20;

export default function VehicleCatalog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();


  const params = new URLSearchParams(location.search);
  const vehicleType = params.get('type') || 'moto';
  const entityName = ENTITY_MAP[vehicleType];
  const typeField = typeFieldMap[vehicleType];

  const sortOptions = [
    { value: '-created_date', label: t('catalog.sort_newest') },
    { value: 'created_date',  label: t('catalog.sort_oldest') },
    { value: 'price',         label: t('catalog.sort_price_asc') },
    { value: '-price',        label: t('catalog.sort_price_desc') },
    { value: '-year',         label: t('catalog.sort_year_new') },
    { value: 'year',          label: t('catalog.sort_year_old') },
    { value: 'mileage',       label: t('catalog.sort_mileage_asc') },
  ];

  const [filters, setFilters] = useState({ priceRange: [0, 200000], powerRange: [0, 400] });
  const [extFilters, setExtFilters] = useState({ ...DEFAULT_EXTENDED });
  const [sortBy, setSortBy] = useState('-created_date');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { searchSaved, pending: searchSavePending, toggle: toggleSearch } = useSearchSaveToggle(JSON.stringify([vehicleType, filters, extFilters]));

  // Parse URL params whenever URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const f = { priceRange: [0, 200000], powerRange: [0, 400] };

    if (urlParams.get('brand')) f.brand = urlParams.get('brand');
    if (urlParams.get('model')) f.model = urlParams.get('model');
    if (urlParams.get('fuel_type') || urlParams.get('fuelType')) f.fuelType = urlParams.get('fuel_type') || urlParams.get('fuelType');
    if (urlParams.get('year_from') || urlParams.get('yearFrom')) f.yearFrom = urlParams.get('year_from') || urlParams.get('yearFrom');
    if (urlParams.get('year_to') || urlParams.get('yearTo')) f.yearTo = urlParams.get('year_to') || urlParams.get('yearTo');
    if (urlParams.get('country')) f.country = urlParams.get('country');
    if (urlParams.get('color')) f.color = urlParams.get('color');
    if (urlParams.get('transmission')) f.transmission = urlParams.get('transmission');
    if (urlParams.get('condition')) f.condition = urlParams.get('condition');
    if (urlParams.get('premium') === 'true') f.isPremium = true;
    if (urlParams.get('priceFrom') || urlParams.get('priceTo')) {
      f.priceRange = [urlParams.get('priceFrom') ? parseInt(urlParams.get('priceFrom')) : 0, urlParams.get('priceTo') ? parseInt(urlParams.get('priceTo')) : 200000];
    }
    if (urlParams.get('powerFrom') || urlParams.get('powerTo')) {
      f.powerRange = [Math.round((urlParams.get('powerFrom') ? parseInt(urlParams.get('powerFrom')) : 0) / 1.36), Math.round((urlParams.get('powerTo') ? parseInt(urlParams.get('powerTo')) : 400) / 1.36)];
    }
    const st = urlParams.get('moto_type') || urlParams.get('truck_type') || urlParams.get('bus_type') || urlParams.get('equipment_type') || urlParams.get('boat_type') || urlParams.get('motorhome_type') || urlParams.get('trailer_type') || urlParams.get('subType');
    if (st) f.subType = st;

    setFilters(f);

    // Parse extended filters
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

  const { data: items = [], isLoading } = useQuery({
    queryKey: [entityName, 'catalog'],
    queryFn: () => entities[entityName].list('-created_date', 200),
    enabled: !!entityName,
  });

  const fuelOptions = getFuelOptions(vehicleType);

  const brandOptions = useMemo(() => [...new Set(items.map(i => i.brand).filter(Boolean))].sort(), [items]);
  const modelOptions = useMemo(() => [...new Set(items.filter(i => !filters.brand || filters.brand === 'any' || i.brand === filters.brand).map(i => i.model).filter(Boolean))].sort(), [items, filters.brand]);

  const filtered = useMemo(() => {
    const f = filters;
    return items.filter(item => {
      if (f.brand && f.brand !== 'any' && item.brand !== f.brand) return false;
      if (f.model && f.model !== 'any' && item.model !== f.model) return false;
      if (f.isPremium && !item.is_premium) return false;
      if (f.fuelType && f.fuelType !== 'any' && item.fuel_type !== f.fuelType) return false;
      if (f.yearFrom && f.yearFrom !== 'any' && item.year < parseInt(f.yearFrom)) return false;
      if (f.yearTo && f.yearTo !== 'any' && item.year > parseInt(f.yearTo)) return false;
      if (f.priceRange?.[0] > 0 && item.price < f.priceRange[0]) return false;
      if (f.priceRange?.[1] < 200000 && item.price > f.priceRange[1]) return false;
      if (f.country && f.country !== 'any' && item.country !== f.country) return false;
      if (f.city && f.city !== 'any' && !(item.location || '').toLowerCase().includes(f.city.toLowerCase())) return false;
      if (f.powerRange?.[0] > 0 && item.engine_power && item.engine_power < f.powerRange[0] * 1.36) return false;
      if (f.powerRange?.[1] < 400 && item.engine_power && item.engine_power > f.powerRange[1] * 1.36) return false;
      if (f.color && f.color !== 'any' && item.color !== f.color) return false;
      if (f.transmission && f.transmission !== 'any' && item.transmission !== f.transmission) return false;
      if (f.condition && f.condition !== 'any' && item.condition !== f.condition) return false;
      if (f.subType && f.subType !== 'any' && typeField && item[typeField] !== f.subType) return false;
      // Extended filters
      if (extFilters.condition && (item.condition || '').toLowerCase() !== extFilters.condition.toLowerCase()) return false;
      if (extFilters.ownersCount && item.owners_count !== parseInt(extFilters.ownersCount)) return false;
      if (extFilters.colorInterior && (item.color_interior || '') !== extFilters.colorInterior) return false;
      if (extFilters.interiorMaterial && (item.interior_material || '') !== extFilters.interiorMaterial) return false;
      if (extFilters.doors) {
        const itemDoors = item.doors ? (item.doors >= 6 ? '6/7' : item.doors >= 4 ? '4/5' : '2/3') : '';
        if (itemDoors !== extFilters.doors) return false;
      }
      if (extFilters.seats && item.seats !== parseInt(extFilters.seats)) return false;
      if (extFilters.particulateFilter && !item.particulate_filter) return false;
      if (extFilters.warranty && !item.warranty) return false;
      if (extFilters.serviceBook && !item.service_book) return false;
      if (extFilters.vatDeductible && !item.vat_deductible) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'created_date') return new Date(a.created_date || 0) - new Date(b.created_date || 0);
      if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
      if (sortBy === '-price') return (b.price || 0) - (a.price || 0);
      if (sortBy === '-year') return (b.year || 0) - (a.year || 0);
      if (sortBy === 'year') return (a.year || 0) - (b.year || 0);
      if (sortBy === 'mileage') return (a.mileage || 0) - (b.mileage || 0);
      return new Date(b.created_date || 0) - new Date(a.created_date || 0);
    });
  }, [items, filters, extFilters, sortBy, typeField]);

  const titleKey = TITLE_KEYS[vehicleType] || 'home.vtype_car';
  const resetFilters = () => { setFilters({ priceRange: [0, 200000], powerRange: [0, 400] }); setExtFilters({ ...DEFAULT_EXTENDED }); setPage(1); };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'priceRange') return value[0] > 0 || value[1] < 200000;
    if (key === 'powerRange') return value[0] > 0 || value[1] < 400;
    return value && value !== '' && value !== 'any' && !(Array.isArray(value) && value.length === 0);
  }).length;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSaveSearch = async () => {
    const flat = { type: vehicleType };
    if (filters.brand && filters.brand !== 'any') flat.brand = filters.brand;
    if (filters.model && filters.model !== 'any') flat.model = filters.model;
    if (filters.fuelType && filters.fuelType !== 'any') flat.fuelType = filters.fuelType;
    if (filters.transmission && filters.transmission !== 'any') flat.transmission = filters.transmission;
    if (filters.country && filters.country !== 'any') flat.country = filters.country;
    if (filters.color && filters.color !== 'any') flat.color = filters.color;
    if (filters.condition) flat.condition = filters.condition;
    if (filters.subType && filters.subType !== 'any') flat.subType = filters.subType;
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
    await toggleSearch({ name, filters: flat });
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const landingFiltersProps = {
    filters,
    onFiltersChange: handleFiltersChange,
    onReset: resetFilters,
    vehicleType,
    resultsCount: filtered.length,
    brandOptions,
    modelOptions,
    subTypeOptions: subTypeOptions[vehicleType] || [],
    subTypeLabelKey: subTypePrefix[vehicleType],
    fuelOptions,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile filter sheet */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md p-0 overflow-y-auto">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between w-full">
              <SheetTitle>{t('catalog.filters')}</SheetTitle>
              <button type="button" onClick={handleSaveSearch} disabled={searchSavePending} aria-pressed={searchSaved} aria-label={t(searchSaved ? 'searchRef.removeSearch' : 'catalog.save_search')} className={`min-h-11 min-w-11 flex items-center justify-center p-1.5 rounded-lg transition-colors disabled:opacity-50 ${searchSaved ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-primary'}`} title={t(searchSaved ? 'searchRef.removeSearch' : 'catalog.save_search')}>
                {searchSavePending ? <Loader2 className="w-4 h-4 animate-spin" /> : searchSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
          </SheetHeader>
          <div className="p-4">
            <LandingFilters {...landingFiltersProps} />
          </div>
          <div className="p-3 border-t border-slate-200 dark:border-slate-700">
            <FilterActionButtons onSearch={() => setMobileFiltersOpen(false)} onReset={resetFilters} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <CatalogHeader
          title={t(titleKey)}
          count={filtered.length}
          countLabel={t('catalog.listings', 'объявлений')}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOptions={sortOptions}
          onShowFilters={() => setMobileFiltersOpen(true)}
          filterCount={activeFilterCount}
          breadcrumbLabel={t(titleKey)}
        />

        {/* Active filter badges */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.brand && filters.brand !== 'any' && (
              <Badge variant="secondary" className="gap-1">
                {filters.brand}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({ ...filters, brand: '' })} />
              </Badge>
            )}
            {filters.fuelType && filters.fuelType !== 'any' && (
              <Badge variant="secondary" className="gap-1">
                {t('fuel_types.' + filters.fuelType)}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({ ...filters, fuelType: '' })} />
              </Badge>
            )}
            {filters.subType && filters.subType !== 'any' && (
              <Badge variant="secondary" className="gap-1">
                {t(`${subTypePrefix[vehicleType]}.${filters.subType}`, filters.subType)}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({ ...filters, subType: '' })} />
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
              storageKey={`vehicle-${vehicleType}-filters`}
              headerExtra={
                <button type="button" onClick={handleSaveSearch} disabled={searchSavePending} aria-pressed={searchSaved} aria-label={t(searchSaved ? 'searchRef.removeSearch' : 'catalog.save_search')} className={`min-h-11 min-w-11 flex items-center justify-center p-1.5 rounded-lg transition-colors disabled:opacity-50 ${searchSaved ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-primary'}`} title={t(searchSaved ? 'searchRef.removeSearch' : 'catalog.save_search')}>
                  {searchSavePending ? <Loader2 className="w-4 h-4 animate-spin" /> : searchSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
              }
              footer={
                <FilterActionButtons onSearch={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onReset={resetFilters} />
              }
            >
              <LandingFilters {...landingFiltersProps} />
            </DraggableFilterPanel>
          </aside>

          {/* Listings */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SlidersHorizontal className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('catalog.not_found_title')}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">{t('catalog.not_found_desc')}</p>
                <Button onClick={resetFilters}>{t('catalog.reset_filters')}</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                  {pagedItems.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <CompactCarCard car={item} showLocation vehicleType={vehicleType} />
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