import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { entities } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import useCardExtras from '@/hooks/useCardExtras';
import { Container } from '@/components/ds';
import ListingTile from '@/components/cars/ListingTile';

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

// Phones: one tile and the edge of the next (so it is clear the row swipes); tablets 2.5; desktop 4.
const ITEM = 'w-[82%] flex-shrink-0 snap-start sm:w-[40%] lg:w-[calc((100%-3*1.25rem)/4)]';
const ARROW = 'absolute z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-page/90 text-ink shadow-lg lg:flex lg:disabled:hidden';

export default function TopListings() {
  const { t } = useTranslation();
  const { data: cars = [], isLoading } = useTopCars();
  const { ratings } = useCardExtras(cars);
  const rowRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [photoMid, setPhotoMid] = useState(0); // arrows sit at the vertical middle of the photos

  const updateEdges = () => {
    const row = rowRef.current;
    if (row) setEdges({ start: row.scrollLeft <= 4, end: row.scrollLeft + row.clientWidth >= row.scrollWidth - 4 });
  };
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return undefined;
    const measure = () => {
      const tile = row.firstElementChild;
      if (tile) setPhotoMid((tile.offsetWidth * 3) / 4 / 2); // photos are 4:3
      updateEdges();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [cars.length, isLoading]);

  if (!isLoading && !cars.length) return null;
  const scroll = (dir) => rowRef.current?.scrollBy({ left: dir * rowRef.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <Container as="section" className="py-6 sm:py-8" aria-labelledby="top-listings-title">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 id="top-listings-title" className="text-xl font-bold text-ink sm:text-2xl">{t('home.top_listings', 'Топ объявления')}</h2>
        <Link to={createPageUrl('Catalog')} className="flex-shrink-0 text-sm font-medium text-brand-text">{t('home.see_all', 'Все')}</Link>
      </div>

      <div className="relative">
        <button type="button" aria-label="←" disabled={edges.start} onClick={() => scroll(-1)} className={cn(ARROW, '-left-5')} style={{ top: photoMid }}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div ref={rowRef} onScroll={updateEdges}
          className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:gap-5 lg:scroll-px-0 lg:px-0">
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => <div key={i} className={cn(ITEM, 'aspect-[3/4] animate-pulse rounded-xl bg-surface')} />)
            : cars.map((car) => <div key={car.id} className={ITEM}><ListingTile car={car} rating={ratings[car.id]} /></div>)}
        </div>
        <button type="button" aria-label="→" disabled={edges.end} onClick={() => scroll(1)} className={cn(ARROW, '-right-5')} style={{ top: photoMid }}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </Container>
  );
}
