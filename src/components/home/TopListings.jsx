import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Car, ChevronRight, GitCompare, Heart } from 'lucide-react';
import { entities } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { formatNumber, formatPrice } from '@/utils/format';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { carIcons } from '@/lib/specIcons';
import { fuelChip } from '@/lib/fuelBadge';
import { translateCountry } from '@/utils/locationUtils';
import useCardExtras from '@/hooks/useCardExtras';
import { useCompare } from '@/components/compare/CompareContext';
import { useFavorites } from '@/components/favorites/FavoritesContext';
import FeaturedCardImage from '@/components/cars/FeaturedCardImage';
import PromoPhotoFrame from '@/components/cars/PromoPhotoFrame';
import TileActions from '@/components/cars/TileActions';
import CarGridSkeleton from '@/components/cars/CarGridSkeleton';
import DiscountTag from '@/components/cars/DiscountTag';
import PriceRatingBadge from '@/components/cars/PriceRatingBadge';
import TransmissionOrEnergy from '@/components/cars/TransmissionOrEnergy';
import { Panel, Chip } from '@/components/ds';

const TOP_COUNT = 5;
const hasPhoto = (c) => typeof c.images?.[0] === 'string' && c.images[0].trim().startsWith('http');

/** Top listings = active premium listings with a photo, newest first. Shared with "New listings". */
export function useTopCars() {
  return useQuery({
    queryKey: ['homeTopCars'],
    queryFn: async () => (await entities.Car.filter({ status: 'active', is_premium: true }, '-created_date', TOP_COUNT * 3))
      .filter(hasPhoto).slice(0, TOP_COUNT),
    staleTime: 5 * 60 * 1000,
  });
}

const icon = (src, invert = true) => <img src={src} alt="" className={cn('h-3.5 w-3.5 flex-shrink-0', invert && 'invert')} />;

function MainCard({ car, rating }) {
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addCar, removeCar, isInCompare } = useCompare();
  const fuel = car.fuel_type ? fuelChip(car.fuel_type, carIcons.fuel) : null;
  const discount = car.original_price > car.price ? car.original_price - car.price : 0;
  const favorite = isFavorite(car.id);
  const compared = isInCompare(car.id);
  const stop = (fn) => (e) => { e.preventDefault(); fn(); };
  const squareBtn = (on) => cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-colors',
    on ? 'border-brand bg-brand/15 text-brand-text' : 'border-transparent bg-raised text-ink-2 hover:text-ink');

  return (
    <Link to={getCarDetailsPath(car)} className="group flex flex-col overflow-hidden rounded-xl border border-line bg-page transition-colors hover:border-brand/60 sm:flex-row">
      <PromoPhotoFrame promotion={null} exclusive={!!car.exclusive_listing} radiusClass="rounded-lg" notchClass="bg-page"
        className="m-2 min-h-44 bg-raised sm:w-[40%] sm:flex-shrink-0 lg:min-h-52">
        <FeaturedCardImage car={car} />
      </PromoPhotoFrame>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-3 sm:pl-2">
        <div>
          <h3 className="text-lg font-bold leading-tight text-ink">
            {car.brand} {car.model} {car.year && <span className="font-semibold text-ink-3">{car.year}</span>}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {car.mileage != null && <Chip icon={icon(carIcons.mileage)}>{formatNumber(car.mileage)} {t('car.km')}</Chip>}
            {car.engine_power && <Chip icon={icon(carIcons.speed)}>{Math.round(car.engine_power * 0.7355)} {t('car.kw')}</Chip>}
            {fuel && <Chip style={fuel.style} icon={<img src={fuel.icon} alt="" className={cn('h-3.5 w-3.5 flex-shrink-0', fuel.iconClass)} />}>{t('fuel_types.' + car.fuel_type)}</Chip>}
            <TransmissionOrEnergy car={car} size="lg">
              {car.transmission && <Chip icon={icon(carIcons.transmission)}>{t('transmission_types.' + car.transmission)}</Chip>}
            </TransmissionOrEnergy>
            {car.drive_type && <Chip icon={icon(carIcons.drive)}>{t('home.drive_' + car.drive_type)}</Chip>}
            {car.body_type && <Chip icon={icon(carIcons.body)}>{t('body_types.' + car.body_type)}</Chip>}
            {car.country && <Chip icon={icon(carIcons.location)}>{translateCountry(null, car.country)}</Chip>}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="text-2xl font-bold leading-none text-ink">{formatPrice(car.price)}</span>
              {discount > 0 && (
                <>
                  <span className="text-xs text-ink-3 line-through">{formatPrice(car.original_price)}</span>
                  <DiscountTag label={`-${formatPrice(discount)}`} />
                </>
              )}
            </div>
            <PriceRatingBadge score={rating?.score} className="mt-1 items-end text-right" />
          </div>
          <div className="flex gap-2">
            <span className="flex h-10 flex-1 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white transition-colors group-hover:bg-brand-hover">
              {t('home.view_details', 'Подробнее')}
            </span>
            <button type="button" aria-label={t('car.add_favorite')} aria-pressed={favorite} className={squareBtn(favorite)} onClick={stop(() => toggleFavorite(car.id))}>
              <Heart className={cn('h-4 w-4', favorite && 'fill-current')} />
            </button>
            <button type="button" aria-label={t('compare.add', 'Compare')} aria-pressed={compared} className={squareBtn(compared)} onClick={stop(() => (compared ? removeCar(car.id) : addCar(car)))}>
              <GitCompare className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

// The original small Top card: photo on the left, name + year, price, mileage, fuel and gearbox pills.
function SmallCard({ car, rating }) {
  const { t } = useTranslation();
  const fuel = car.fuel_type ? fuelChip(car.fuel_type, carIcons.fuel) : null;
  const discount = car.original_price > car.price ? car.original_price - car.price : 0;
  const pill = 'inline-flex items-center gap-1 rounded-lg bg-raised px-2 py-1 text-sm font-semibold text-ink-2';
  return (
    <Link to={getCarDetailsPath(car)} className="tile-card group flex min-h-[132px] overflow-hidden rounded-xl border border-line bg-page transition-colors hover:border-brand/60">
      <PromoPhotoFrame promotion={null} exclusive={!!car.exclusive_listing} radiusClass="rounded-none" className="w-[40%] flex-shrink-0 bg-raised">
        {car.images?.[0]
          ? <img src={car.images[0]} alt={car.title} className="h-full w-full object-cover" />
          : <div className="flex h-full w-full items-center justify-center"><Car className="h-6 w-6 text-ink-3" /></div>}
        <TileActions car={car} />
      </PromoPhotoFrame>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 overflow-hidden p-3">
        <div className="truncate text-sm font-bold leading-tight text-ink transition-colors group-hover:text-brand-text">
          {car.brand} {car.model}{car.year && <span className="ml-1 font-normal text-ink-3">{car.year}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-base font-bold leading-tight text-ink">{formatPrice(car.price)}</span>
          {discount > 0 && <DiscountTag label={`-${formatPrice(discount)}`} />}
          <PriceRatingBadge score={rating?.score} showLabel={false} />
        </div>
        {car.mileage != null && <span className={cn(pill, 'self-start')}>{icon(carIcons.mileage)}{formatNumber(car.mileage)} {t('car.km')}</span>}
        <div className="flex flex-wrap items-center gap-1">
          {fuel && <span style={fuel.style} className={pill}><img src={fuel.icon} alt="" className={cn('h-3.5 w-3.5 flex-shrink-0', fuel.iconClass)} />{t('fuel_types.' + car.fuel_type)}</span>}
          <TransmissionOrEnergy car={car} size="md" radius="rounded-lg">
            {car.transmission && <span className={pill}>{icon(carIcons.transmission)}{t('transmission_types.' + car.transmission)}</span>}
          </TransmissionOrEnergy>
        </div>
      </div>
    </Link>
  );
}

export default function TopListings({ className }) {
  const { t } = useTranslation();
  const { data: cars = [], isLoading } = useTopCars();
  const { ratings } = useCardExtras(cars);
  if (!isLoading && !cars.length) return null;
  const [main, ...rest] = cars;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Desktop: big card on the left, the four small ones in a 2×2 grid on the right */}
      <Panel title={t('home.top_listings', 'Топ объявления')} className="flex-1" bodyClassName="grid gap-3 p-2 sm:p-3 md:p-3 lg:grid-cols-2">
        {isLoading ? <CarGridSkeleton count={4} className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-2" /> : (
          <>
            <MainCard car={main} rating={ratings[main.id]} />
            {rest.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:auto-rows-fr">
                {rest.map((car) => <SmallCard key={car.id} car={car} rating={ratings[car.id]} />)}
              </div>
            )}
          </>
        )}
      </Panel>
      <Link to={createPageUrl('Catalog')} className="flex h-10 items-center justify-center gap-1.5 rounded-xl text-sm font-medium text-brand-text transition-colors hover:bg-surface">
        {t('home.see_all_listings')} <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
