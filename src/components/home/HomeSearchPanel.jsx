import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { entities } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { BRANDS } from '@/utils/brandList';
import { getModelsForBrand } from '@/utils/carData';
import { translateCountry, translateCity, CITIES_BY_COUNTRY } from '@/utils/locationUtils';
import { generationsDB } from '@/components/search/GenerationPicker';
import MiniSearchSelect from '@/components/search/MiniSearchSelect';
import VehicleTypeFilters from '@/components/search/VehicleTypeFilters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Panel, fieldClass } from '@/components/ds';

const ICON_BASE = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/';
const VEHICLE_TYPES = [
  { key: 'car', labelKey: 'home.vtype_car', img: '3ed0c0079_sedaniconcu.png' },
  { key: 'moto', labelKey: 'home.vtype_moto', img: 'f0312e09d_motocycleiconcu.png' },
  { key: 'bus', labelKey: 'home.vtype_bus', img: '25ce6f6a7_busiconcu.png' },
  { key: 'special', labelKey: 'home.vtype_special', img: 'a935d278f_traktoriconcu.png' },
  { key: 'truck', labelKey: 'home.vtype_truck', img: '122985056_truckiconcu.png' },
  { key: 'boat', labelKey: 'home.vtype_boat', img: '3d51d9a96_boaticoncu.png' },
  { key: 'motorhome', labelKey: 'home.vtype_motorhome', img: 'c42e06342_housetrailericoncu.png' },
  { key: 'trailer', labelKey: 'home.vtype_trailer', img: 'd68253701_trailericoncu.png' },
];
const BODY_TYPES = ['sedan', 'suv', 'hatchback', 'wagon', 'coupe'];
const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid', 'plugin_hybrid', 'gas', 'petrol_cng', 'petrol_lng', 'diesel_cng', 'diesel_lng', 'lpg', 'cng', 'lng', 'hydrogen', 'ethanol'];
const COLORS = ['white', 'black', 'gray', 'silver', 'blue', 'red', 'green', 'brown', 'beige', 'gold', 'orange', 'yellow', 'purple'];
const YEARS = Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => String(new Date().getFullYear() - i));
const KW_TO_HP = 1.36; // power is entered in kW, the catalog filters by hp

const EMPTY = {
  vehicleType: '', brands: [], model: '', fuelType: '', bodyType: '',
  yearFrom: '', yearTo: '', useGenerations: false, generations: [],
  priceFrom: '', priceTo: '', powerFrom: '', powerTo: '',
  country: '', city: '', color: '', driveType: '', transmission: '',
  vehicleFilters: {},
};

const isSet = (v) => v !== '' && v !== 'any' && v != null;
const digits = (v) => v.replace(/\D/g, '');

// Turns the form into the catalog URL. Kept free of React so the mapping is easy to read.
function buildSearchUrl(f, generations) {
  const params = new URLSearchParams();
  const put = (key, value) => { if (isSet(value)) params.set(key, String(value)); };
  const putPower = () => {
    if (f.powerFrom) params.set('powerFrom', String(Math.round(Number(f.powerFrom) * KW_TO_HP)));
    if (f.powerTo) params.set('powerTo', String(Math.round(Number(f.powerTo) * KW_TO_HP)));
  };

  if (f.vehicleType && f.vehicleType !== 'car') {
    params.set('type', f.vehicleType);
    for (const [k, v] of Object.entries(f.vehicleFilters)) {
      if (!isSet(v)) continue;
      if (k === 'priceRange' || k === 'powerRange') {
        const [lo, hi] = v; const max = k === 'priceRange' ? 200000 : 400; const scale = k === 'powerRange' ? KW_TO_HP : 1;
        const base = k === 'priceRange' ? 'price' : 'power';
        if (lo > 0) params.set(`${base}From`, String(Math.round(lo * scale)));
        if (hi < max) params.set(`${base}To`, String(Math.round(hi * scale)));
      } else params.set(k, v);
    }
    if (f.vehicleType === 'moto') {
      put('priceFrom', f.priceFrom); put('priceTo', f.priceTo); putPower();
      put('country', f.country); put('color', f.color); put('transmission', f.transmission);
    }
    return `${createPageUrl('VehicleCatalog')}?${params}`;
  }

  if (f.brands.length > 1) params.set('brands', f.brands.join(','));
  else put('brand', f.brands[0]);
  put('model', f.model); put('bodyType', f.bodyType); put('fuelType', f.fuelType);
  if (f.useGenerations && f.generations.length) {
    const years = generations.filter((g) => f.generations.includes(g.code))
      .flatMap((g) => g.years.split('–').map((s) => s.trim()).filter((p) => /^\d{4}$/.test(p)).map(Number));
    if (years.length) { params.set('yearFrom', String(Math.min(...years))); params.set('yearTo', String(Math.max(...years))); }
  } else { put('yearFrom', f.yearFrom); put('yearTo', f.yearTo); }
  put('priceFrom', f.priceFrom); put('priceTo', f.priceTo); putPower();
  put('color', f.color); put('transmission', f.transmission); put('driveType', f.driveType);
  put('country', f.country); put('city', f.city);
  const query = params.toString();
  return createPageUrl('Catalog') + (query ? `?${query}` : '');
}

function SelectField({ value, onChange, placeholder, anyLabel, options, disabled }) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={fieldClass}><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="any">{anyLabel}</SelectItem>
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

/** A labelled cell of the search grid; `action` sits on the right of the label. */
function Field({ label, action, className, children }) {
  return (
    <div className={className}>
      <div className="mb-1 flex h-5 items-center justify-between gap-2">
        <span className="text-xs font-medium text-ink-3">{label}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

function RangeField({ label, from, to, onFrom, onTo, className }) {
  const { t } = useTranslation();
  return (
    <Field label={label} className={className}>
      <div className="grid grid-cols-2 gap-2">
        <Input inputMode="numeric" placeholder={t('home.price_from', 'От')} value={from} onChange={(e) => onFrom(digits(e.target.value))} className={fieldClass} />
        <Input inputMode="numeric" placeholder={t('home.price_to', 'До')} value={to} onChange={(e) => onTo(digits(e.target.value))} className={fieldClass} />
      </div>
    </Field>
  );
}

export default function HomeSearchPanel({ className }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [f, setForm] = useState(EMPTY);
  const [moreTypes, setMoreTypes] = useState(false);
  // Phones show the main filters only; the rest opens with "All filters" (always shown from lg)
  const [allFilters, setAllFilters] = useState(false);
  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const isCar = !f.vehicleType || f.vehicleType === 'car';
  const hasBasics = isCar || f.vehicleType === 'moto';
  const oneBrand = f.brands.length === 1 ? f.brands[0] : null;
  const generations = (oneBrand && f.model && generationsDB[oneBrand]?.[f.model]) || [];

  const models = useMemo(() => [...new Set(f.brands.flatMap((b) => [...getModelsForBrand(b), ...Object.keys(generationsDB[b] || {})]))]
    .sort((a, b) => a.localeCompare(b)), [f.brands]);

  // Listings per model of the chosen brands, shown next to the model names
  const { data: modelCounts = {} } = useQuery({
    queryKey: ['homeModelCounts', f.brands],
    queryFn: async () => {
      const { rows } = await entities.Car.aggregate({ query: { status: 'active', brand: { $in: f.brands } }, groupBy: 'model' });
      return Object.fromEntries(rows.map((r) => [r.model, r.count]));
    },
    enabled: f.brands.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  const more = allFilters ? '' : 'max-lg:hidden';
  const vehicleButton = ({ key, labelKey, img }) => (
    <button
      key={key}
      type="button"
      title={t(labelKey)}
      aria-pressed={f.vehicleType === key}
      onClick={() => set({ vehicleType: f.vehicleType === key ? '' : key })}
      className={cn('flex h-9 flex-1 items-center justify-center rounded-lg transition-colors',
        f.vehicleType === key ? 'bg-surface ring-1 ring-brand' : 'hover:bg-surface/60')}>
      <img src={ICON_BASE + img} alt={t(labelKey)} className="h-5 w-8 object-contain mix-blend-screen" />
    </button>
  );

  const grid = 'grid grid-cols-1 gap-x-3 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-4';
  const yearCell = (
    <Field
      label={generations.length > 0 && f.useGenerations ? t('home.generation_label') : t('home.year_label', 'Год')}
      action={generations.length > 0 && (
        <button type="button" onClick={() => set({ useGenerations: !f.useGenerations, generations: [], yearFrom: '', yearTo: '' })} className="text-xs text-brand-text hover:underline">
          {f.useGenerations ? t('home.by_year') : t('home.by_generation')}
        </button>
      )}
      className={more}>
      {f.useGenerations && generations.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {generations.map((g) => {
            const on = f.generations.includes(g.code);
            return (
              <button key={g.code} type="button" aria-pressed={on}
                onClick={() => set({ generations: on ? f.generations.filter((c) => c !== g.code) : [...f.generations, g.code] })}
                className={cn('h-8 rounded-lg px-2.5 text-xs font-medium transition-colors', on ? 'bg-brand text-white' : 'bg-raised text-ink-2 hover:text-ink')}>
                {g.code} <span className="opacity-60">({g.years})</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <SelectField value={f.yearFrom} onChange={(v) => set({ yearFrom: v })} placeholder={t('home.price_from', 'От')} anyLabel={t('home.any_year')} options={YEARS.map((y) => ({ value: y, label: y }))} />
          <SelectField value={f.yearTo} onChange={(v) => set({ yearTo: v })} placeholder={t('home.price_to', 'До')} anyLabel={t('home.any_year')} options={YEARS.map((y) => ({ value: y, label: y }))} />
        </div>
      )}
    </Field>
  );

  return (
    <Panel as="div" className={cn('shadow-xl shadow-black/30', className)} bodyClassName="flex flex-col gap-3 p-3 sm:p-4 lg:p-5">
      {/* Vehicle type */}
      <div className="rounded-xl bg-raised p-1 lg:max-w-md">
        <div className="flex gap-1">
          {VEHICLE_TYPES.slice(0, 4).map(vehicleButton)}
          <button type="button" aria-label={t('home.more_types', 'Ещё')} aria-expanded={moreTypes} onClick={() => setMoreTypes((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 hover:bg-surface/60">
            <ChevronDown className={cn('h-4 w-4 transition-transform', moreTypes && 'rotate-180')} />
          </button>
        </div>
        {moreTypes && <div className="mt-1 flex gap-1 pr-10">{VEHICLE_TYPES.slice(4).map(vehicleButton)}</div>}
      </div>

      {!isCar && (
        <VehicleTypeFilters vehicleType={f.vehicleType} filters={f.vehicleFilters} setFilters={(fn) => setForm((prev) => ({ ...prev, vehicleFilters: typeof fn === 'function' ? fn(prev.vehicleFilters) : fn }))} />
      )}

      {isCar && f.brands.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {f.brands.map((b) => (
            <span key={b} className="inline-flex h-7 items-center gap-1 rounded-lg bg-brand/15 px-2 text-xs font-medium text-brand-text">
              {b}
              <button type="button" aria-label={`× ${b}`} onClick={() => set({ brands: f.brands.filter((x) => x !== b), model: '', generations: [] })}><X className="h-3 w-3" /></button>
            </span>
          ))}
          {f.brands.length > 1 && (
            <button type="button" onClick={() => set({ brands: [], model: '', generations: [] })} className="px-1 text-xs text-ink-3 hover:text-ink">
              {t('catalog.reset_all', 'Сбросить')}
            </button>
          )}
        </div>
      )}

      {hasBasics && (
        <div className={grid}>
          {isCar && (
            <>
              <Field label={t('home.search_brand', 'Марка')}>
                <MiniSearchSelect
                  value=""
                  onChange={(b) => b && b !== 'any' && set({ brands: f.brands.includes(b) ? f.brands : [...f.brands, b], model: '', generations: [] })}
                  options={BRANDS}
                  placeholder={f.brands.length ? t('home.add_brand', '+ ещё марка') : t('home.brand_any_label')}
                  anyLabel={t('common.any_brand')} />
              </Field>
              <Field label={t('home.search_model', 'Модель')}>
                <MiniSearchSelect
                  value={f.model}
                  onChange={(m) => set({ model: m, generations: [], useGenerations: false })}
                  options={models.map((m) => ({ value: m, label: modelCounts[m] ? `${m} (${modelCounts[m]})` : m }))}
                  placeholder={t('home.model_any_label')}
                  anyLabel={t('common.any_model')} />
              </Field>
              {yearCell}
            </>
          )}
          <RangeField label={`${t('home.price_label', 'Цена')}, €`} from={f.priceFrom} to={f.priceTo} onFrom={(v) => set({ priceFrom: v })} onTo={(v) => set({ priceTo: v })} />

          {isCar && (
            <>
              <Field label={t('home.search_fuel', 'Топливо')} className={more}>
                <SelectField value={f.fuelType} onChange={(v) => set({ fuelType: v })} placeholder={t('home.any_fuel')} anyLabel={t('home.any_fuel')}
                  options={FUEL_TYPES.map((v) => ({ value: v, label: t('fuel_types.' + v) }))} />
              </Field>
              <Field label={t('home.search_body', 'Тип кузова')} className={more}>
                <SelectField value={f.bodyType} onChange={(v) => set({ bodyType: v })} placeholder={t('home.any_body')} anyLabel={t('home.any_body')}
                  options={BODY_TYPES.map((v) => ({ value: v, label: t('body_types.' + v) }))} />
              </Field>
            </>
          )}
          <RangeField className={more} label={`${t('home.power_label', 'Мощность')}, ${t('car.kw', 'кВт')}`} from={f.powerFrom} to={f.powerTo} onFrom={(v) => set({ powerFrom: v })} onTo={(v) => set({ powerTo: v })} />
          <Field label={t('home.search_country', 'Страна')} className={more}>
            <div className="grid grid-cols-2 gap-2">
              <SelectField value={f.country} onChange={(v) => set({ country: v, city: '' })} placeholder={t('home.search_country')} anyLabel={t('home.any_country')}
                options={Object.keys(CITIES_BY_COUNTRY).map((c) => ({ value: c, label: translateCountry(null, c) }))} />
              <SelectField value={f.city} onChange={(v) => set({ city: v })} placeholder={t('home.search_city')} anyLabel={t('home.any_city')} disabled={!isSet(f.country)}
                options={(CITIES_BY_COUNTRY[f.country] || []).map((c) => ({ value: c, label: translateCity(null, c) }))} />
            </div>
          </Field>
          <Field label={t('home.color', 'Цвет')} className={more}>
            <SelectField value={f.color} onChange={(v) => set({ color: v })} placeholder={t('home.any_color')} anyLabel={t('home.any_color')}
              options={COLORS.map((c) => ({ value: t('colors.' + c), label: t('colors.' + c) }))} />
          </Field>
          {f.vehicleType !== 'moto' && (
            <Field label={t('home.drive', 'Привод')} className={more}>
              <SelectField value={f.driveType} onChange={(v) => set({ driveType: v })} placeholder={t('home.any_drive')} anyLabel={t('home.any_drive')}
                options={['fwd', 'rwd', 'awd'].map((v) => ({ value: v, label: t('home.drive_' + v) }))} />
            </Field>
          )}
          <Field label={t('home.transmission', 'Коробка передач')} className={more}>
            <SelectField value={f.transmission} onChange={(v) => set({ transmission: v })} placeholder={t('home.any_transmission', 'Любая КПП')} anyLabel={t('home.any_transmission', 'Любая КПП')}
              options={['automatic', 'manual'].map((v) => ({ value: v, label: t('transmission_types.' + v) }))} />
          </Field>
        </div>
      )}

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-end">
        {hasBasics && (
          <Button type="button" variant="secondary" aria-expanded={allFilters} onClick={() => setAllFilters((v) => !v)} className="text-brand-text lg:hidden">
            <SlidersHorizontal />
            {allFilters ? t('home.fewer_filters', 'Меньше фильтров') : t('home.all_filters', 'Все фильтры')}
            <ChevronDown className={cn('transition-transform', allFilters && 'rotate-180')} />
          </Button>
        )}
        <div className="flex gap-2">
          {isCar && (
            <Button asChild variant="ghost" className="h-11 max-lg:w-11 max-lg:px-0" title={t('home.extended_search')}>
              <Link to="/DetailedSearch" aria-label={t('home.extended_search')}><SlidersHorizontal /><span className="hidden lg:inline">{t('home.extended_search')}</span></Link>
            </Button>
          )}
          <Button type="button" variant="ghost" className="h-11 hover:text-red-400 max-lg:w-11 max-lg:px-0" title={t('catalog.reset_all', 'Сбросить')} aria-label={t('catalog.reset_all', 'Сбросить')}
            onClick={() => setForm(EMPTY)}>
            <X /><span className="hidden lg:inline">{t('catalog.reset_all', 'Сбросить')}</span>
          </Button>
          <Button type="button" size="lg" className="flex-1 max-lg:order-first lg:min-w-[220px] lg:flex-none" onClick={() => navigate(buildSearchUrl(f, generations))}>
            <Search />{t('home.search_button')}
          </Button>
        </div>
      </div>
    </Panel>
  );
}
