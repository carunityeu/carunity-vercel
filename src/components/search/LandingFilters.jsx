import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';
import MiniSearchSelect from '@/components/search/MiniSearchSelect';
import VehicleTypeSelector from '@/components/search/VehicleTypeSelector';
import { getModelsForBrand, csvBrands } from '@/utils/carData';
import { generationsDB } from '@/components/search/GenerationPicker';
import { translateCountry, translateCity, CITIES_BY_COUNTRY } from '@/utils/locationUtils';
import { VEHICLE_BRAND_MODELS, getVehicleBrands, getVehicleModels } from '@/utils/vehicleBrandModels';

const allBrands = csvBrands;

const carBodyTypes = [
  { value: 'sedan' }, { value: 'suv' }, { value: 'hatchback' },
  { value: 'wagon' }, { value: 'coupe' }
];

const carFuelTypes = [
  { value: 'petrol' }, { value: 'diesel' }, { value: 'electric' }, { value: 'hybrid' },
  { value: 'plugin_hybrid' }, { value: 'gas' },
  { value: 'petrol_cng' }, { value: 'petrol_lng' }, { value: 'diesel_cng' }, { value: 'diesel_lng' },
  { value: 'lpg' }, { value: 'cng' }, { value: 'lng' }, { value: 'hydrogen' }, { value: 'ethanol' }
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

const countries = ['Estonia', 'Latvia', 'Lithuania'];

const colors = ['white', 'black', 'gray', 'silver', 'blue', 'red', 'green', 'brown', 'beige', 'gold', 'orange', 'yellow', 'purple'];

export default function LandingFilters({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  vehicleType = 'car',
  resultsCount = 0,
  modelCounts = {},
  brandOptions = [],
  modelOptions = [],
  subTypeOptions = [],
  subTypeLabelKey = '',
  fuelOptions = null,
  hideTypeSelector = false,
}) {
  const { t } = useTranslation();
  const [usePriceSlider, setUsePriceSlider] = useState(false);
  const [usePowerSlider, setUsePowerSlider] = useState(false);

  const isCar = vehicleType === 'car';
  const isTrailer = vehicleType === 'trailer';
  const isBoat = vehicleType === 'boat';
  const hidePower = isTrailer;
  const hideTransmission = isTrailer || isBoat;
  const hasStaticDB = !!VEHICLE_BRAND_MODELS[vehicleType];

  // Merged brand options: static DB + listing-derived
  const staticBrands = useMemo(() => hasStaticDB ? getVehicleBrands(vehicleType) : [], [hasStaticDB, vehicleType]);
  const mergedBrandOptions = useMemo(() => {
    if (!hasStaticDB) return brandOptions;
    return [...new Set([...staticBrands, ...brandOptions])].sort((a, b) => a.localeCompare(b));
  }, [hasStaticDB, staticBrands, brandOptions]);

  // Merged model options: static DB models for selected brand + listing-derived
  const mergedModelOptions = useMemo(() => {
    if (!hasStaticDB) return modelOptions;
    const selectedBrand = filters.brand && filters.brand !== 'any' ? filters.brand : '';
    const dbModels = selectedBrand ? getVehicleModels(vehicleType, selectedBrand) : [];
    return [...new Set([...dbModels, ...modelOptions])].sort((a, b) => a.localeCompare(b));
  }, [hasStaticDB, vehicleType, filters.brand, modelOptions]);

  const update = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // For cars: multi-brand add
  const handleBrandAdd = (v) => {
    if (v && v !== 'any') {
      const current = filters.brands || [];
      if (!current.includes(v)) {
        onFiltersChange({ ...filters, brands: [...current, v], brand: '', model: '' });
      } else {
        onFiltersChange({ ...filters, brand: '' });
      }
    } else {
      onFiltersChange({ ...filters, brand: '' });
    }
  };

  const handleBrandRemove = (b) => {
    const newBrands = (filters.brands || []).filter(x => x !== b);
    onFiltersChange({ ...filters, brands: newBrands, model: '' });
  };

  // Available models for car
  const availableModels = useMemo(() => {
    if (!isCar) return [];
    const brands = filters.brands?.length > 0 ? filters.brands : (filters.brand ? [filters.brand] : []);
    if (brands.length === 0) return [];
    const allModels = brands.flatMap(b => {
      const csvModels = getModelsForBrand(b);
      const genModels = Object.keys(generationsDB[b] || {});
      return [...csvModels, ...genModels];
    });
    return [...new Set(allModels)].sort((a, b) => a.localeCompare(b));
  }, [isCar, filters.brands, filters.brand]);

  const effectiveFuelOptions = fuelOptions || carFuelTypes;
  const priceRange = filters.priceRange || [0, 200000];
  const powerRange = filters.powerRange || [0, 400];

  const isPremium = filters.isPremium || false;
  const isPremiumActive = false;

  return (
    <div className="flex flex-col gap-2">
      {/* Vehicle type selector — like on landing page */}
      {!hideTypeSelector && <VehicleTypeSelector currentType={vehicleType} />}

      {/* Brand — multi-select for cars, dropdown for others */}
      {isCar ? (
        <>
          <MiniSearchSelect
            value={filters.brand || ''}
            onChange={handleBrandAdd}
            options={allBrands}
            placeholder={t('listing.brand')}
            anyLabel={t('listing.brand')}
          />
          {filters.brands?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.brands.map(b => (
                <span key={b} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800">
                  {b}
                  <button onClick={() => handleBrandRemove(b)} className="hover:opacity-70 ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </>
      ) : hasStaticDB ? (
        <MiniSearchSelect
          value={filters.brand || ''}
          onChange={(v) => onFiltersChange({ ...filters, brand: v, model: '' })}
          options={mergedBrandOptions}
          placeholder={t('listing.brand')}
          anyLabel={t('listing.brand')}
        />
      ) : (
        brandOptions.length > 0 && (
          <Select value={filters.brand || 'any'} onValueChange={(v) => update('brand', v)}>
            <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
              <SelectValue placeholder={t('listing.brand')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{t('listing.brand')}</SelectItem>
              {brandOptions.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        )
      )}

      {/* Model */}
      {isCar ? (
        <MiniSearchSelect
          value={filters.model || ''}
          onChange={(v) => update('model', v)}
          options={availableModels.map(m => ({ value: m, label: modelCounts[m] ? `${m} (${modelCounts[m]})` : m }))}
          placeholder={t('listing.model')}
          anyLabel={t('listing.model')}
        />
      ) : hasStaticDB ? (
        <MiniSearchSelect
          value={filters.model || ''}
          onChange={(v) => update('model', v)}
          options={mergedModelOptions}
          placeholder={t('home.search_model')}
          anyLabel={t('listing.model')}
        />
      ) : (
        modelOptions.length > 0 && (
          <Select value={filters.model || 'any'} onValueChange={(v) => update('model', v)}>
            <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
              <SelectValue placeholder={t('home.search_model')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{t('listing.model')}</SelectItem>
              {modelOptions.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        )
      )}

      {/* Sub-type for non-cars */}
      {!isCar && subTypeOptions.length > 0 && (
        <Select value={filters.subType || 'any'} onValueChange={(v) => update('subType', v)}>
          <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
            <SelectValue placeholder={t('vehicle_filters.type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t('vehicle_filters.type')}</SelectItem>
            {subTypeOptions.map(opt => (
              <SelectItem key={opt} value={opt}>{t(`${subTypeLabelKey}.${opt}`, opt)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Premium checkbox (non-cars only) */}
      {isPremiumActive && (
        <label className="flex items-center gap-2 cursor-pointer select-none py-0.5">
          <input type="checkbox" checked={isPremium} onChange={e => update('isPremium', e.target.checked)} className="w-4 h-4 rounded accent-emerald-500" />
          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Premium</span>
        </label>
      )}

      {/* Fuel type */}
      {effectiveFuelOptions.length > 0 && (
        <Select value={filters.fuelType || 'any'} onValueChange={(v) => update('fuelType', v)}>
          <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
            <SelectValue placeholder={t('home.search_fuel')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t('home.search_fuel')}</SelectItem>
            {effectiveFuelOptions.map(type => {
              const val = type.value || type;
              return <SelectItem key={val} value={val}>{t('fuel_types.' + val, val)}</SelectItem>;
            })}
          </SelectContent>
        </Select>
      )}

      {/* Body type (car only) */}
      {isCar && (
        <Select value={filters.bodyType || 'any'} onValueChange={(v) => update('bodyType', v)}>
          <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
            <SelectValue placeholder={t('home.search_body')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t('home.search_body')}</SelectItem>
            {carBodyTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>{t('body_types.' + type.value)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Year from/to */}
      <div className="grid grid-cols-2 gap-2">
        <Select value={filters.yearFrom || 'any'} onValueChange={(v) => update('yearFrom', v)}>
          <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
            <SelectValue placeholder={t('home.year_from')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t('home.year_label')}</SelectItem>
            {years.map(year => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.yearTo || 'any'} onValueChange={(v) => update('yearTo', v)}>
          <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
            <SelectValue placeholder={t('home.year_to')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t('home.year_label')}</SelectItem>
            {years.map(year => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Price range */}
      <div className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 pt-2.5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('home.price_label', 'Цена')}</span>
          <button type="button" onClick={() => setUsePriceSlider(!usePriceSlider)} className="text-xs text-emerald-600 hover:text-emerald-700 underline">
            {usePriceSlider ? t('home.enter_manually', 'Ввести вручную') : t('home.use_slider', 'Ползунок')}
          </button>
        </div>
        {usePriceSlider ? (
          <>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mb-2">
              {priceRange[0] > 0 ? `${new Intl.NumberFormat('ru-RU').format(priceRange[0])} €` : '0'} — {priceRange[1] < 200000 ? `${new Intl.NumberFormat('ru-RU').format(priceRange[1])} €` : '200 000+ €'}
            </span>
            <Slider min={0} max={200000} step={1000} value={priceRange} onValueChange={(v) => update('priceRange', v)} className="w-full" />
          </>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            <Input type="text" min="0" placeholder={t('home.price_from', 'От')} value={priceRange[0] || ''} onChange={(e) => update('priceRange', [Math.max(0, parseInt(e.target.value.replace(/\D/g, '')) || 0), priceRange[1]])} className="h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-xs" />
            <Input type="text" min="0" placeholder={t('home.price_to', 'До')} value={priceRange[1] === 200000 ? '' : priceRange[1]} onChange={(e) => update('priceRange', [priceRange[0], Math.max(0, parseInt(e.target.value.replace(/\D/g, '')) || 200000)])} className="h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-xs" />
          </div>
        )}
      </div>

      {/* Power range */}
      {!hidePower && (
      <div className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 pt-2.5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('home.power_label', 'Мощность')}</span>
          <button type="button" onClick={() => setUsePowerSlider(!usePowerSlider)} className="text-xs text-emerald-600 hover:text-emerald-700 underline">
            {usePowerSlider ? t('home.enter_manually', 'Ввести вручную') : t('home.use_slider', 'Ползунок')}
          </button>
        </div>
        {usePowerSlider ? (
          <>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mb-2">
              {powerRange[0] > 0 ? `${powerRange[0]} ${t('car.kw', 'кВт')}` : '0'} — {powerRange[1] < 400 ? `${powerRange[1]} ${t('car.kw', 'кВт')}` : `400+ ${t('car.kw', 'кВт')}`}
            </span>
            <Slider min={0} max={400} step={5} value={powerRange} onValueChange={(v) => update('powerRange', v)} className="w-full" />
          </>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            <Input type="text" min="0" placeholder={t('home.price_from', 'От')} value={powerRange[0] || ''} onChange={(e) => update('powerRange', [Math.max(0, parseInt(e.target.value.replace(/\D/g, '')) || 0), powerRange[1]])} className="h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-xs" />
            <Input type="text" min="0" placeholder={t('home.price_to', 'До')} value={powerRange[1] === 400 ? '' : powerRange[1]} onChange={(e) => update('powerRange', [powerRange[0], Math.max(0, parseInt(e.target.value.replace(/\D/g, '')) || 400)])} className="h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-xs" />
          </div>
        )}
      </div>
      )}

      {/* Country + City */}
      <div className="grid grid-cols-2 gap-2">
        <Select value={filters.country || 'any'} onValueChange={(v) => { const val = v === 'any' ? '' : v; onFiltersChange({ ...filters, country: val, city: '' }); }}>
          <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
            <SelectValue placeholder={t('home.search_country')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t('home.search_country')}</SelectItem>
            {countries.map(c => <SelectItem key={c} value={c}>{translateCountry(null, c)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select
          value={filters.city || 'any'}
          onValueChange={(v) => update('city', v === 'any' ? '' : v)}
          disabled={!filters.country || filters.country === 'any'}
        >
          <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
            <SelectValue placeholder={filters.country && filters.country !== 'any' ? t('home.search_city') : t('home.select_country_first')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t('home.any_city')}</SelectItem>
            {(CITIES_BY_COUNTRY[filters.country] || []).map(c => (
              <SelectItem key={c} value={c}>{translateCity(null, c)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Color */}
      <Select value={filters.color || 'any'} onValueChange={(v) => update('color', v)}>
        <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
          <SelectValue placeholder={t('home.color')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">{t('home.color')}</SelectItem>
          {colors.map(c => <SelectItem key={c} value={t('colors.' + c)}>{t('colors.' + c)}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* Drive type (car only) */}
      {isCar && (
        <Select value={filters.driveType || 'any'} onValueChange={(v) => update('driveType', v)}>
          <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
            <SelectValue placeholder={t('home.drive')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t('home.drive')}</SelectItem>
            <SelectItem value="fwd">{t('home.drive_fwd')}</SelectItem>
            <SelectItem value="rwd">{t('home.drive_rwd')}</SelectItem>
            <SelectItem value="awd">{t('home.drive_awd')}</SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* Transmission */}
      {!hideTransmission && (
      <Select value={filters.transmission || 'any'} onValueChange={(v) => update('transmission', v)}>
        <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
          <SelectValue placeholder={t('home.transmission', 'КПП')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">{t('home.transmission', 'КПП')}</SelectItem>
          <SelectItem value="automatic">{t('transmission_types.automatic', 'Автомат')}</SelectItem>
          <SelectItem value="manual">{t('transmission_types.manual', 'Механика')}</SelectItem>
        </SelectContent>
      </Select>
      )}

    </div>
  );
}