import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import formatComparison from '@/components/compare/formatComparison';
export default function CompareCarHeading({car,removeCar,t,language}) {
  const name=`${car.brand} ${car.model}`;
  return <article className="compare-car overflow-hidden rounded-2xl border border-border bg-card">
    <div className="relative aspect-[16/10] bg-muted">
      {car.images?.[0]?<img src={car.images[0]} alt={name} className="h-full w-full object-cover"/>:<div className="flex h-full items-center justify-center text-xs text-muted-foreground">{t('car.no_photo')}</div>}
      <button type="button" aria-label={t('comparePage.remove',{name})} onClick={()=>removeCar(car.id)} className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-foreground"><X size={18}/></button>
      {car.is_premium&&<span className="absolute bottom-2 left-2 rounded-md bg-background px-2 py-1 text-xs font-semibold">TOP</span>}
    </div>
    <div className="space-y-2 p-3 sm:p-4">
      <h2 className="break-words text-sm font-semibold sm:text-base">{name}</h2>
      <p className="text-xs text-muted-foreground">{car.year}</p>
      <p className="text-base font-semibold sm:text-xl">{formatComparison(car,['price','','EUR'],t,language)}</p>
      <Link to={getCarDetailsPath(car)} className="flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-2 text-center text-xs font-medium hover:bg-secondary sm:text-sm">{t('comparePage.details')}</Link>
    </div>
  </article>;
}