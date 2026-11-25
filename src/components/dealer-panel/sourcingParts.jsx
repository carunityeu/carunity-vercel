// Shared pieces of the "Закупка" section: car tiles in the site style (ListingTile) with the
// dealer's actions under them, offer rows, the offer dialog look.
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Car, Loader2 } from 'lucide-react';
import { usePricePool } from '@/hooks/useCardExtras';
import { rateCars } from '@/lib/priceRating';
import { cn } from '@/lib/utils';
import ListingTile from '@/components/cars/ListingTile';

/** Same grid as the home page tiles, narrower because the panel has a sidebar. */
export const TILE_GRID = 'grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3';

/** Dialog content on tokens (instead of the old hex colors). */
export const DIALOG = 'w-[calc(100%-2rem)] max-w-md max-h-[90dvh] overflow-y-auto border-line bg-surface text-ink';
export const LABEL = 'mb-1.5 block text-sm font-medium text-ink-2';

/** Price ratings for a list of cars, the same way the catalog computes them. */
export function useRatings(cars) {
  const { data: pool } = usePricePool(cars.length > 0);
  const key = cars.map((c) => c.id).join(',');
  return useMemo(() => (pool ? rateCars(cars, pool) : {}), [pool, key]);
}

/** A listing tile with a row of dealer actions under it. */
export function SourcingTile({ car, rating, children }) {
  return (
    <div className="flex flex-col">
      <ListingTile car={car} rating={rating} />
      {children && <div className="mt-3 flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function Loading() {
  return <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-brand-text" /></div>;
}

/** Small photo for offer rows. */
export function Thumb({ src, to }) {
  const img = src
    ? <img src={src} alt="" className="h-full w-full object-cover" />
    : <div className="flex h-full w-full items-center justify-center"><Car className="h-5 w-5 text-ink-3" /></div>;
  const cls = 'h-[60px] w-24 flex-shrink-0 overflow-hidden rounded-xl bg-raised';
  return to ? <Link to={to} className={cls}>{img}</Link> : <div className={cls}>{img}</div>;
}

const TONES = {
  pending: 'bg-amber-500/15 text-amber-300',
  accepted: 'bg-brand/15 text-brand-text',
  completed: 'bg-brand/15 text-brand-text',
  deal_in_progress: 'bg-sky-500/15 text-sky-300',
  rejected: 'bg-red-500/15 text-red-300',
  cancelled: 'bg-red-500/15 text-red-300',
  expired: 'bg-raised text-ink-2',
};
/** Status of a sent offer. */
export function OfferStatus({ status, label, className }) {
  return <span className={cn('inline-flex h-6 items-center rounded-md px-2 text-xs font-semibold', TONES[status] || TONES.pending, className)}>{label}</span>;
}
