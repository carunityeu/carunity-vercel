import React from 'react';
import { useTranslation } from 'react-i18next';
import { energyChip, isElectricFuel } from '@/lib/fuelBadge';

// The chip stands in for the transmission tile, so its box mirrors the tile style of the
// row it lands in: sm — list cards · md — grid tiles · lg — big hero card · pill — pill tiles
const SIZES = {
  sm: { box: 'gap-1 px-2 py-1 text-xs sm:text-sm', icon: 'w-3.5 h-3.5', radius: 'rounded-md' },
  md: { box: 'gap-1 px-2 py-1 text-sm', icon: 'w-4 h-4', radius: 'rounded-md' },
  lg: { box: 'gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm', icon: 'w-3.5 h-3.5', radius: 'rounded-lg' },
  pill: { box: 'gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm', icon: 'w-3.5 h-3.5', radius: 'rounded-full' }
};

/**
 * Electric consumption chip (kWh/100 km) — brand blue, same as the electric fuel chip.
 * Renders nothing unless the listing runs on electricity and a value is set.
 */
export default function ElectricConsumptionChip({ fuelType, value, size = 'sm', radius = null, className = '' }) {
  const { t } = useTranslation();
  if (!isElectricFuel(fuelType) || value == null || value === '') return null;

  const chip = energyChip();
  const preset = SIZES[size] || SIZES.sm;
  return (
    <span
      style={chip.style}
      className={`inline-flex items-center font-semibold whitespace-nowrap bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ${preset.box} ${radius || preset.radius} ${className}`}>
      <img src={chip.icon} alt="" className={`${preset.icon} flex-shrink-0`} style={chip.iconStyle} />
      {value} {t('car.kwh_100km', 'kWh/100 km')}
    </span>
  );
}