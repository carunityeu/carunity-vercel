import React, { useState, useEffect } from 'react';
import BrandSearchSelect from './BrandSearchSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getModelsForBrand, csvBrands } from '@/utils/carData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, RotateCcw, X } from 'lucide-react';
import GenerationPicker, { generationsDB } from './GenerationPicker';
import FeaturesFilter from './FeaturesFilter';
import { useTranslation } from 'react-i18next';
import { translateCountry, translateCity, CITIES_BY_COUNTRY } from '@/utils/locationUtils';

const carBrands = csvBrands;

const currentYear = new Date().getFullYear();

const countries = [
  'Estonia', 'Latvia', 'Lithuania', 'Finland', 'Sweden',
  'Germany', 'Netherlands', 'Belgium', 'France', 'Italy', 'Spain',
  'Austria', 'Switzerland', 'Denmark', 'Norway', 'Czech Republic',
  'United Kingdom', 'Poland', 'Portugal', 'Greece', 'Ireland',
  'Hungary', 'Slovakia', 'Slovenia', 'Croatia', 'Serbia',
  'Romania', 'Bulgaria',
];



export default function SearchFilters({ 
  filters, 
  onFiltersChange, 
  onSearch, 
  compact = false,
  showResults = true,
  resultsCount = 0,
  modelCounts = {}
}) {
  const { t } = useTranslation();
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const fuelTypes = [
    { value: 'petrol', label: t('fuel_types.petrol') },
    { value: 'diesel', label: t('fuel_types.diesel') },
    { value: 'electric', label: t('fuel_types.electric') },
    { value: 'hybrid', label: t('fuel_types.hybrid') },
    { value: 'plugin_hybrid', label: t('fuel_types.plugin_hybrid') },
    { value: 'gas', label: t('fuel_types.gas') }
  ];

  const bodyTypes = [
    { value: 'sedan', label: t('body_types.sedan') },
    { value: 'hatchback', label: t('body_types.hatchback') },
    { value: 'suv', label: t('body_types.suv') },
    { value: 'crossover', label: t('body_types.crossover') },
    { value: 'wagon', label: t('body_types.wagon') },
    { value: 'coupe', label: t('body_types.coupe') },
    { value: 'convertible', label: t('body_types.convertible') },
    { value: 'minivan', label: t('body_types.minivan') },
    { value: 'pickup', label: t('body_types.pickup') }
  ];

  const transmissionTypes = [
    { value: 'manual', label: t('transmission_types.manual') },
    { value: 'automatic', label: t('transmission_types.automatic') }
  ];

  const driveTypes = [
    { value: 'fwd', label: t('drive_types.fwd') },
    { value: 'rwd', label: t('drive_types.rwd') },
    { value: 'awd', label: t('drive_types.awd') }
  ];

  useEffect(() => {
    let count = 0;
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'any' && 
          !(Array.isArray(value) && value.length === 0)) {
        count++;
      }
    });
    setActiveFiltersCount(count);
  }, [localFilters]);

  const updateFilter = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    if (key === 'brand') { newFilters.model = ''; newFilters.generations = []; }
    if (key === 'model') { newFilters.generations = []; }
    setLocalFilters(newFilters);
    if (onFiltersChange) onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setLocalFilters({});
    if (onFiltersChange) onFiltersChange({});
  };

  const handleSearch = () => {
    if (onSearch) onSearch(localFilters);
  };

  const availableModels = localFilters.brand
    ? (() => {
        const csvModels = getModelsForBrand(localFilters.brand);
        const genModels = Object.keys(generationsDB[localFilters.brand] || {});
        const all = [...new Set([...csvModels, ...genModels])].sort((a, b) => a.localeCompare(b));
        return all;
      })()
    : [];

  if (compact) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
          <BrandSearchSelect
            value={localFilters.brand || ''}
            onChange={(v) => updateFilter('brand', v)}
            brands={carBrands}
            placeholder={t('home.search_brand')}
          />

          <Select value={localFilters.model || ''} onValueChange={(v) => updateFilter('model', v)} disabled={availableModels.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder={availableModels.length > 0 ? t('home.search_model') : t('filters.select_brand_first')} />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              <SelectItem value="any">{t('filters.any_model')}</SelectItem>
              {availableModels.map(model => (
                <SelectItem key={model} value={model}>
                  {model}{modelCounts[model] ? ` (${modelCounts[model]})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Input placeholder={t('luxury.price_eur') + ' ' + t('luxury.from')} type="number" value={localFilters.priceFrom || ''} onChange={(e) => updateFilter('priceFrom', e.target.value)} className="w-full font-sans" />
            <Input placeholder={t('luxury.to')} type="number" value={localFilters.priceTo || ''} onChange={(e) => updateFilter('priceTo', e.target.value)} className="w-full font-sans" />
          </div>

          <div className="flex gap-2">
            <Input placeholder={t('filters.year_from')} type="number" min="1970" max={currentYear} value={localFilters.yearFrom || ''} onChange={(e) => updateFilter('yearFrom', e.target.value)} className="font-sans" />
            <Input placeholder={t('luxury.to')} type="number" min="1970" max={currentYear} value={localFilters.yearTo || ''} onChange={(e) => updateFilter('yearTo', e.target.value)} className="font-sans" />
          </div>

          <Select value={localFilters.fuelType || ''} onValueChange={(v) => updateFilter('fuelType', v)}>
            <SelectTrigger><SelectValue placeholder={t('home.search_fuel')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{t('home.any_fuel')}</SelectItem>
              {fuelTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleSearch} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
            <Search className="w-4 h-4" />
            {showResults && resultsCount > 0 ? `${t('filters.show')} ${resultsCount}` : t('home.search_button')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base text-slate-900 dark:text-white">{t('catalog.filters')}</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">{activeFiltersCount}</Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs sm:text-sm text-slate-500 hover:text-slate-700 gap-1 h-8 sm:h-9 px-2">
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{t('catalog.reset_all')}</span>
          </Button>
        )}
      </div>

      <div className="p-3 sm:p-4 space-y-4 sm:space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto">
        {/* Brand */}
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('home.search_brand')}
            {localFilters.brands?.length > 0 && (
              <Badge className="ml-2 bg-emerald-100 text-emerald-700 text-xs">{localFilters.brands.length}</Badge>
            )}
          </Label>
          <BrandSearchSelect
            value={localFilters.brand || ''}
            onChange={(v) => {
              const newFilters = { ...localFilters, brand: v, model: '', generations: [] };
              if (v && v !== 'any') {
                const current = localFilters.brands || [];
                if (!current.includes(v)) {
                  newFilters.brands = [...current, v];
                }
              }
              setLocalFilters(newFilters);
              if (onFiltersChange) onFiltersChange(newFilters);
            }}
            brands={carBrands}
            placeholder={t('filters.select_brand')}
          />
          {localFilters.brands?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {localFilters.brands.map(b => (
                <Badge key={b} className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 gap-1 pl-2 pr-1 text-xs">
                  {b}
                  <button
                    onClick={() => {
                      const newBrands = (localFilters.brands || []).filter(x => x !== b);
                      const newBrand = newBrands.length === 1 ? newBrands[0] : (newBrands.length === 0 ? '' : localFilters.brand);
                      const newFilters = { ...localFilters, brands: newBrands, brand: newBrand };
                      setLocalFilters(newFilters);
                      if (onFiltersChange) onFiltersChange(newFilters);
                    }}
                    className="ml-0.5 hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <button
                onClick={() => {
                  const newFilters = { ...localFilters, brands: [], brand: '', model: '', generations: [] };
                  setLocalFilters(newFilters);
                  if (onFiltersChange) onFiltersChange(newFilters);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {t('catalog.reset_all', 'Сбросить')}
              </button>
            </div>
          )}
        </div>

        {/* Model */}
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">{t('home.search_model')}</Label>
          {availableModels.length > 0 ? (
            <Select value={localFilters.model || ''} onValueChange={(v) => updateFilter('model', v)}>
              <SelectTrigger>
                <SelectValue placeholder={t('filters.select_model')} />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="any">{t('filters.any_model')}</SelectItem>
                {availableModels.map(model => (
                  <SelectItem key={model} value={model}>
                    <span className="flex w-full items-center justify-between gap-4 min-w-[200px]">
                      <span>{model}</span>
                      {modelCounts[model] ? <span className="text-emerald-500 ml-auto">({modelCounts[model]})</span> : <span className="ml-auto text-transparent">(-)</span>}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              placeholder={t('home.search_model')}
              value={localFilters.model || ''}
              onChange={(e) => updateFilter('model', e.target.value)}
            />
          )}
        </div>

        {/* Generations */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('filters.generation')}
            {localFilters.generations?.length > 0 && (
              <Badge className="ml-2 bg-emerald-100 text-emerald-700 text-xs">{localFilters.generations.length}</Badge>
            )}
          </Label>
          <GenerationPicker
            brand={localFilters.brand}
            model={localFilters.model}
            selected={localFilters.generations || []}
            onChange={(gens) => updateFilter('generations', gens)}
          />
        </div>

        {/* Price */}
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">{t('luxury.price_eur')}</Label>
          <div className="flex gap-2 sm:gap-3">
            <Input placeholder={t('luxury.from')} type="number" value={localFilters.priceFrom || ''} onChange={(e) => updateFilter('priceFrom', e.target.value)} className="font-sans" />
            <Input placeholder={t('luxury.to')} type="number" value={localFilters.priceTo || ''} onChange={(e) => updateFilter('priceTo', e.target.value)} className="font-sans" />
          </div>
        </div>

        {/* Year */}
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">{t('car.spec_year')}</Label>
          <div className="flex gap-2 sm:gap-3">
            <Input placeholder={t('luxury.from')} type="number" min="1970" max={currentYear} value={localFilters.yearFrom || ''} onChange={(e) => updateFilter('yearFrom', e.target.value)} className="font-sans" />
            <Input placeholder={t('luxury.to')} type="number" min="1970" max={currentYear} value={localFilters.yearTo || ''} onChange={(e) => updateFilter('yearTo', e.target.value)} className="font-sans" />
          </div>
        </div>

        {/* Mileage */}
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">{t('luxury.mileage_km')}</Label>
          <div className="flex gap-2 sm:gap-3">
            <Input placeholder={t('luxury.from')} type="number" value={localFilters.mileageFrom || ''} onChange={(e) => updateFilter('mileageFrom', e.target.value)} className="font-sans" />
            <Input placeholder={t('luxury.to')} type="number" value={localFilters.mileageTo || ''} onChange={(e) => updateFilter('mileageTo', e.target.value)} className="font-sans" />
          </div>
        </div>

        <Accordion type="multiple" className="w-full">
          <AccordionItem value="fuel">
            <AccordionTrigger className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 py-2 sm:py-3 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 -mx-2 rounded">{t('filters.fuel_type')}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2.5 pt-2 pl-2">
                {fuelTypes.map(type => (
                  <div key={type.value} className="flex items-center space-x-2.5">
                    <Checkbox id={`fuel-${type.value}`} checked={localFilters.fuelTypes?.includes(type.value)}
                      onCheckedChange={(checked) => {
                        const current = localFilters.fuelTypes || [];
                        updateFilter('fuelTypes', checked ? [...current, type.value] : current.filter(v => v !== type.value));
                      }} className="h-5 w-5" />
                    <label htmlFor={`fuel-${type.value}`} className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 cursor-pointer">{type.label}</label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="body">
            <AccordionTrigger className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 py-2 sm:py-3 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 -mx-2 rounded">{t('filters.body_type')}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2.5 pt-2 pl-2">
                {bodyTypes.map(type => (
                  <div key={type.value} className="flex items-center space-x-2.5">
                    <Checkbox id={`body-${type.value}`} checked={localFilters.bodyTypes?.includes(type.value)}
                      onCheckedChange={(checked) => {
                        const current = localFilters.bodyTypes || [];
                        updateFilter('bodyTypes', checked ? [...current, type.value] : current.filter(v => v !== type.value));
                      }} className="h-5 w-5" />
                    <label htmlFor={`body-${type.value}`} className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 cursor-pointer">{type.label}</label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="transmission">
            <AccordionTrigger className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 py-2 sm:py-3 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 -mx-2 rounded">{t('filters.transmission')}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2.5 pt-2 pl-2">
                {transmissionTypes.map(type => (
                  <div key={type.value} className="flex items-center space-x-2.5">
                    <Checkbox id={`trans-${type.value}`} checked={localFilters.transmissions?.includes(type.value)}
                      onCheckedChange={(checked) => {
                        const current = localFilters.transmissions || [];
                        updateFilter('transmissions', checked ? [...current, type.value] : current.filter(v => v !== type.value));
                      }} className="h-5 w-5" />
                    <label htmlFor={`trans-${type.value}`} className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 cursor-pointer">{type.label}</label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="drive">
            <AccordionTrigger className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 py-2 sm:py-3 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 -mx-2 rounded">{t('filters.drive')}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2.5 pt-2 pl-2">
                {driveTypes.map(type => (
                  <div key={type.value} className="flex items-center space-x-2.5">
                    <Checkbox id={`drive-${type.value}`} checked={localFilters.driveTypes?.includes(type.value)}
                      onCheckedChange={(checked) => {
                        const current = localFilters.driveTypes || [];
                        updateFilter('driveTypes', checked ? [...current, type.value] : current.filter(v => v !== type.value));
                      }} className="h-5 w-5" />
                    <label htmlFor={`drive-${type.value}`} className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 cursor-pointer">{type.label}</label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="location">
            <AccordionTrigger className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 py-2 sm:py-3 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 -mx-2 rounded">{t('filters.location')}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                <Select value={localFilters.country || 'any'} onValueChange={(v) => { const val = v === 'any' ? '' : v; const newFilters = { ...localFilters, country: val, city: '' }; setLocalFilters(newFilters); if (onFiltersChange) onFiltersChange(newFilters); }}>
                  <SelectTrigger><SelectValue placeholder={t('home.search_country')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{t('home.any_country')}</SelectItem>
                    {countries.map(c => <SelectItem key={c} value={c}>{translateCountry(null, c)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select
                  value={localFilters.city || 'any'}
                  onValueChange={(v) => updateFilter('city', v === 'any' ? '' : v)}
                  disabled={!localFilters.country}
                >
                  <SelectTrigger><SelectValue placeholder={localFilters.country ? t('home.search_city') : t('home.select_country_first')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{t('home.any_city')}</SelectItem>
                    {(CITIES_BY_COUNTRY[localFilters.country] || []).map(c => (
                      <SelectItem key={c} value={c}>{translateCity(null, c)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="seller">
            <AccordionTrigger className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 py-2 sm:py-3 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 -mx-2 rounded">{t('filters.seller')}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2.5 pt-2 pl-2">
                {[{ value: 'private', label: t('car.private') }, { value: 'dealer', label: t('car.dealer') }].map(({ value, label }) => (
                  <div key={value} className="flex items-center space-x-2.5">
                    <Checkbox id={`seller-${value}`} checked={localFilters.sellerTypes?.includes(value)}
                      onCheckedChange={(checked) => {
                        const current = localFilters.sellerTypes || [];
                        updateFilter('sellerTypes', checked ? [...current, value] : current.filter(v => v !== value));
                      }} className="h-5 w-5" />
                    <label htmlFor={`seller-${value}`} className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 cursor-pointer">{label}</label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="features">
            <AccordionTrigger className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 py-2 sm:py-3 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 -mx-2 rounded">
              <span className="flex items-center gap-2">
                {t('filters.features', 'Оснащение')}
                {(localFilters.features?.length > 0) && (
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs">{localFilters.features.length}</Badge>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <FeaturesFilter
                selected={localFilters.features || []}
                onChange={(val) => updateFilter('features', val)}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button onClick={handleSearch} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-2 h-10 sm:h-12 text-sm sm:text-base mt-2">
          <Search className="w-4 h-4" />
          {showResults && resultsCount > 0 ? `${t('filters.show')} ${resultsCount}` : t('home.search_button')}
        </Button>
      </div>
    </div>
  );
}