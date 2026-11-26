import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { entities } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { BRANDS } from '@/utils/brandList';
import { getModelsForBrand } from '@/utils/carData';
import { getVehicleBrands, getVehicleModels } from '@/utils/vehicleBrandModels';
import { translateCountry, translateCity, CITIES_BY_COUNTRY } from '@/utils/locationUtils';
import { generationsDB } from '@/components/search/GenerationPicker';
import MiniSearchSelect from '@/components/search/MiniSearchSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { fieldClass } from '@/components/ds';
import { VEHICLE_TYPES, MAIN_TYPES, TYPE_CONFIG, ALWAYS_VISIBLE, MOTO_BRANDS } from './vehicleSearchConfig';

const selectTrigger = `${fieldClass} flex items-center justify-between text-left`;

const BODY_TYPES = ['sedan', 'suv', 'hatchback', 'wagon', 'coupe'];
const COLORS = ['white', 'black', 'gray', 'silver', 'blue', 'red', 'green', 'brown', 'beige', 'gold', 'orange', 'yellow', 'purple'];
const KW_TO_HP = 1.36; // power is entered in kW or hp (switch on the field), the catalogs filter by hp

// One form for every vehicle type; switching the type starts from a clean form
const EMPTY = {
  vehicleType: 'car', brand: '', model: '', subType: '', fuelType: '', bodyType: '',
  yearFrom: '', yearTo: '', useGenerations: false, generations: [],
  priceFrom: '', priceTo: '', powerFrom: '', powerTo: '', powerUnit: 'kw', mileageFrom: '', mileageTo: '',
  country: '', city: '', color: '', driveType: '', transmission: '',
};

const isSet = (v) => v !== '' && v !== 'any' && v != null;
const digits = (v) => v.replace(/\D/g, '');

// Turns the form into the catalog URL (cars → Catalog, other types → VehicleCatalog). Free of React.
function buildSearchUrl(f, generations) {
  const params = new URLSearchParams();
  const put = (key, value) => { if (isSet(value)) params.set(key, String(value)); };
  const toHp = (v) => String(Math.round(Number(v) * (f.powerUnit === 'hp' ? 1 : KW_TO_HP)));
  if (f.powerFrom) params.set('powerFrom', toHp(f.powerFrom));
  if (f.powerTo) params.set('powerTo', toHp(f.powerTo));
  put('priceFrom', f.priceFrom); put('priceTo', f.priceTo);
  put('brand', f.brand); put('model', f.model);
  put('country', f.country); put('color', f.color); put('transmission', f.transmission);

  if (f.vehicleType !== 'car') {
    const cfg = TYPE_CONFIG[f.vehicleType];
    params.set('type', f.vehicleType);
    if (cfg.sub) put(cfg.sub.key, f.subType);
    put('fuel_type', f.fuelType); put('year_from', f.yearFrom); put('year_to', f.yearTo);
    return `${createPageUrl('VehicleCatalog')}?${params}`;
  }

  put('bodyType', f.bodyType); put('fuelType', f.fuelType);
  if (f.useGenerations && f.generations.length) {
    const years = generations.filter((g) => f.generations.includes(g.code))
      .flatMap((g) => g.years.split('–').map((s) => s.trim()).filter((p) => /^\d{4}$/.test(p)).map(Number));
    if (years.length) { params.set('yearFrom', String(Math.min(...years))); params.set('yearTo', String(Math.max(...years))); }
  } else { put('yearFrom', f.yearFrom); put('yearTo', f.yearTo); }
  put('mileageFrom', f.mileageFrom); put('mileageTo', f.mileageTo);
  put('driveType', f.driveType); put('city', f.city);
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
    <div className={cn('min-w-0', className)}>
      <div className="mb-2 flex h-5 items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-ink-2">{label}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

/** "From | To" in one field, split by a thin line (year, price, power). */
function RangeBox({ from, to, onFrom, onTo, maxLength, label }) {
  const { t } = useTranslation();
  const input = 'h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-ink-3';
  return (
    <div className="flex h-10 items-center rounded-xl bg-raised focus-within:ring-1 focus-within:ring-brand">
      <input inputMode="numeric" maxLength={maxLength} aria-label={`${label}: ${t('home.price_from', 'От')}`} placeholder={t('home.price_from', 'От')}
        value={from} onChange={(e) => onFrom(digits(e.target.value))} className={input} />
      <span className="h-5 w-px flex-shrink-0 bg-ink-3/40" />
      <input inputMode="numeric" maxLength={maxLength} aria-label={`${label}: ${t('home.price_to', 'До')}`} placeholder={t('home.price_to', 'До')}
        value={to} onChange={(e) => onTo(digits(e.target.value))} className={input} />
    </div>
  );
}

/**
 * Two-option switch (automatic / manual) in the field look: raised background, a full-height line
 * in the middle, the chosen half outlined with square inner corners. A second tap clears the choice.
 */
function Toggle({ value, onChange, options, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="relative grid h-10 grid-flow-col auto-cols-fr rounded-xl bg-raised">
      {options.slice(1).map((o, i) => (
        <span key={o.value} aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-px bg-ink-3/40" style={{ left: `${((i + 1) * 100) / options.length}%` }} />
      ))}
      {options.map((o, i) => {
        const on = value === o.value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} onClick={() => onChange(on ? '' : o.value)}
            className={cn('relative truncate px-2 text-sm',
              i === 0 && 'rounded-l-xl', i === options.length - 1 && 'rounded-r-xl',
              on ? 'z-10 bg-brand/15 font-medium text-ink ring-1 ring-inset ring-brand' : 'text-ink-3')}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// Two rows of four fields: phones 1 column, tablets 2, from laptops 4.
const GRID = 'grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2 lg:grid-cols-4';
const TAB = 'flex h-12 flex-shrink-0 items-center justify-center gap-2.5 rounded-t-2xl';

export default function HomeSearchPanel({ className }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [f, setForm] = useState(EMPTY);
  const [allFilters, setAllFilters] = useState(false);
  const [showAllTypes, setShowAllTypes] = useState(false);
  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const type = f.vehicleType;
  const cfg = TYPE_CONFIG[type];
  const isCar = type === 'car';
  const generations = (isCar && f.brand && f.model && generationsDB[f.brand]?.[f.model]) || [];

  // Brands and models per type: cars from the car lists, motorcycles from the model base, others from the static lists
  const brandOptions = useMemo(() => (isCar ? BRANDS : type === 'moto' ? MOTO_BRANDS : getVehicleBrands(type)), [isCar, type]);
  const { data: motoModels = [] } = useQuery({
    queryKey: ['motoModels', f.brand],
    queryFn: async () => {
      const rows = await entities.MotorcycleModelInfo.filter({ brand: f.brand }, 'model', 10000);
      return [...new Set(rows.map((r) => r.model).filter(Boolean))].sort();
    },
    enabled: type === 'moto' && !!f.brand,
    staleTime: 5 * 60 * 1000,
  });
  const { data: modelCounts = {} } = useQuery({
    queryKey: ['homeModelCounts', f.brand],
    queryFn: async () => {
      const { rows } = await entities.Car.aggregate({ query: { status: 'active', brand: f.brand }, groupBy: 'model' });
      return Object.fromEntries(rows.map((r) => [r.model, r.count]));
    },
    enabled: isCar && !!f.brand,
    staleTime: 10 * 60 * 1000,
  });
  const modelOptions = useMemo(() => {
    if (!f.brand) return [];
    if (isCar) {
      return [...new Set([...getModelsForBrand(f.brand), ...Object.keys(generationsDB[f.brand] || {})])].sort((a, b) => a.localeCompare(b))
        .map((m) => ({ value: m, label: modelCounts[m] ? `${m} (${modelCounts[m]})` : m }));
    }
    return type === 'moto' ? motoModels : getVehicleModels(type, f.brand);
  }, [f.brand, isCar, type, motoModels, modelCounts]);

  // Fields that laptops always show; phones and tablets show them with "All filters"
  const visibility = (name) => (ALWAYS_VISIBLE.includes(name) || allFilters ? '' : 'hidden lg:block');

  const pickType = (key) => { setForm({ ...EMPTY, vehicleType: key }); };
  const typeLabel = (v) => t(v.labelKey, v.fallback);
  const tabs = VEHICLE_TYPES.filter((v, i) => showAllTypes || i < MAIN_TYPES || v.key === type);

  // Power: kW by default, the label switch turns the field into hp and converts what is typed
  const setPowerUnit = (unit) => {
    if (unit === f.powerUnit) return;
    const k = unit === 'hp' ? KW_TO_HP : 1 / KW_TO_HP;
    const conv = (v) => (v ? String(Math.round(Number(v) * k)) : '');
    set({ powerUnit: unit, powerFrom: conv(f.powerFrom), powerTo: conv(f.powerTo) });
  };
  const units = [{ value: 'kw', label: t('car.kw', 'кВт') }, { value: 'hp', label: t('car.hp', 'л.с.') }];
  const anyLabel = t('home.any', 'Любой');

  // Every field the search knows. A type's config picks which ones it shows and in what order.
  const FIELDS = {
    brand: () => (
      <Field label={t('home.search_brand', 'Марка')}>
        <MiniSearchSelect value={f.brand} triggerClassName={selectTrigger} options={brandOptions}
          onChange={(b) => set({ brand: b && b !== 'any' ? b : '', model: '', generations: [], useGenerations: false })}
          placeholder={t('home.brand_any_label', 'Любая марка')} anyLabel={t('common.any_brand', 'Любая марка')} />
      </Field>
    ),
    model: () => (
      <Field label={t('home.search_model', 'Модель')}>
        <MiniSearchSelect value={f.model} triggerClassName={cn(selectTrigger, !f.brand && 'text-ink-3')} options={modelOptions}
          onChange={(m) => set({ model: m === 'any' ? '' : m, generations: [], useGenerations: false })}
          placeholder={t('home.model_any_label', 'Любая модель')} anyLabel={t('common.any_model', 'Любая модель')} />
      </Field>
    ),
    price: () => (
      <Field label={`${t('home.price_label', 'Цена')}, €`}>
        <RangeBox label={t('home.price_label', 'Цена')} from={f.priceFrom} to={f.priceTo} onFrom={(v) => set({ priceFrom: v })} onTo={(v) => set({ priceTo: v })} />
      </Field>
    ),
    sub: () => cfg.sub && (
      <Field label={t(cfg.sub.labelKey, cfg.sub.fallback)}>
        <SelectField value={f.subType} onChange={(v) => set({ subType: v })} placeholder={anyLabel} anyLabel={anyLabel}
          options={cfg.sub.options.map((v) => ({ value: v, label: t(`${cfg.sub.tPrefix}.${v}`, v) }))} />
      </Field>
    ),
    fuel: () => (
      <Field label={cfg.fuelLabel ? t(cfg.fuelLabel.key, cfg.fuelLabel.fallback) : t('home.search_fuel', 'Топливо')}>
        <SelectField value={f.fuelType} onChange={(v) => set({ fuelType: v })} placeholder={t('home.any_fuel_short', 'Любое')} anyLabel={t('home.any_fuel_short', 'Любое')}
          options={(cfg.fuels || []).map((v) => ({ value: v, label: t('fuel_types.' + v, v) }))} />
      </Field>
    ),
    gearbox: () => (
      <Field label={t('home.gearbox', 'Коробка')}>
        <Toggle label={t('home.gearbox', 'Коробка')} value={f.transmission} onChange={(v) => set({ transmission: v })}
          options={[{ value: 'automatic', label: t('home.gear_auto', 'Автомат') }, { value: 'manual', label: t('home.gear_manual', 'Механика') }]} />
      </Field>
    ),
    year: () => (
      <Field
        label={generations.length > 0 && f.useGenerations ? t('home.generation_label') : t('home.year_label', 'Год')}
        action={generations.length > 0 && (
          <button type="button" onClick={() => set({ useGenerations: !f.useGenerations, generations: [], yearFrom: '', yearTo: '' })} className="whitespace-nowrap text-xs text-brand-text">
            {f.useGenerations ? t('home.by_year') : t('home.by_generation')}
          </button>
        )}>
        {f.useGenerations && generations.length > 0 ? (
          <div className="scrollbar-hide flex h-10 items-center gap-1.5 overflow-x-auto">
            {generations.map((g) => {
              const on = f.generations.includes(g.code);
              return (
                <button key={g.code} type="button" aria-pressed={on} title={g.years}
                  onClick={() => set({ generations: on ? f.generations.filter((c) => c !== g.code) : [...f.generations, g.code] })}
                  className={cn('h-8 flex-shrink-0 rounded-lg px-2.5 text-xs font-medium', on ? 'bg-brand text-white' : 'bg-raised text-ink-2')}>
                  {g.code}
                </button>
              );
            })}
          </div>
        ) : (
          <RangeBox label={t('home.year_label', 'Год')} maxLength={4} from={f.yearFrom} to={f.yearTo} onFrom={(v) => set({ yearFrom: v })} onTo={(v) => set({ yearTo: v })} />
        )}
      </Field>
    ),
    country: () => (
      <Field label={t('home.search_country', 'Страна')}>
        <SelectField value={f.country} onChange={(v) => set({ country: v, city: '' })} placeholder={t('home.all_baltics', 'Вся Балтия')} anyLabel={t('home.all_baltics', 'Вся Балтия')}
          options={Object.keys(CITIES_BY_COUNTRY).map((c) => ({ value: c, label: translateCountry(null, c) }))} />
      </Field>
    ),
    power: () => (
      <Field label={t('home.power_label', 'Мощность')}
        action={(
          <div role="radiogroup" aria-label={t('home.power_unit', 'Единицы мощности')} className="flex items-center gap-0.5 text-xs">
            {units.map((u) => (
              <button key={u.value} type="button" role="radio" aria-checked={f.powerUnit === u.value} onClick={() => setPowerUnit(u.value)}
                className={cn('rounded-md px-1.5 py-0.5', f.powerUnit === u.value ? 'bg-raised font-semibold text-brand-text' : 'text-ink-3')}>
                {u.label}
              </button>
            ))}
          </div>
        )}>
        <RangeBox label={t('home.power_label', 'Мощность')} from={f.powerFrom} to={f.powerTo} onFrom={(v) => set({ powerFrom: v })} onTo={(v) => set({ powerTo: v })} />
      </Field>
    ),
    body: () => (
      <Field label={t('home.search_body', 'Тип кузова')}>
        <SelectField value={f.bodyType} onChange={(v) => set({ bodyType: v })} placeholder={t('home.any_body')} anyLabel={t('home.any_body')}
          options={BODY_TYPES.map((v) => ({ value: v, label: t('body_types.' + v) }))} />
      </Field>
    ),
    mileage: () => (
      <Field label={`${t('home.mileage_label', 'Пробег')}, ${t('car.km', 'км')}`}>
        <RangeBox label={t('home.mileage_label', 'Пробег')} from={f.mileageFrom} to={f.mileageTo} onFrom={(v) => set({ mileageFrom: v })} onTo={(v) => set({ mileageTo: v })} />
      </Field>
    ),
    city: () => (
      <Field label={t('home.search_city', 'Город')}>
        <SelectField value={f.city} onChange={(v) => set({ city: v })} placeholder={isSet(f.country) ? t('home.any_city') : t('home.city_pick_country', 'Сначала страна')} anyLabel={t('home.any_city')} disabled={!isSet(f.country)}
          options={(CITIES_BY_COUNTRY[f.country] || []).map((c) => ({ value: c, label: translateCity(null, c) }))} />
      </Field>
    ),
    color: () => (
      <Field label={t('home.color', 'Цвет')}>
        <SelectField value={f.color} onChange={(v) => set({ color: v })} placeholder={t('home.any_color')} anyLabel={t('home.any_color')}
          options={COLORS.map((c) => ({ value: t('colors.' + c), label: t('colors.' + c) }))} />
      </Field>
    ),
    drive: () => (
      <Field label={t('home.drive', 'Привод')}>
        <SelectField value={f.driveType} onChange={(v) => set({ driveType: v })} placeholder={t('home.any_drive')} anyLabel={t('home.any_drive')}
          options={['fwd', 'rwd', 'awd'].map((v) => ({ value: v, label: t('home.drive_' + v) }))} />
      </Field>
    ),
    extended: () => (
      <Link to="/DetailedSearch" className="flex h-10 items-center self-end text-sm font-medium text-brand-text">
        {t('home.extended_search', 'Расширенный поиск')} →
      </Link>
    ),
  };
  const render = (name, withVisibility) => {
    const el = FIELDS[name]?.();
    return el ? <div key={name} className={cn('min-w-0', withVisibility && visibility(name), name === 'extended' && 'flex')}>{el}</div> : null;
  };
  // "All filters" is needed when the type has extra fields, or on small screens where row fields hide
  const hasHidden = cfg.main.some((n) => !ALWAYS_VISIBLE.includes(n));

  return (
    <div className={className}>
      {/* Vehicle type: folder tabs on the panel's top edge; the active one is the panel itself.
          The arrow opens the remaining types in the same row. */}
      <div role="tablist" aria-label={t('home.vehicle_type', 'Тип транспорта')} className="scrollbar-hide flex items-end gap-1.5 overflow-x-auto">
        {tabs.map((v) => {
          const on = v.key === type;
          return (
            <button key={v.key} type="button" role="tab" aria-selected={on} title={typeLabel(v)} aria-label={typeLabel(v)} onClick={() => pickType(v.key)}
              className={cn(TAB, on ? 'bg-surface px-5 text-[15px] font-semibold text-ink' : 'w-14 bg-surface/60 backdrop-blur sm:w-[72px]')}>
              <img src={v.icon} alt="" className={cn('h-5 w-8 object-contain mix-blend-screen', !on && 'opacity-60')} />
              {on && <span className="whitespace-nowrap">{typeLabel(v)}</span>}
            </button>
          );
        })}
        <button type="button" aria-label={showAllTypes ? t('home.fewer_types', 'Меньше типов') : t('home.more_types', 'Ещё типы')} aria-expanded={showAllTypes}
          onClick={() => setShowAllTypes((v) => !v)}
          className={cn(TAB, 'w-14 bg-surface/60 text-ink-2 backdrop-blur sm:w-[72px]')}>
          <ChevronRight className={cn('h-4 w-4 transition-transform', showAllTypes && 'rotate-180')} />
        </button>
      </div>

      <div className={cn('relative flex flex-col gap-4 rounded-2xl bg-surface p-4 shadow-xl shadow-black/30 sm:p-5 lg:p-6', type === VEHICLE_TYPES[0].key && 'rounded-tl-none')}>
        <div className={GRID}>{cfg.main.map((n) => render(n, true))}</div>

        {allFilters && cfg.extra.length > 0 && <div className={GRID}>{cfg.extra.map((n) => render(n, false))}</div>}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-6">
          <div className="flex items-center justify-end gap-6">
            {(cfg.extra.length > 0 || hasHidden) && (
              <button type="button" aria-expanded={allFilters} onClick={() => setAllFilters((v) => !v)}
                className={cn('flex items-center gap-2 text-sm font-semibold text-brand-text', !cfg.extra.length && 'lg:hidden')}>
                <SlidersHorizontal className="h-4 w-4" />
                {allFilters ? t('home.fewer_filters', 'Меньше фильтров') : t('home.all_filters', 'Все фильтры')}
              </button>
            )}
            <button type="button" onClick={() => setForm({ ...EMPTY, vehicleType: type })} className="flex items-center gap-1.5 text-sm font-medium text-ink-2">
              <X className="h-4 w-4" />{t('catalog.reset_all', 'Сбросить')}
            </button>
          </div>
          <Button type="button" size="lg" className="h-10 w-full sm:w-[200px]" onClick={() => navigate(buildSearchUrl(f, generations))}>
            <Search />{t('home.search_button', 'Найти')}
          </Button>
        </div>
      </div>
    </div>
  );
}
