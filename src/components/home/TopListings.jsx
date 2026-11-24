import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { entities } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import useCardExtras from '@/hooks/useCardExtras';
import CompactCarCard from '@/components/cars/CompactCarCard';
import { Button } from '@/components/ui/button';

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

// Card widths in the row: phones see 1 card and the edge of the next (so it is clear the row
// swipes), tablets 2.5, desktop 4 with arrows.
const ITEM = 'w-[78%] flex-shrink-0 snap-start sm:w-[40%] lg:w-[calc((100%-3*1rem)/4)]';

export default function TopListings({ className }) {
  const { t } = useTranslation();
  const { data: cars = [], isLoading } = useTopCars();
  const { ratings, promotions } = useCardExtras(cars);
  const rowRef = useRef(null);
  if (!isLoading && !cars.length) return null;

  const scroll = (dir) => {
    const row = rowRef.current;
    if (row) row.scrollBy({ left: dir * row.clientWidth * 0.75, behavior: 'smooth' });
  };

  return (
    <section className={className} aria-labelledby="top-listings-title">
      <div className="mb-3 flex items-center gap-2">
        <h2 id="top-listings-title" className="text-xl font-bold text-ink sm:text-2xl">{t('home.top_listings', 'Топ объявления')}</h2>
        <span className="rounded-md bg-brand/15 px-2 py-0.5 text-xs font-semibold text-brand-text">{t('home.top_badge', 'Премиум')}</span>
        <Link to={createPageUrl('Catalog')} className="ml-auto flex items-center gap-0.5 text-sm font-medium text-brand-text hover:underline">
          {t('home.see_all', 'Все')}<ChevronRight className="h-4 w-4" />
        </Link>
        <div className="hidden gap-1 lg:flex">
          <Button variant="secondary" size="icon" aria-label="←" onClick={() => scroll(-1)}><ChevronLeft /></Button>
          <Button variant="secondary" size="icon" aria-label="→" onClick={() => scroll(1)}><ChevronRight /></Button>
        </div>
      </div>

      {/* Full-bleed on phones so cards can be swiped from edge to edge */}
      <div ref={rowRef} className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:gap-4 lg:scroll-px-0 lg:px-0">
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => <div key={i} className={cn(ITEM, 'aspect-[3/4] animate-pulse rounded-xl bg-surface')} />)
          : cars.map((car) => (
            <div key={car.id} className={ITEM}>
              <CompactCarCard car={car} rating={ratings[car.id]} promotion={promotions[car.id]} />
            </div>
          ))}
      </div>
    </section>
  );
}
