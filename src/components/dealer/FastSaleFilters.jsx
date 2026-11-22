import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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

  const inputClass = "h-10 bg-slate-800 border-slate-700 border text-white rounded-xl text-sm placeholder:text-slate-500 px-3 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/30";

  const selectClass = "h-10 bg-slate-800 border-slate-700 text-white rounded-xl text-sm";

  return (
    <div className="space-y-2 mb-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Select value={filterBrand || 'any'} onValueChange={v => { setFilterBrand(v === 'any' ? '' : v); setFilterModel(''); }}>
          <SelectTrigger className={selectClass}>
            <SelectValue placeholder={t('home.search_brand', 'Марка')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t('dealer.all_brands', 'Все марки')}</SelectItem>
            {uniqueBrands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterModel || 'any'} onValueChange={v => setFilterModel(v === 'any' ? '' : v)}>
          <SelectTrigger className={selectClass}>
            <SelectValue placeholder={t('home.search_model', 'Модель')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t('dealer.all_models', 'Все модели')}</SelectItem>
            {uniqueModels.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterBody || 'any'} onValueChange={v => setFilterBody(v === 'any' ? '' : v)}>
          <SelectTrigger className={selectClass}>
            <SelectValue placeholder={t('dealer.filter_body', 'Кузов')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t('home.any_body', 'Любой кузов')}</SelectItem>
            {uniqueBodies.map(b => <SelectItem key={b} value={b}>{t('body_types.' + b, b)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Select value={filterTrans || 'any'} onValueChange={v => setFilterTrans(v === 'any' ? '' : v)}>
          <SelectTrigger className={selectClass}>
            <SelectValue placeholder={t('dealer.filter_trans', 'Коробка')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t('home.any_transmission', 'Любая КПП')}</SelectItem>
            {uniqueTrans.map(tr => <SelectItem key={tr} value={tr}>{t('transmission_types.' + tr, tr)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterFuel || 'any'} onValueChange={v => setFilterFuel(v === 'any' ? '' : v)}>
          <SelectTrigger className={selectClass}>
            <SelectValue placeholder={t('dealer.filter_engine', 'Двигатель')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t('home.any_fuel', 'Любое топливо')}</SelectItem>
            {uniqueFuels.map(f => <SelectItem key={f} value={f}>{t('fuel_types.' + f, f)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterDrive || 'any'} onValueChange={v => setFilterDrive(v === 'any' ? '' : v)}>
          <SelectTrigger className={selectClass}>
            <SelectValue placeholder={t('dealer.filter_drive', 'Привод')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t('home.any_drive', 'Любой привод')}</SelectItem>
            {uniqueDrives.map(d => <SelectItem key={d} value={d}>{t('home.drive_' + d, d)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="grid grid-cols-2 gap-1">
          <input className={inputClass} placeholder={t('dealer.year_from', 'Год от')} value={yearFrom} onChange={e => setYearFrom(e.target.value)} type="number" />
          <input className={inputClass} placeholder={t('dealer.to', 'до')} value={yearTo} onChange={e => setYearTo(e.target.value)} type="number" />
        </div>
        <div className="grid grid-cols-2 gap-1">
          <input className={inputClass} placeholder={t('dealer.mileage_from', 'Пробег от')} value={mileageFrom} onChange={e => setMileageFrom(e.target.value)} type="number" />
          <input className={inputClass} placeholder={t('dealer.to', 'до')} value={mileageTo} onChange={e => setMileageTo(e.target.value)} type="number" />
        </div>
        <div className="grid grid-cols-2 gap-1">
          <input className={inputClass} placeholder={t('dealer.price_from', 'Цена от, €')} value={priceFrom} onChange={e => setPriceFrom(e.target.value)} type="number" />
          <input className={inputClass} placeholder={t('dealer.to', 'до')} value={priceTo} onChange={e => setPriceTo(e.target.value)} type="number" />
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="h-10 px-6 rounded-xl text-sm font-semibold gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
          {t('dealer.show_count', 'Показать')} {filtered.length} {t('dealer.offers', 'предложений')}
        </Button>
      </div>
    </div>
  );
}