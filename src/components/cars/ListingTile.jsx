import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GitCompareArrows } from 'lucide-react';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { formatNumber, formatPrice } from '@/utils/format';
import { carIcons } from '@/lib/specIcons';
import { fuelChip } from '@/lib/fuelBadge';
import { cn } from '@/lib/utils';
import { useCompare } from '@/components/compare/CompareContext';
import PriceRatingBadge from '@/components/cars/PriceRatingBadge';
import FavoriteButton from '@/components/cars/FavoriteButton';
import PhotoScrubber from '@/components/cars/PhotoScrubber';
import TransmissionOrEnergy from '@/components/cars/TransmissionOrEnergy';

// Pills sit on the page background, one tone lighter (the tile itself has no background)
const PILL = 'inline-flex h-8 items-center gap-1.5 rounded-lg bg-surface px-2.5 text-sm text-ink';
const icon = (src, extra = 'invert') => <img src={src} alt="" className={cn('h-4 w-4 flex-shrink-0', extra)} />;
// Photo buttons: shown on hover with a mouse, always visible on touch screens (design code §7)
const ACTIONS = 'absolute right-2.5 top-2.5 z-10 flex gap-1.5 [@media(hover:hover)]:invisible [@media(hover:hover)]:group-hover:visible [@media(hover:hover)]:group-focus-within:visible';

function CompareButton({ car }) {
  const { t } = useTranslation();
  const { addCar, removeCar, isInCompare } = useCompare();
  const on = isInCompare(car.id);
  const label = on ? t('compare.remove') : t('compare.add_to_compare');
  return (
    <button type="button" aria-label={label} title={label} aria-pressed={on}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); on ? removeCar(car.id) : addCar(car); }}
      className={cn('flex h-9 w-9 items-center justify-center rounded-full bg-page/90', on ? 'text-brand-text' : 'text-ink')}>
      <GitCompareArrows className="h-[18px] w-[18px]" />
    </button>
  );
}

/**
 * Listing tile in the mobile.de style: photo with quick browsing (max 5), compare and save buttons,
 * name + year, trim, price with the price-rating bar, deal tag, spec pills with the site's icons.
 */
export default function ListingTile({ car, rating }) {
  const { t } = useTranslation();
  const fuel = car.fuel_type ? fuelChip(car.fuel_type, carIcons.fuel) : null;
  const kw = car.engine_power ? Math.round(car.engine_power * 0.7355) : null;
  const discount = car.original_price > car.price ? car.original_price - car.price : 0;

  return (
    <Link to={getCarDetailsPath(car)} className="group flex h-full flex-col">
      <PhotoScrubber car={car} alt={`${car.brand} ${car.model}`} className="aspect-[4/3] rounded-xl">
        <div className={ACTIONS}>
          <CompareButton car={car} />
          <FavoriteButton carId={car.id} className="static" />
        </div>
      </PhotoScrubber>

      <h3 className="mt-3 flex items-baseline gap-2 text-lg font-bold leading-tight text-ink" title={`${car.brand} ${car.model}`}>
        <span className="truncate">{car.brand} {car.model}</span>
        {car.year && <span className="flex-shrink-0 text-sm font-medium text-ink-3">{car.year}</span>}
      </h3>
      {car.trim_level && <p className="mt-0.5 truncate text-sm text-ink-3">{car.trim_level}</p>}

      <div className="mt-2 flex items-center gap-3">
        <span className="whitespace-nowrap text-2xl font-bold leading-none text-ink">{formatPrice(car.price)}</span>
        <PriceRatingBadge score={rating?.score} size="lg" />
      </div>

      {discount > 0 && (
        <span className="mt-3 self-start rounded-md bg-electric/60 px-2 py-1 text-sm font-semibold text-ink">
          −{formatPrice(discount)} {t('home.price_drop', 'скидка')}
        </span>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {fuel && <span className={PILL} style={fuel.style}><img src={fuel.icon} alt="" className={cn('h-4 w-4 flex-shrink-0', fuel.iconClass)} />{t('fuel_types.' + car.fuel_type, car.fuel_type)}</span>}
        {kw && <span className={PILL}>{icon(carIcons.speed)}{kw} {t('car.kw')} ({car.engine_power} {t('car.hp', 'л.с.')})</span>}
        <TransmissionOrEnergy car={car} size="md" radius="rounded-lg">
          {car.transmission && <span className={PILL}>{icon(carIcons.transmission)}{t('transmission_types.' + car.transmission, car.transmission)}</span>}
        </TransmissionOrEnergy>
        {car.mileage != null && <span className={PILL}>{icon(carIcons.mileage)}{formatNumber(car.mileage)} {t('car.km')}</span>}
      </div>
    </Link>
  );
}
