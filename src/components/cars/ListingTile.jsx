import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Car, Fuel, Gauge, PlugZap } from 'lucide-react';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { formatNumber, formatPrice } from '@/utils/format';
import { isElectricFuel } from '@/lib/fuelBadge';
import PriceRatingBadge from '@/components/cars/PriceRatingBadge';
import FavoriteButton from '@/components/cars/FavoriteButton';

// Outline icons in the same stroke style as lucide, for facts lucide has no icon for
const GearboxIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
    <circle cx="5" cy="5" r="2" /><circle cx="12" cy="5" r="2" /><circle cx="19" cy="5" r="2" />
    <circle cx="5" cy="19" r="2" /><circle cx="12" cy="19" r="2" />
    <path d="M5 7v10M12 7v10M19 7v5H5" />
  </svg>
);
const RoadIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
    <path d="M4 3v18M20 3v18M12 4v3M12 10.5v3M12 17v3" />
  </svg>
);

const PILL = 'inline-flex h-8 items-center gap-1.5 rounded-lg bg-page px-2.5 text-sm text-ink';
const ICON = 'h-4 w-4 flex-shrink-0';

/**
 * Listing tile in the mobile.de style: photo with a round save button, name, price with the
 * price-rating bar next to it, an optional deal tag, then fact pills on the page colour.
 * No hover effects (design code §7). Lives on a surface panel, so it has no background itself.
 */
export default function ListingTile({ car, rating }) {
  const { t } = useTranslation();
  const electric = isElectricFuel(car.fuel_type);
  const kw = car.engine_power ? Math.round(car.engine_power * 0.7355) : null;
  const discount = car.original_price > car.price ? car.original_price - car.price : 0;

  return (
    <Link to={getCarDetailsPath(car)} className="flex h-full flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-raised">
        {car.images?.[0]
          ? <img src={car.images[0]} alt={`${car.brand} ${car.model}`} loading="lazy" className="h-full w-full object-cover" />
          : <div className="flex h-full w-full items-center justify-center"><Car className="h-8 w-8 text-ink-3" /></div>}
        <FavoriteButton carId={car.id} />
      </div>

      <h3 className="mt-3 truncate text-lg font-bold leading-tight text-ink" title={`${car.brand} ${car.model}`}>{car.brand} {car.model}</h3>

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
        {car.fuel_type && (
          <span className={PILL}>{electric ? <PlugZap className={ICON} /> : <Fuel className={ICON} />}{t('fuel_types.' + car.fuel_type, car.fuel_type)}</span>
        )}
        {kw && <span className={PILL}><Gauge className={ICON} />{kw} {t('car.kw')} ({car.engine_power} {t('car.hp', 'л.с.')})</span>}
        {car.transmission && <span className={PILL}><GearboxIcon className={ICON} />{t('transmission_types.' + car.transmission, car.transmission)}</span>}
        {car.mileage != null && <span className={PILL}><RoadIcon className={ICON} />{formatNumber(car.mileage)} {t('car.km')}</span>}
      </div>
    </Link>
  );
}
