import React from 'react';
import { Link } from 'react-router-dom';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { formatPrice } from '@/utils/format';
import { useTranslation } from 'react-i18next';
import { translateLocation } from '@/utils/locationUtils';
import { fuelChip } from '@/lib/fuelBadge';
import PriceRatingBadge from '@/components/cars/PriceRatingBadge';
import TileImageArea from '@/components/cars/TileImageArea';
import TransmissionOrEnergy from '@/components/cars/TransmissionOrEnergy';

const carIcons = {
  fuel: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/6feb2f9c7_gas-station1.png',
  transmission: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/5bf7d42bf_gearbox3.png',
  mileage: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/f3a09dd47_road-perspective.png',
  speed: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/e4b346d84_speedometer1.png'
};

export default function CompactCarCard({ car, showLocation = false, vehicleType = 'car', rating = null, promotion = null }) {
  const { t } = useTranslation();

  const formatMileage = (m) =>
    new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(m);

  const dateStr = car.month_of_manufacture && car.year
    ? `${String(car.month_of_manufacture).padStart(2, '0')}/${car.year}`
    : car.year || null;

  const fuel = car.fuel_type ? fuelChip(car.fuel_type, carIcons.fuel) : null;

  const href = vehicleType === 'car'
    ? getCarDetailsPath(car)
    : `/VehicleDetails?id=${car.id}&type=${vehicleType}`;

  return (
    <Link to={href} className="block tile-card group">
      <TileImageArea car={car} promotion={promotion} />

      {/* Info below image */}
      <div className="px-0.5">
        {/* Brand + Model + Price */}
         <div className="flex items-start justify-between gap-1">
           <span className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wide leading-tight truncate">
             {car.brand} {car.model} {car.year && <span className="text-slate-400 dark:text-slate-400 text-[12px] font-semibold ml-0.5">({car.year})</span>}
           </span>
           <span className="text-[13px] font-bold text-slate-900 dark:text-white whitespace-nowrap flex-shrink-0">
             {formatPrice(car.price)}
           </span>
         </div>

        {/* Trim level (left) + price rating (right) on one line */}
        {(car.trim_level || rating?.score) && (
          <div className="flex items-center justify-between gap-2 mt-0.5 min-h-[15px]">
            <div className="min-w-0 text-[11px] text-slate-500 dark:text-slate-400 leading-snug truncate">
              {car.trim_level}
            </div>
            {rating?.score ? (
              <div className="ml-auto flex-shrink-0">
                <PriceRatingBadge score={rating.score} showLabel={false} />
              </div>
            ) : null}
          </div>
        )}

        {/* Specs chips */}
          <div className="mt-1.5 flex flex-wrap gap-1">
            {car.engine_power && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <img src={carIcons.speed} alt="power" className="w-4 h-4 flex-shrink-0 dark:invert" />
                {Math.round(car.engine_power * 0.735)} {t('car.kw')}
              </span>
            )}
            {car.mileage != null && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <img src={carIcons.mileage} alt="mileage" className="w-4 h-4 flex-shrink-0 dark:invert" />
                {formatMileage(car.mileage)} {t('car.km')}
              </span>
            )}
            {fuel && (
              <span
                style={fuel.style}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <img src={fuel.icon} alt="fuel" className={`w-4 h-4 flex-shrink-0 ${fuel.iconClass}`} />
                {t('fuel_types.' + car.fuel_type, car.fuel_type)}
              </span>
            )}
            <TransmissionOrEnergy car={car} size="md">
              {car.transmission && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <img src={carIcons.transmission} alt="transmission" className="w-4 h-4 flex-shrink-0 dark:invert" />
                  {t('transmission_types.' + car.transmission, car.transmission)}
                </span>
              )}
            </TransmissionOrEnergy>
            {showLocation && (car.location || car.country) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-full">
                <img src="https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/042a078cf_pin.png" alt="location" className="w-4 h-4 flex-shrink-0 invert" />
                <span className="truncate">{translateLocation(t, car.location, car.country)}</span>
              </span>
            )}
          </div>
      </div>
    </Link>
  );
}