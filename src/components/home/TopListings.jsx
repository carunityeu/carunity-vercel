import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Car, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { entities } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { formatNumber, formatPrice } from '@/utils/format';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { carIcons } from '@/lib/specIcons';
import { fuelChip } from '@/lib/fuelBadge';
import { translateLocation } from '@/utils/locationUtils';
import useCardExtras from '@/hooks/useCardExtras';
import FavoriteButton from '@/components/cars/FavoriteButton';
import DiscountTag from '@/components/cars/DiscountTag';
import PriceRatingBadge from '@/components/cars/PriceRatingBadge';
import TransmissionOrEnergy from '@/components/cars/TransmissionOrEnergy';
import { Container, Panel } from '@/components/ds';

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

// Spec pills sit on the panel in the page colour (mobile.de style)
const PILL = 'inline-flex items-center gap-1.5 rounded-md bg-page px-2 py-1 text-xs font-semibold text-ink-2 sm:text-sm';
const icon = (src, extra = 'invert') => <img src={src} alt="" className={cn('h-3.5 w-3.5 flex-shrink-0', extra)} />;

// One listing in the slider: no own background — photo, name, price with its rating, spec pills, place.
function SlideCard({ car, rating }) {
  const { t } = useTranslation();
  const fuel = car.fuel_type ? fuelChip(car.fuel_type, carIcons.fuel) : null;
  const discount = car.original_price > car.price ? car.original_price - car.price : 0;
  const kw = car.engine_power ? Math.round(car.engine_power * 0.7355) : null;
  const location = (car.location || car.country) && translateLocation(t, car.location, car.country);

  return (
    <Link to={getCarDetailsPath(car)} className="flex h-full flex-col">
      <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-raised">
        {car.images?.[0]
          ? <img src={car.images[0]} alt={`${car.brand} ${car.model}`} loading="lazy" className="h-full w-full object-cover" />
          : <div className="flex h-full w-full items-center justify-center"><Car className="h-8 w-8 text-ink-3" /></div>}
        <FavoriteButton carId={car.id} />
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <h3 className="truncate text-base font-bold text-ink">
          {car.brand} {car.model} {car.year && <span className="font-normal text-ink-3">{car.year}</span>}
        </h3>
        {car.trim_level && <p className="truncate text-xs text-ink-3">{car.trim_level}</p>}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-xl font-bold text-ink">{formatPrice(car.price)}</span>
          {discount > 0 && <DiscountTag label={`-${formatPrice(discount)}`} />}
        </div>
        {/* Price rating with its label, like mobile.de's "good price" bar */}
        <PriceRatingBadge score={rating?.score} className="mt-1" />

        <div className="mt-3 flex flex-wrap gap-1.5">
          {car.mileage != null && <span className={PILL}>{icon(carIcons.mileage)}{formatNumber(car.mileage)} {t('car.km')}</span>}
          {kw && <span className={PILL}>{icon(carIcons.speed)}{kw} {t('car.kw')}</span>}
          {fuel && <span className={PILL} style={fuel.style}><img src={fuel.icon} alt="" className={cn('h-3.5 w-3.5 flex-shrink-0', fuel.iconClass)} />{t('fuel_types.' + car.fuel_type)}</span>}
          <TransmissionOrEnergy car={car} size="md" radius="rounded-md">
            {car.transmission && <span className={PILL}>{icon(carIcons.transmission)}{t('transmission_types.' + car.transmission)}</span>}
          </TransmissionOrEnergy>
        </div>

        {location && (
          <p className="mt-auto flex items-center gap-1 pt-3 text-xs text-ink-3">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" /><span className="truncate">{location}</span>
          </p>
        )}
      </div>
    </Link>
  );
}

// Phones: one card and the edge of the next (so it is clear the row swipes); tablets 2.5; desktop 4.
const ITEM = 'w-[78%] flex-shrink-0 snap-start sm:w-[40%] lg:w-[calc((100%-3*1.25rem)/4)]';

export default function TopListings() {
  const { t } = useTranslation();
  const { data: cars = [], isLoading } = useTopCars();
  const { ratings } = useCardExtras(cars);
  const rowRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = () => {
    const row = rowRef.current;
    if (row) setEdges({ start: row.scrollLeft <= 4, end: row.scrollLeft + row.clientWidth >= row.scrollWidth - 4 });
  };
  useEffect(updateEdges, [cars.length]);

  if (!isLoading && !cars.length) return null;
  const scroll = (dir) => rowRef.current?.scrollBy({ left: dir * rowRef.current.clientWidth * 0.8, behavior: 'smooth' });
  const arrow = 'flex h-9 w-9 items-center justify-center rounded-full bg-page text-ink disabled:opacity-30';

  return (
    <Container as="section" className="py-6 sm:py-8" aria-labelledby="top-listings-title">
      <Panel
        title={(
          <span id="top-listings-title" className="flex items-center gap-2 text-xl sm:text-2xl">
            {t('home.top_listings', 'Топ объявления')}
            <span className="rounded-md bg-brand/15 px-2 py-0.5 text-xs font-semibold text-brand-text">{t('home.top_badge', 'Премиум')}</span>
          </span>
        )}
        action={(
          <div className="flex items-center gap-2">
            <Link to={createPageUrl('Catalog')} className="text-sm font-medium text-brand-text">{t('home.see_all', 'Все')}</Link>
            <div className="hidden gap-1 lg:flex">
              <button type="button" aria-label="←" disabled={edges.start} onClick={() => scroll(-1)} className={arrow}><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" aria-label="→" disabled={edges.end} onClick={() => scroll(1)} className={arrow}><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
        bodyClassName="px-0 pb-5 md:px-0">
        <div ref={rowRef} onScroll={updateEdges}
          className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 md:scroll-px-5 md:px-5 lg:gap-5">
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => <div key={i} className={cn(ITEM, 'aspect-[3/4] animate-pulse rounded-xl bg-raised')} />)
            : cars.map((car) => <div key={car.id} className={ITEM}><SlideCard car={car} rating={ratings[car.id]} /></div>)}
        </div>
      </Panel>
    </Container>
  );
}
