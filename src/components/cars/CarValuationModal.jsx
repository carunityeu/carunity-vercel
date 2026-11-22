import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ValuationHeader from '@/components/cars/valuation/ValuationHeader';
import ValuationSearchForm from '@/components/cars/valuation/ValuationSearchForm';
import '@/components/cars/valuation/valuation.css';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { base44 } from '@/api/base44Client';
import {
  Dialog, DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Car, RotateCcw, ArrowRight } from 'lucide-react';

export default function CarValuationModal({ open, onOpenChange }) {
  const { t } = useTranslation();
  const [plate, setPlate] = useState('');
  const [vin, setVin] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | found | not_found
  const [result, setResult] = useState(null);

  const normalize = (s) => s.trim().toUpperCase().replace(/\s+/g, '');

  const handleSearch = async () => {
    const plateNorm = normalize(plate);
    const vinNorm = normalize(vin);
    if (!plateNorm && !vinNorm) return;

    setStatus('loading');
    setResult(null);

    try {
      // Search by license plate or VIN
      const filter = plateNorm ? { license_plate: plateNorm } : { vin: vinNorm };
      const cars = await base44.entities.Car.filter(filter, '-created_date', 20);

      if (cars && cars.length > 0) {
        const car = cars[0];
        // Find similar active cars (same brand + model, year ±3)
        const similarFilter = { status: 'active', brand: car.brand };
        const similarCars = await base44.entities.Car.filter(similarFilter, '-created_date', 100);

        const sameModel = similarCars.filter((c) =>
          c.model === car.model &&
          c.id !== car.id &&
          c.year &&
          car.year &&
          Math.abs(c.year - car.year) <= 3
        );

        const prices = sameModel.map((c) => c.price).filter((p) => p > 0);
        let avgPrice = null, minPrice = null, maxPrice = null;
        if (prices.length > 0) {
          avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
          minPrice = Math.min(...prices);
          maxPrice = Math.max(...prices);
        }

        setResult({
          car,
          similarCount: prices.length,
          avgPrice,
          minPrice,
          maxPrice,
          similarCars: sameModel.slice(0, 4),
        });
        setStatus('found');
      } else {
        setStatus('not_found');
      }
    } catch (e) {
      setStatus('not_found');
    }
  };

  const handleReset = () => {
    setPlate('');
    setVin('');
    setStatus('idle');
    setResult(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(handleReset, 300);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(price) + ' €';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="valuation-dialog" aria-describedby={undefined}>
        <div className="valuation">
        <ValuationHeader />

        {/* IDLE / SEARCH STATE */}
        {(status === 'idle' || status === 'loading') && (
          <ValuationSearchForm plate={plate} vin={vin} status={status}
            onPlateChange={(e) => {
              const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
              let formatted = raw;
              if (raw.length > 3) formatted = raw.slice(0, 3) + ' ' + raw.slice(3, 7);
              setPlate(formatted);
              setStatus('idle');
            }}
            onVinChange={(e) => { setVin(e.target.value.toUpperCase()); setStatus('idle'); }}
            onKeyDown={(e) => e.key === 'Enter' && !status && handleSearch()}
            onSearch={handleSearch} />
        )}

        {/* NOT FOUND */}
        {status === 'not_found' && (
          <div className="space-y-5 pt-2">
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">{t('valuation.not_found_title')}</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">{t('valuation.not_found_desc')}</p>
              </div>
            </div>
            <Button onClick={handleReset} variant="outline" className="w-full gap-2 h-11">
              <RotateCcw className="w-4 h-4" />
              {t('valuation.try_again')}
            </Button>
          </div>
        )}

        {/* FOUND */}
        {status === 'found' && result && (
          <div className="space-y-4 pt-2">
            {/* Car info */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              {result.car.images?.[0] ? (
                <img src={result.car.images[0]} alt={result.car.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Car className="w-6 h-6 text-slate-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {result.car.brand} {result.car.model}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {result.car.year}
                  {result.car.license_plate && ` • ${result.car.license_plate}`}
                </p>
              </div>
            </div>

            {/* Valuation result */}
            {result.avgPrice ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wide mb-1">
                  {t('valuation.estimated_value')}
                </p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {formatPrice(result.avgPrice)}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{formatPrice(result.minPrice)} – {formatPrice(result.maxPrice)}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span>{t('valuation.based_on', { count: result.similarCount })}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('valuation.no_similar')}</p>
                {result.car.price > 0 && (
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                    {formatPrice(result.car.price)}
                  </p>
                )}
              </div>
            )}

            {/* Listed price (if car is active) */}
            {result.car.status === 'active' && result.car.price > 0 && (
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">{t('valuation.listed_price')}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(result.car.price)}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleReset} variant="outline" className="flex-1 gap-2 h-11">
                <RotateCcw className="w-4 h-4" />
                {t('valuation.try_again')}
              </Button>
              {result.car.status === 'active' && (
                <Link to={getCarDetailsPath(result.car)} className="flex-1">
                  <Button className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 h-11">
                    {t('valuation.view_listing')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}