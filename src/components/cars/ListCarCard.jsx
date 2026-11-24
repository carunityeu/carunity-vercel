import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import requireAccount from '@/components/auth/requireAccount';
import { formatPrice, formatNumber } from '@/utils/format';
import { Car, ChevronLeft, ChevronRight, GitCompareArrows, Heart, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCompare } from '@/components/compare/CompareContext';
import { useFavorites } from '@/components/favorites/FavoritesContext';
import { translateLocation } from '@/utils/locationUtils';
import PriceRatingBadge from '@/components/cars/PriceRatingBadge';
import DiscountTag from '@/components/cars/DiscountTag';
import ListSellerBlock from '@/components/cars/ListSellerBlock';
import { fuelChip } from '@/lib/fuelBadge';
import PromoPhotoFrame from '@/components/cars/PromoPhotoFrame';
import TransmissionOrEnergy from '@/components/cars/TransmissionOrEnergy';
import RegistrationFeeLine from '@/components/cars/RegistrationFeeLine';
import { isElectricAccent, accentClasses } from '@/lib/electricAccent';

const carIcons = {
  fuel: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/6feb2f9c7_gas-station1.png',
  transmission: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/5bf7d42bf_gearbox3.png',
  mileage: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/f3a09dd47_road-perspective.png',
  speed: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/e4b346d84_speedometer1.png',
  engine: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/8312588b3_piston.png',
  drive: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/acf090957_4wd.png',
  body: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/04d21af6a_car.png',
  consumption: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/b30a6448e_fuelconsumptionicon.png',
  pin: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/042a078cf_pin.png',
};

const Tile = ({ icon, iconClass = 'dark:invert', style, children }) => (
  <span
    style={style}
    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
    {icon && <img src={icon} alt="" className={`w-3.5 h-3.5 flex-shrink-0 ${iconClass}`} />}
    {children}
  </span>
);

export default function ListCarCard({ car, showLocation = false, rating = null, promotion = null, onFavoriteToggle = null, dealer = null }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [imgIndex, setImgIndex] = useState(0);
  const { addCar, removeCar, isInCompare } = useCompare();
  const { isFavorite, toggleFavorite } = useFavorites();
  const inCompare = isInCompare(car.id);
  const fav = onFavoriteToggle ? true : isFavorite(car.id);
  const inactive = car.status !== 'active';
  const CardLink = car.is_missing ? 'div' : Link;
  const accent = accentClasses(!inactive && isElectricAccent(car));

  const images = car.images?.filter(Boolean).length > 0 ? car.images.filter(Boolean) : null;
  const total = images ? images.length : 0;

  const formatMileage = (m) =>
    formatNumber(m);

  const fuel = car.fuel_type ? fuelChip(car.fuel_type, carIcons.fuel) : null;

  const prevImg = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (total > 1) setImgIndex((i) => (i - 1 + total) % total);
  };
  const nextImg = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (total > 1) setImgIndex((i) => (i + 1) % total);
  };
  const toggleFav = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (onFavoriteToggle) onFavoriteToggle(car.id);
    else toggleFavorite(car.id);
  };
  const toggleCompare = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!inactive) inCompare ? removeCar(car.id) : addCar(car);
  };
  const goWrite = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (inactive) return;
    const path = getCarDetailsPath(car);
    const destination = `${path}${path.includes('?') ? '&' : '?'}contact=1`;
    if (await requireAccount(destination)) navigate(destination);
  };

  const powerKw = car.engine_power ? Math.round(car.engine_power * 0.735) : null;
  const consumption = car.fuel_consumption_combined;
  const originalPrice = car.original_price != null ? Number(car.original_price) : null;
  const hasDiscount = originalPrice != null && originalPrice > Number(car.price || 0);
  const discountAmount = hasDiscount ? originalPrice - Number(car.price) : 0;

  return (
    <CardLink {...(!car.is_missing ? { to: getCarDetailsPath(car) } : {})} className={`block tile-card ${inactive ? 'grayscale opacity-70' : ''}`}>
      <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-lg transition-all duration-200">
       <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <PromoPhotoFrame
          promotion={promotion}
          exclusive={!!car.exclusive_listing}
          radiusClass="rounded-none"
          notchClass="bg-white dark:bg-slate-900"
          className="sm:w-52 md:w-64 flex-shrink-0 bg-slate-100 dark:bg-slate-800"
          style={{ aspectRatio: '4/3' }}>
          {images ? (
            <img src={images[imgIndex]} alt={car.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car className="w-10 h-10 text-slate-400" />
            </div>
          )}

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={prevImg}
                className="tile-photo-nav absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center"
                aria-label={t('catalog.prev', 'Назад')}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextImg}
                className="tile-photo-nav absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center"
                aria-label={t('catalog.next', 'Далее')}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </PromoPhotoFrame>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col min-w-0">
          {/* Header: title + price */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-tight truncate">
                {car.is_missing ? t('car.not_found_title') : `${car.brand || ''} ${car.model || ''}`}
                {car.year && <span className="text-slate-400 dark:text-slate-400 font-semibold text-sm ml-1">({car.year})</span>}
              </h3>
              {inactive && <span className="mt-1 inline-flex rounded-md border border-border bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">{t('car.inactive')}</span>}
              {car.trim_level && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-tight truncate mt-0.5">
                  {car.trim_level}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                {!inactive && <PriceRatingBadge score={rating?.score} />}
                <span className="font-bold text-slate-900 dark:text-white text-lg sm:text-xl leading-none">
                  {car.price != null ? formatPrice(car.price) : '—'}
                </span>
              </div>
              {hasDiscount && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px] sm:text-xs text-slate-400 line-through whitespace-nowrap">
                    {formatPrice(originalPrice)}
                  </span>
                  <DiscountTag label={`-${formatPrice(discountAmount)}`} electric={isElectricAccent(car)} />
                </div>
              )}
              <RegistrationFeeLine car={car} />
            </div>
          </div>

          {/* Spec tiles */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {car.mileage != null && (
              <Tile icon={carIcons.mileage}>{formatMileage(car.mileage)} {t('car.km')}</Tile>
            )}
            {fuel && (
              <Tile icon={fuel.icon} iconClass={fuel.iconClass} style={fuel.style}>
                {t('fuel_types.' + car.fuel_type, car.fuel_type)}
              </Tile>
            )}
            <TransmissionOrEnergy car={car}>
              {car.transmission && <Tile icon={carIcons.transmission}>{t('transmission_types.' + car.transmission, car.transmission)}</Tile>}
            </TransmissionOrEnergy>
            {powerKw != null && <Tile icon={carIcons.speed}>{powerKw} {t('car.kw')}</Tile>}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {car.engine_volume && <Tile icon={carIcons.engine}>{car.engine_volume} {t('car.liters', 'л')}</Tile>}
            {car.drive_type && <Tile icon={carIcons.drive}>{t('drive_types.' + car.drive_type, car.drive_type)}</Tile>}
            {car.body_type && <Tile icon={carIcons.body}>{t('body_types.' + car.body_type, car.body_type)}</Tile>}
            {consumption != null && <Tile icon={carIcons.consumption}>{consumption} {t('car.l_100km', 'л/100км')}</Tile>}
            {car.condition && <Tile>{t('condition.' + car.condition, car.condition)}</Tile>}
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-1 text-slate-400 text-xs sm:text-sm min-w-0">
              {dealer ? (
                <ListSellerBlock dealer={dealer} />
              ) : (showLocation && (car.location || car.country)) ? (
                <>
                  <img src={carIcons.pin} alt="" className="w-3.5 h-3.5 flex-shrink-0 invert dark:invert" />
                  <span className="truncate">{translateLocation(t, car.location, car.country)}</span>
                </>
              ) : (
                car.condition && <span className="truncate">{t('condition.' + car.condition, car.condition)}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={goWrite}
                disabled={inactive}
                className={`inline-flex items-center gap-1.5 h-8 px-2 sm:px-3 rounded-lg text-white text-xs sm:text-sm font-semibold transition-colors ${accent.solidButton}`}
                title={t('car.write_seller', 'Написать продавцу')}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">{t('car.write_seller', 'Написать продавцу')}</span>
              </button>
              <button
                type="button"
                onClick={toggleCompare}
                disabled={inactive}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${inCompare ? accent.iconActive : accent.iconIdle}`}
                title={inCompare ? t('compare.remove', 'Убрать из сравнения') : t('compare.add', 'Добавить к сравнению')}
              >
                <GitCompareArrows className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={toggleFav}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${fav ? accent.iconActive : accent.iconIdle}`}
                title={fav ? t('car.remove_from_wishlist', 'Убрать из избранного') : t('car.add_to_wishlist', 'В избранное')}
              >
                <Heart className={`w-4 h-4 ${fav ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>
        </div>
       </div>
      </div>
    </CardLink>
  );
}