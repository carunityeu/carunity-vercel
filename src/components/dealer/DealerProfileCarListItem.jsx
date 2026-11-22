import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { translateColor } from '@/utils/colorUtils';
import DealerProfileCarSpecs from '@/components/dealer/DealerProfileCarSpecs';
import DealerProfileCarActions from '@/components/dealer/DealerProfileCarActions';

export default function DealerProfileCarListItem({ car, dealer }) {
  const { t, i18n } = useTranslation();
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card sm:flex-row">
      <Link to={getCarDetailsPath(car)} className="block shrink-0 sm:w-52 md:w-64">
        <div className="aspect-[4/3] h-full overflow-hidden bg-input">
          {car.images?.[0] ? <img src={car.images[0]} alt={car.title || `${car.brand} ${car.model}`} loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Car className="h-10 w-10 text-muted-foreground" /></div>}
        </div>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1"><Link to={getCarDetailsPath(car)} className="break-words text-base font-bold leading-tight text-foreground hover:text-primary sm:text-lg">{car.brand} {car.model}</Link>{car.color && <p className="mt-1 text-xs text-muted-foreground">{translateColor(car.color, i18n)}</p>}</div>
            <div className="shrink-0 text-right">{car.price != null && <p className="text-lg font-bold text-primary sm:text-xl">{new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(car.price)}</p>}<p className="text-xs text-muted-foreground">{t('dealer.on_order')}</p></div>
          </div>
          <DealerProfileCarSpecs car={car} />
        </div>
        <DealerProfileCarActions car={car} dealer={dealer} />
      </div>
    </article>
  );
}