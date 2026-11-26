import React from 'react';
import { Heart, Share2, Eye, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { carIcons } from '@/lib/specIcons';
import { fuelChip } from '@/lib/fuelBadge';
import { translateLocation } from '@/utils/locationUtils';
import useCardExtras from '@/hooks/useCardExtras';
import DiscountTag from '@/components/cars/DiscountTag';
import PriceRatingBadge from '@/components/cars/PriceRatingBadge';
import { ApproxTag } from '@/components/ds';
import TransmissionOrEnergy from '@/components/cars/TransmissionOrEnergy';
import { isElectricAccent } from '@/lib/electricAccent';

const CALENDAR_ICON = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/d58467efb_icons8-calendar-96.png';
const CHIP = 'inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200';
const SQUARE_BTN = 'h-10 w-10 flex-shrink-0 rounded-lg border-0 bg-slate-800 p-0 text-slate-200 hover:bg-slate-700 hover:text-white';

const formatPrice = (price) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);

// Left card of the car page: title, price, key specs, seller and the action buttons
export default function CarSummaryCard({ car, dealer, isOwner, isFavorite, onContact, onOffer, onFavorite, onShare, readOnly = false }) {
  const { t } = useTranslation();
  const { ratings, promotions } = useCardExtras(readOnly ? [] : [car]);
  const fuel = car.fuel_type ? fuelChip(car.fuel_type, carIcons.fuel) : null;
  const hasDiscount = car.original_price && car.original_price > car.price;
  const date = car.month_of_manufacture ? `${String(car.month_of_manufacture).padStart(2, '0')}/${car.year}` : `${car.year}`;
  const sellerName = car.seller_type === 'dealer' && dealer ? dealer.name : t('car.private_label', 'Частный продавец');
  const stars = car.seller_type === 'dealer' && dealer?.rating ? Math.round(dealer.rating) : 0;

  if (readOnly) return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <h1 className="break-words text-xl font-bold text-foreground md:text-2xl">{car.brand} {car.model} {car.year}</h1>
      <p className="mt-3 text-2xl font-bold text-foreground md:text-3xl">{formatPrice(car.price)}</p>
    </div>
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h1 className="text-xl font-bold leading-tight text-white md:text-2xl">{car.brand} {car.model}</h1>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-2xl font-bold text-white md:text-3xl">{formatPrice(car.price)}</span>
        {hasDiscount && <span className="text-sm text-slate-500 line-through">{formatPrice(car.original_price)}</span>}
        {hasDiscount && <DiscountTag label={`-${formatPrice(car.original_price - car.price)}`} electric={isElectricAccent(car)} />}
      </div>
      {ratings[car.id]?.score && (
        <div className="mt-2 flex items-end gap-2">
          <PriceRatingBadge score={ratings[car.id]?.score} />
          <ApproxTag />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {car.year && (
          <span className={CHIP}><img src={CALENDAR_ICON} alt="" className="h-4 w-4 flex-shrink-0" />{date}</span>
        )}
        {car.mileage != null && (
          <span className={CHIP}><img src={carIcons.mileage} alt="" className="h-4 w-4 flex-shrink-0 invert" />{new Intl.NumberFormat('ru-RU').format(car.mileage)} {t('car.km')}</span>
        )}
        {fuel && (
          <span className={CHIP} style={fuel.style}><img src={fuel.icon} alt="" className={`h-4 w-4 flex-shrink-0 ${fuel.iconClass}`} />{t('fuel_types.' + car.fuel_type, car.fuel_type)}</span>
        )}
        <TransmissionOrEnergy car={car} size="lg" radius="rounded-md">
          {car.transmission && (
            <span className={CHIP}><img src={carIcons.transmission} alt="" className="h-4 w-4 flex-shrink-0 invert" />{t('transmission_types.' + car.transmission, car.transmission)}</span>
          )}
        </TransmissionOrEnergy>
        {car.engine_power && (
          <span className={CHIP}><img src={carIcons.speed} alt="" className="h-4 w-4 flex-shrink-0 invert" />{Math.round(car.engine_power * 0.7355)} {t('car.kw', 'кВт')}</span>
        )}
        {car.drive_type && (
          <span className={CHIP}><img src={carIcons.drive} alt="" className="h-4 w-4 flex-shrink-0 invert" />{t('drive_types.' + car.drive_type, car.drive_type)}</span>
        )}
      </div>

      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-white">{sellerName}</p>
          {stars > 0 && (
            <span className="flex">{[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={cn('h-3.5 w-3.5', i <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-600')} />
            ))}</span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-400">{translateLocation(t, car.location, car.country)}</p>
      </div>

      <div className="mt-4 space-y-2">
        <Button className="h-11 w-full bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600" disabled={isOwner} onClick={onContact}>
          {isOwner ? t('car.your_listing') : t('car.write_seller')}
        </Button>
        <div className="flex gap-2">
          <Button className="h-10 flex-1 rounded-lg border-0 bg-slate-800 text-sm font-semibold text-slate-100 hover:bg-slate-700" onClick={onOffer}>
            {t('car.make_offer')}
          </Button>
          <Button aria-label={t('car.add_favorite')} className={cn(SQUARE_BTN, isFavorite && 'bg-emerald-500 text-white hover:bg-emerald-600')} onClick={onFavorite}>
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          </Button>
          <Button aria-label={t('car.share', 'Share')} className={SQUARE_BTN} onClick={onShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isOwner && (
        <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-slate-800 pt-3 text-xs text-slate-400">
          <Eye className="h-3.5 w-3.5" />{car.views_count || 0} {t('car.views')}
        </div>
      )}
    </div>
  );
}