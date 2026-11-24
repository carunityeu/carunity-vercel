import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { formatPrice, formatNumber } from '@/utils/format';
import { translateLocation } from '@/utils/locationUtils';
import { isElectricFuel } from '@/lib/fuelBadge';
import { cn } from '@/lib/utils';
import PriceRatingBadge from '@/components/cars/PriceRatingBadge';
import DiscountTag from '@/components/cars/DiscountTag';
import TileImageArea from '@/components/cars/TileImageArea';

/**
 * The one listing card of the site (design code, section 6): grids, carousels, similar listings.
 * Photo 4:3 · name · price · one line of key facts · location and seller type.
 * Key facts are plain text separated by dots instead of chips: easier to scan in a grid.
 */
export default function CompactCarCard({ car, vehicleType = 'car', rating = null, promotion = null, className }) {
  const { t } = useTranslation();
  const href = vehicleType === 'car' ? getCarDetailsPath(car) : `/VehicleDetails?id=${car.id}&type=${vehicleType}`;
  const discount = car.original_price > car.price ? car.original_price - car.price : 0;
  const kw = car.engine_power ? Math.round(car.engine_power * 0.7355) : null;

  const facts = [
    car.month_of_manufacture && car.year ? `${String(car.month_of_manufacture).padStart(2, '0')}/${car.year}` : car.year,
    car.mileage != null && `${formatNumber(car.mileage)} ${t('car.km')}`,
    car.fuel_type && t('fuel_types.' + car.fuel_type, car.fuel_type),
    kw && `${kw} ${t('car.kw')}`,
    !isElectricFuel(car.fuel_type) && car.transmission && t('transmission_types.' + car.transmission, car.transmission),
  ].filter(Boolean);

  const location = (car.location || car.country) && translateLocation(t, car.location, car.country);
  const seller = car.seller_type === 'dealer' ? t('car.dealer_label', 'Дилер') : t('car.private_label', 'Частный продавец');

  return (
    <Link
      to={href}
      className={cn('tile-card group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-brand/50', className)}>
      <TileImageArea car={car} promotion={promotion} className="" radiusClass="rounded-none" />

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="truncate text-sm font-bold text-ink sm:text-base" title={`${car.brand} ${car.model}`}>
          {car.brand} {car.model}
        </h3>
        {car.trim_level && <p className="-mt-0.5 truncate text-xs text-ink-3">{car.trim_level}</p>}

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-lg font-bold leading-tight text-ink">{formatPrice(car.price)}</span>
          {discount > 0 && <DiscountTag label={`-${formatPrice(discount)}`} />}
          {rating?.score ? <PriceRatingBadge score={rating.score} showLabel={false} className="ml-auto" /> : null}
        </div>

        {facts.length > 0 && (
          <p className="line-clamp-2 text-xs leading-5 text-ink-2">
            {facts.map((f, i) => (
              <React.Fragment key={i}>{i > 0 && <span className="text-ink-3">{' · '}</span>}<span className="whitespace-nowrap">{f}</span></React.Fragment>
            ))}
          </p>
        )}

        <div className="mt-auto flex items-center gap-1 border-t border-line pt-2 text-xs text-ink-3">
          {location && <><MapPin className="h-3.5 w-3.5 flex-shrink-0" /><span className="truncate">{location}</span><span className="mx-0.5">·</span></>}
          <span className="flex-shrink-0">{seller}</span>
        </div>
      </div>
    </Link>
  );
}
