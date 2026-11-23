import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { KNOWN_MOTO_BRANDS, formatMotoBrand } from '@/utils/motoBrands';
import { translateCountry } from '@/utils/locationUtils';
import MiniSearchSelect from '@/components/search/MiniSearchSelect';
import { VEHICLE_BRAND_MODELS, getVehicleBrands, getVehicleModels } from '@/utils/vehicleBrandModels';

const years = Array.from({ length: 45 }, (_, i) => new Date().getFullYear() - i);

const fuelTypes = ['petrol', 'diesel', 'electric', 'hybrid', 'gas', 'petrol_cng', 'petrol_lng', 'diesel_cng', 'diesel_lng', 'lpg', 'cng', 'lng', 'hydrogen', 'ethanol'];

const colors = ['white', 'black', 'gray', 'silver', 'blue', 'red', 'green', 'brown', 'beige', 'gold', 'orange', 'yellow', 'purple'];
const countryList = ['Estonia', 'Latvia', 'Lithuania'];

// ---- Moto ----
const motoTypes = ['sport', 'naked', 'touring', 'cruiser', 'enduro', 'scooter', 'chopper', 'motocross', 'quad'];
const motoBrands = KNOWN_MOTO_BRANDS.map(b => ({ value: b, label: formatMotoBrand(b) }));
const motoFuels = ['petrol', 'electric'];

// ---- Bus ----
const busTypes = ['minibus', 'midi', 'full_size', 'double_decker', 'school', 'tourist'];
const busBrands = ['Mercedes-Benz', 'Volvo', 'MAN', 'Scania', 'Setra', 'Neoplan', 'Van Hool', 'Irizar', 'Temsa', 'Yutong', 'BYD', 'Iveco', 'Ford', 'Volkswagen', 'Sprinter', 'Other'];

// ---- Special Equipment ----
const equipmentTypes = ['excavator', 'bulldozer', 'crane', 'loader', 'tractor', 'harvester', 'forklift', 'compressor', 'generator', 'other'];
const equipmentBrands = ['Caterpillar', 'Komatsu', 'Volvo CE', 'Liebherr', 'Hitachi', 'JCB', 'Doosan', 'XCMG', 'Case', 'New Holland', 'John Deere', 'Claas', 'Fendt', 'Manitou', 'Linde', 'Toyota Material Handling', 'Other'];

// ---- Truck ----
const truckTypes = ['semi_truck', 'box_truck', 'flatbed', 'refrigerated', 'tanker', 'tipper', 'curtainsider', 'other'];
const truckBrands = ['Mercedes-Benz', 'Volvo', 'MAN', 'Scania', 'DAF', 'Iveco', 'Renault', 'Ford', 'Volkswagen', 'Actros', 'Freightliner', 'Kenworth', 'Other'];

// ---- Boat ----
const boatTypes = ['motorboat', 'sailboat', 'yacht', 'pontoon', 'speedboat', 'fishing', 'inflatable', 'catamaran', 'jet_ski', 'other'];
const boatBrands = ['Bayliner', 'Sea Ray', 'Boston Whaler', 'Beneteau', 'Jeanneau', 'Bavaria', 'Princess', 'Sunseeker', 'Azimut', 'Ferretti', 'Yamaha', 'Mercury', 'Zodiac', 'Other'];
const boatFuels = ['petrol', 'diesel', 'electric', 'sail'];

// ---- Motorhome ----
const motorhomeTypes = ['alcove', 'semi_integrated', 'integrated', 'van_conversion', 'campervan', 'fifth_wheel'];
const motorhomeBrands = ['Dethleffs', 'Eriba', 'Hymer', 'Knaus', 'LMC', 'Tabbert', 'Adria', 'Bürstner', 'Carado', 'Sunlight', 'Chausson', 'Pilote', 'Laika', 'Hobby', 'Other'];

// ---- Trailer ----
const trailerTypes = ['caravan', 'car_trailer', 'boat_trailer', 'flatbed_trailer', 'curtainsider', 'refrigerated', 'tanker', 'livestock', 'other'];
const trailerBrands = ['Knott', 'Humbaur', 'Böckmann', 'Eduard', 'Anssems', 'Brenderup', 'Henra', 'Unsinn', 'Other'];

const SelectField = ({ value, onChange, placeholder, options, tPrefix }) => {
  const { t } = useTranslation();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">{t('home.any', 'Любой')}</SelectItem>
        {options.map(opt =>
          typeof opt === 'string'
            ? <SelectItem key={opt} value={opt}>{tPrefix ? t(`${tPrefix}.${opt}`, opt) : opt}</SelectItem>
            : <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

const YearRange = ({ yearFrom, yearTo, setYearFrom, setYearTo }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-2">
      <Select value={yearFrom} onValueChange={setYearFrom}>
        <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
          <SelectValue placeholder={t('home.year_from')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">{t('home.any_year')}</SelectItem>
          {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={yearTo} onValueChange={setYearTo}>
        <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
          <SelectValue placeholder={t('home.year_to')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">{t('home.any_year')}</SelectItem>
          {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
};

const PriceRangeBlock = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [useSlider, setUseSlider] = useState(false);
  const range = value || [0, 200000];
  return (
    <div className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 pt-2.5 pb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('home.price_label', 'Цена')}</span>
        <button type="button" onClick={() => setUseSlider(!useSlider)} className="text-xs text-emerald-600 hover:text-emerald-700 underline">
          {useSlider ? t('home.enter_manually', 'Ввести вручную') : t('home.use_slider', 'Ползунок')}
        </button>
      </div>
      {useSlider ? (
        <>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mb-2">
            {range[0] > 0 ? `${new Intl.NumberFormat('ru-RU').format(range[0])} €` : '0'} — {range[1] < 200000 ? `${new Intl.NumberFormat('ru-RU').format(range[1])} €` : '200 000+ €'}
          </span>
          <Slider min={0} max={200000} step={1000} value={range} onValueChange={onChange} className="w-full" />
        </>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          <Input type="text" inputMode="numeric" min="0" placeholder={t('home.price_from', 'От')} value={range[0] || ''} onChange={(e) => onChange([Math.max(0, parseInt(e.target.value.replace(/\D/g, '')) || 0), range[1]])} className="h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-xs" />
          <Input type="text" inputMode="numeric" min="0" placeholder={t('home.price_to', 'До')} value={range[1] === 200000 ? '' : range[1]} onChange={(e) => onChange([range[0], Math.max(0, parseInt(e.target.value.replace(/\D/g, '')) || 200000)])} className="h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-xs" />
        </div>
      )}
    </div>
  );
};

const PowerRangeBlock = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [useSlider, setUseSlider] = useState(false);
  const range = value || [0, 400];
  return (
    <div className="bg-slate-100 dark:bg-slate-900 rounded-xl px-3 pt-2.5 pb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('home.power_label', 'Мощность')}</span>
        <button type="button" onClick={() => setUseSlider(!useSlider)} className="text-xs text-emerald-600 hover:text-emerald-700 underline">
          {useSlider ? t('home.enter_manually', 'Ввести вручную') : t('home.use_slider', 'Ползунок')}
        </button>
      </div>
      {useSlider ? (
        <>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mb-2">
            {range[0] > 0 ? `${range[0]} ${t('car.kw', 'кВт')}` : '0'} — {range[1] < 400 ? `${range[1]} ${t('car.kw', 'кВт')}` : `400+ ${t('car.kw', 'кВт')}`}
          </span>
          <Slider min={0} max={400} step={5} value={range} onValueChange={onChange} className="w-full" />
        </>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          <Input type="text" inputMode="numeric" min="0" placeholder={t('home.price_from', 'От')} value={range[0] || ''} onChange={(e) => onChange([Math.max(0, parseInt(e.target.value.replace(/\D/g, '')) || 0), range[1]])} className="h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-xs" />
          <Input type="text" inputMode="numeric" min="0" placeholder={t('home.price_to', 'До')} value={range[1] === 400 ? '' : range[1]} onChange={(e) => onChange([range[0], Math.max(0, parseInt(e.target.value.replace(/\D/g, '')) || 400)])} className="h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-xs" />
        </div>
      )}
    </div>
  );
};

const CountrySelect = ({ value, onChange }) => {
  const { t } = useTranslation();
  return (
    <Select value={value || 'any'} onValueChange={onChange}>
      <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
        <SelectValue placeholder={t('home.search_country')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">{t('home.search_country')}</SelectItem>
        {countryList.map(c => <SelectItem key={c} value={c}>{translateCountry(null, c)}</SelectItem>)}
      </SelectContent>
    </Select>
  );
};

const ColorSelect = ({ value, onChange }) => {
  const { t } = useTranslation();
  return (
    <Select value={value || 'any'} onValueChange={onChange}>
      <SelectTrigger className="h-9 bg-slate-100 dark:bg-slate-900 border-transparent text-slate-900 dark:text-white rounded-xl text-xs">
        <SelectValue placeholder={t('home.color')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">{t('home.color')}</SelectItem>
        {colors.map(c => <SelectItem key={c} value={t('colors.' + c)}>{t('colors.' + c)}</SelectItem>)}
      </SelectContent>
    </Select>
  );
};

// Brand + Model selects using static database — for vehicle types with VEHICLE_BRAND_MODELS
const BrandModelSelects = ({ vehicleType, filters, setFilters }) => {
  const { t } = useTranslation();
  const set = (key) => (val) => setFilters(prev => ({ ...prev, [key]: val }));
  const staticBrands = useMemo(() => getVehicleBrands(vehicleType), [vehicleType]);
  const dbModels = useMemo(() => {
    const brand = filters.brand && filters.brand !== 'any' ? filters.brand : '';
    return brand ? getVehicleModels(vehicleType, brand) : [];
  }, [vehicleType, filters.brand]);

  return (
    <>
      <MiniSearchSelect
        value={filters.brand || ''}
        onChange={(v) => { set('brand')(v); set('model')(''); }}
        options={staticBrands}
        placeholder={t('home.search_brand')}
        anyLabel={t('home.search_brand')}
      />
      <MiniSearchSelect
        value={filters.model || ''}
        onChange={set('model')}
        options={dbModels}
        placeholder={t('home.search_model')}
        anyLabel={t('home.search_model')}
      />
    </>
  );
};

export default function VehicleTypeFilters({ vehicleType, filters, setFilters }) {
  const { t } = useTranslation();

  const set = (key) => (val) => setFilters(prev => ({ ...prev, [key]: val }));
  const f = filters;

  // Fetch moto models from MotorcycleModelInfo when a brand is selected
  // Must be called before any conditional return (Rules of Hooks)
  const motoModelsQuery = useQuery({
    queryKey: ['motoModels', f.brand],
    queryFn: async () => {
      if (!f.brand) return [];
      const [asc, desc] = await Promise.all([
        entities.MotorcycleModelInfo.filter({ brand: f.brand }, 'model', 10000),
        entities.MotorcycleModelInfo.filter({ brand: f.brand }, '-model', 10000),
      ]);
      const all = [...asc, ...desc];
      return [...new Set(all.map(r => r.model).filter(Boolean))].sort();
    },
    enabled: vehicleType === 'moto' && !!f.brand,
    staleTime: 5 * 60 * 1000,
  });

  if (!vehicleType || vehicleType === 'car') return null;

  const motoModels = motoModelsQuery.data || [];
  const isTrailer = vehicleType === 'trailer';

  // Shared price + power + country + color block (identical to car/moto landing filters)
  const sharedRangeFilters = (
    <>
      <PriceRangeBlock value={f.priceRange} onChange={set('priceRange')} />
      {!isTrailer && <PowerRangeBlock value={f.powerRange} onChange={set('powerRange')} />}
      <CountrySelect value={f.country} onChange={set('country')} />
      <ColorSelect value={f.color} onChange={set('color')} />
    </>
  );

  if (vehicleType === 'moto') return (
    <div className="flex flex-col gap-2">
      <MiniSearchSelect
        value={f.brand || ''}
        onChange={(v) => { set('brand')(v); set('model')(''); }}
        options={motoBrands}
        placeholder={t('home.search_brand')}
        anyLabel={t('home.search_brand')}
      />
      <MiniSearchSelect
        value={f.model || ''}
        onChange={set('model')}
        options={motoModels}
        placeholder={t('home.search_model')}
        anyLabel={t('home.search_model')}
      />
      <SelectField value={f.moto_type || ''} onChange={set('moto_type')} placeholder={t('vehicle_filters.moto_type', 'Тип мотоцикла')} options={motoTypes} tPrefix="moto_types" />
      <SelectField value={f.fuel_type || ''} onChange={set('fuel_type')} placeholder={t('home.search_fuel')} options={motoFuels} tPrefix="fuel_types" />
      <YearRange yearFrom={f.year_from || ''} yearTo={f.year_to || ''} setYearFrom={set('year_from')} setYearTo={set('year_to')} />
    </div>
  );

  if (vehicleType === 'bus') return (
    <div className="flex flex-col gap-2">
      <BrandModelSelects vehicleType="bus" filters={f} setFilters={setFilters} />
      <SelectField value={f.bus_type || ''} onChange={set('bus_type')} placeholder={t('vehicle_filters.bus_type', 'Тип автобуса')} options={busTypes} tPrefix="bus_types" />
      <SelectField value={f.fuel_type || ''} onChange={set('fuel_type')} placeholder={t('home.search_fuel')} options={fuelTypes} tPrefix="fuel_types" />
      <YearRange yearFrom={f.year_from || ''} yearTo={f.year_to || ''} setYearFrom={set('year_from')} setYearTo={set('year_to')} />
      {sharedRangeFilters}
    </div>
  );

  if (vehicleType === 'special') return (
    <div className="flex flex-col gap-2">
      <BrandModelSelects vehicleType="special" filters={f} setFilters={setFilters} />
      <SelectField value={f.equipment_type || ''} onChange={set('equipment_type')} placeholder={t('vehicle_filters.equipment_type', 'Тип техники')} options={equipmentTypes} tPrefix="equipment_types" />
      <SelectField value={f.fuel_type || ''} onChange={set('fuel_type')} placeholder={t('home.search_fuel')} options={['diesel', 'petrol', 'electric', 'gas']} tPrefix="fuel_types" />
      <YearRange yearFrom={f.year_from || ''} yearTo={f.year_to || ''} setYearFrom={set('year_from')} setYearTo={set('year_to')} />
      {sharedRangeFilters}
    </div>
  );

  if (vehicleType === 'truck') return (
    <div className="flex flex-col gap-2">
      <BrandModelSelects vehicleType="truck" filters={f} setFilters={setFilters} />
      <SelectField value={f.truck_type || ''} onChange={set('truck_type')} placeholder={t('vehicle_filters.truck_type', 'Тип грузовика')} options={truckTypes} tPrefix="truck_types" />
      <SelectField value={f.fuel_type || ''} onChange={set('fuel_type')} placeholder={t('home.search_fuel')} options={fuelTypes} tPrefix="fuel_types" />
      <SelectField value={f.transmission || ''} onChange={set('transmission')} placeholder={t('home.transmission')} options={[{ value: 'manual', label: t('transmission_types.manual') }, { value: 'automatic', label: t('transmission_types.automatic') }]} />
      <YearRange yearFrom={f.year_from || ''} yearTo={f.year_to || ''} setYearFrom={set('year_from')} setYearTo={set('year_to')} />
      {sharedRangeFilters}
    </div>
  );

  if (vehicleType === 'boat') return (
    <div className="flex flex-col gap-2">
      <BrandModelSelects vehicleType="boat" filters={f} setFilters={setFilters} />
      <SelectField value={f.boat_type || ''} onChange={set('boat_type')} placeholder={t('vehicle_filters.boat_type', 'Тип лодки')} options={boatTypes} tPrefix="boat_types" />
      <SelectField value={f.fuel_type || ''} onChange={set('fuel_type')} placeholder={t('vehicle_filters.engine_type', 'Тип двигателя')} options={boatFuels} tPrefix="fuel_types" />
      <YearRange yearFrom={f.year_from || ''} yearTo={f.year_to || ''} setYearFrom={set('year_from')} setYearTo={set('year_to')} />
      {sharedRangeFilters}
    </div>
  );

  if (vehicleType === 'motorhome') return (
    <div className="flex flex-col gap-2">
      <BrandModelSelects vehicleType="motorhome" filters={f} setFilters={setFilters} />
      <SelectField value={f.motorhome_type || ''} onChange={set('motorhome_type')} placeholder={t('vehicle_filters.motorhome_type', 'Тип')} options={motorhomeTypes} tPrefix="motorhome_types" />
      <SelectField value={f.fuel_type || ''} onChange={set('fuel_type')} placeholder={t('home.search_fuel')} options={['diesel', 'petrol', 'electric', 'hybrid']} tPrefix="fuel_types" />
      <SelectField value={f.transmission || ''} onChange={set('transmission')} placeholder={t('home.transmission')} options={[{ value: 'manual', label: t('transmission_types.manual') }, { value: 'automatic', label: t('transmission_types.automatic') }]} />
      <YearRange yearFrom={f.year_from || ''} yearTo={f.year_to || ''} setYearFrom={set('year_from')} setYearTo={set('year_to')} />
      {sharedRangeFilters}
    </div>
  );

  if (vehicleType === 'trailer') return (
    <div className="flex flex-col gap-2">
      <BrandModelSelects vehicleType="trailer" filters={f} setFilters={setFilters} />
      <SelectField value={f.trailer_type || ''} onChange={set('trailer_type')} placeholder={t('vehicle_filters.trailer_type', 'Тип прицепа')} options={trailerTypes} tPrefix="trailer_types" />
      <YearRange yearFrom={f.year_from || ''} yearTo={f.year_to || ''} setYearFrom={set('year_from')} setYearTo={set('year_to')} />
      {sharedRangeFilters}
    </div>
  );

  return null;
}