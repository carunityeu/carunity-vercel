import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { fieldClass, NativeSelect } from '@/components/ds';

export default function FastSaleFilters({ cars, onFiltered }) {
  const { t } = useTranslation();
  const [filterBrand, setFilterBrand] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterBody, setFilterBody] = useState('');
  const [filterTrans, setFilterTrans] = useState('');
  const [filterFuel, setFilterFuel] = useState('');
  const [filterDrive, setFilterDrive] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [mileageFrom, setMileageFrom] = useState('');
  const [mileageTo, setMileageTo] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');

  const uniqueBrands = useMemo(() => [...new Set(cars.map(c => c.brand).filter(Boolean))].sort(), [cars]);
  const uniqueModels = useMemo(
    () => [...new Set(cars.filter(c => !filterBrand || c.brand === filterBrand).map(c => c.model).filter(Boolean))].sort(),
    [cars, filterBrand]
  );
  const uniqueBodies = useMemo(() => [...new Set(cars.map(c => c.body_type).filter(Boolean))], [cars]);
  const uniqueTrans = useMemo(() => [...new Set(cars.map(c => c.transmission).filter(Boolean))], [cars]);
  const uniqueFuels = useMemo(() => [...new Set(cars.map(c => c.fuel_type).filter(Boolean))], [cars]);
  const uniqueDrives = useMemo(() => [...new Set(cars.map(c => c.drive_type).filter(Boolean))], [cars]);

  const filtered = useMemo(() => {
    return cars.filter(c => {
      if (filterBrand && c.brand !== filterBrand) return false;
      if (filterModel && c.model !== filterModel) return false;
      if (filterBody && c.body_type !== filterBody) return false;
      if (filterTrans && c.transmission !== filterTrans) return false;
      if (filterFuel && c.fuel_type !== filterFuel) return false;
      if (filterDrive && c.drive_type !== filterDrive) return false;
      if (yearFrom && (c.year || 0) < parseInt(yearFrom)) return false;
      if (yearTo && (c.year || 0) > parseInt(yearTo)) return false;
      if (mileageFrom && (c.mileage || 0) < parseInt(mileageFrom)) return false;
      if (mileageTo && (c.mileage || 0) > parseInt(mileageTo)) return false;
      if (priceFrom && (c.price || 0) < parseInt(priceFrom)) return false;
      if (priceTo && (c.price || 0) > parseInt(priceTo)) return false;
      return true;
    });
  }, [cars, filterBrand, filterModel, filterBody, filterTrans, filterFuel, filterDrive, yearFrom, yearTo, mileageFrom, mileageTo, priceFrom, priceTo]);

  const cbRef = useRef(onFiltered);
  cbRef.current = onFiltered;
  useEffect(() => { cbRef.current(filtered); }, [filtered]);

  const selects = [
    { value: filterBrand, set: (v) => { setFilterBrand(v); setFilterModel(''); }, any: t('dealer.all_brands', 'Все марки'), options: uniqueBrands.map((b) => [b, b]) },
    { value: filterModel, set: setFilterModel, any: t('dealer.all_models', 'Все модели'), options: uniqueModels.map((m) => [m, m]) },
    { value: filterBody, set: setFilterBody, any: t('home.any_body', 'Любой кузов'), options: uniqueBodies.map((b) => [b, t('body_types.' + b, b)]) },
    { value: filterTrans, set: setFilterTrans, any: t('home.any_transmission', 'Любая КПП'), options: uniqueTrans.map((v) => [v, t('transmission_types.' + v, v)]) },
    { value: filterFuel, set: setFilterFuel, any: t('home.any_fuel', 'Любое топливо'), options: uniqueFuels.map((f) => [f, t('fuel_types.' + f, f)]) },
    { value: filterDrive, set: setFilterDrive, any: t('home.any_drive', 'Любой привод'), options: uniqueDrives.map((d) => [d, t('home.drive_' + d, d)]) },
  ];
  const ranges = [
    [t('dealer.year_from', 'Год от'), yearFrom, setYearFrom, yearTo, setYearTo],
    [t('dealer.mileage_from', 'Пробег от'), mileageFrom, setMileageFrom, mileageTo, setMileageTo],
    [t('dealer.price_from', 'Цена от, €'), priceFrom, setPriceFrom, priceTo, setPriceTo],
  ];
  const num = (e) => e.target.value.replace(/[^0-9]/g, '');

  // Filters live in the page (no extra card): the same fields as everywhere on the site
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 2xl:grid-cols-6">
        {selects.map((f, i) => (
          <NativeSelect key={i} value={f.value} onChange={(e) => f.set(e.target.value)} aria-label={f.any}>
            <option value="">{f.any}</option>
            {f.options.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </NativeSelect>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {ranges.map(([label, from, setFrom, to, setTo]) => (
          <div key={label} className="grid grid-cols-2 gap-2">
            <input className={fieldClass} inputMode="numeric" placeholder={label} value={from} onChange={(e) => setFrom(num(e))} />
            <input className={fieldClass} inputMode="numeric" placeholder={t('dealer.to', 'до')} value={to} onChange={(e) => setTo(num(e))} />
          </div>
        ))}
      </div>
      <p className="pt-1 text-sm text-ink-3">{t('dp.found', 'Найдено: {{n}}', { n: filtered.length })}</p>
    </div>
  );
}
