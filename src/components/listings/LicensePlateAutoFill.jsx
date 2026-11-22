import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for demo purposes — replace with real API when available
const MOCK_DB = {
  'ABC123': { brand: 'BMW', model: '5 Series', year: '2019', fuel_type: 'diesel', transmission: 'automatic', body_type: 'sedan', engine_volume: '2.0', engine_power: '190', drive_type: 'rwd', color: 'Чёрный', mileage: '87000', vin: 'WBA5E2C51JG254823' },
  'DEF456': { brand: 'Toyota', model: 'Camry', year: '2021', fuel_type: 'hybrid', transmission: 'automatic', body_type: 'sedan', engine_volume: '2.5', engine_power: '218', drive_type: 'fwd', color: 'Белый', mileage: '34000', vin: 'JT2BF22K1W0051131' },
  'GHI789': { brand: 'Volkswagen', model: 'Golf', year: '2020', fuel_type: 'petrol', transmission: 'manual', body_type: 'hatchback', engine_volume: '1.4', engine_power: '150', drive_type: 'fwd', color: 'Серый', mileage: '62000', vin: 'WVWZZZ1KZAW123456' },
  'JKL321': { brand: 'Mercedes-Benz', model: 'E-Class', year: '2018', fuel_type: 'petrol', transmission: 'automatic', body_type: 'sedan', engine_volume: '2.0', engine_power: '245', drive_type: 'rwd', color: 'Серебристый', mileage: '110000', vin: 'WDD2130461A123456' },
};

export default function LicensePlateAutoFill({ onDataFilled }) {
  const { t } = useTranslation();
  const [plate, setPlate] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | found | not_found
  const [foundData, setFoundData] = useState(null);

  const handleSearch = async () => {
    const normalized = plate.trim().toUpperCase().replace(/\s+/g, '');
    if (!normalized) return;
    setStatus('loading');
    setFoundData(null);

    // Simulate API delay
    await new Promise(r => setTimeout(r, 1200));

    const data = MOCK_DB[normalized];
    if (data) {
      setFoundData(data);
      setStatus('found');
    } else {
      setStatus('not_found');
    }
  };

  const handleApply = () => {
    if (foundData) onDataFilled(foundData);
  };

  const plateInputClass = "h-12 text-center text-lg font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal placeholder:text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all";

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-[8px] text-white font-bold">EU</span>
            </div>
          </div>
          <Input
            value={plate}
            onChange={e => { setPlate(e.target.value.toUpperCase()); setStatus('idle'); setFoundData(null); }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={t('listing.plate_search_placeholder', 'ABC 123')}
            className={cn(plateInputClass, 'pl-10')}
            maxLength={10}
          />
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          disabled={!plate.trim() || status === 'loading'}
          className="h-12 px-5 bg-emerald-500 hover:bg-emerald-600 rounded-xl gap-2 font-medium shrink-0"
        >
          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span className="hidden sm:inline">{t('listing.search_plate', 'Найти')}</span>
        </Button>
      </div>

      {/* Loading */}
      {status === 'loading' && (
        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Loader2 className="w-5 h-5 text-emerald-500 animate-spin shrink-0" />
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('listing.plate_searching', 'Ищем данные в реестре...')}</p>
        </div>
      )}

      {/* Not found */}
      {status === 'not_found' && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{t('listing.plate_not_found', 'Номер не найден в реестре')}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{t('listing.plate_not_found_hint', 'Попробуйте другой номер или заполните данные вручную')}</p>
          </div>
        </div>
      )}

      {/* Found */}
      {status === 'found' && foundData && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-300 dark:border-emerald-700 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{t('listing.plate_found', 'Автомобиль найден!')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: t('listing.brand', 'Марка'), value: foundData.brand },
              { label: t('listing.model', 'Модель'), value: foundData.model },
              { label: t('listing.year', 'Год'), value: foundData.year },
              { label: t('listing.fuel_type', 'Топливо'), value: foundData.fuel_type },
              { label: t('listing.transmission', 'КПП'), value: foundData.transmission },
              { label: t('listing.engine_volume', 'Объём'), value: foundData.engine_volume ? `${foundData.engine_volume}L` : '—' },
            ].map(item => (
              <div key={item.label} className="bg-white dark:bg-slate-800 rounded-lg px-3 py-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{item.label}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{item.value || '—'}</p>
              </div>
            ))}
          </div>
          <Button type="button" onClick={handleApply} className="w-full bg-emerald-500 hover:bg-emerald-600 gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {t('listing.apply_plate_data', 'Заполнить форму этими данными')}
          </Button>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">{t('listing.plate_apply_hint', 'Вы сможете отредактировать любые данные перед публикацией')}</p>
        </div>
      )}
    </div>
  );
}