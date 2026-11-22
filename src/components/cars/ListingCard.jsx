import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Fuel,
  Gauge,
  Calendar,
  MapPin,
  Zap,
  Cog,
  ArrowRight,
  GitCompareArrows,
  Users,
  Ruler,
  Package,
  Weight,
  Bed,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ELECTRIC_BOLT_ICON, ELECTRIC_CHIP_STYLE, ELECTRIC_ACCENT_ENABLED, isElectricFuel } from '@/lib/fuelBadge';
import { motion } from 'framer-motion';
import { useCompare } from '@/components/compare/CompareContext';
import { useFavorites } from '@/components/favorites/FavoritesContext';
import { translateLocation } from '@/utils/locationUtils';

// Build spec chips per vehicle type — keeps type-specific characteristics
function getVehicleSpecs(item, vehicleType, t) {
  const specs = [];
  if (item.year) specs.push({ icon: Calendar, label: String(item.year) });
  if (item.mileage != null) {
    specs.push({
      icon: Gauge,
      label: new Intl.NumberFormat('ru-RU').format(item.mileage) + ' ' + t('car.km'),
    });
  }
  if (item.fuel_type) {
    specs.push({
      icon: Fuel,
      label: t('fuel_types.' + item.fuel_type, item.fuel_type),
      electric: isElectricFuel(item.fuel_type),
    });
  }
  if (item.transmission) {
    specs.push({ icon: Cog, label: t('transmission_types.' + item.transmission, item.transmission) });
  }
  if (item.engine_power) {
    specs.push({
      icon: Zap,
      label: Math.round(item.engine_power * 0.7355) + ' ' + t('car.kw', 'кВт'),
    });
  }
  const nf = new Intl.NumberFormat('ru-RU');
  const specific = {
    bus: item.seats ? { icon: Users, label: item.seats + ' ' + t('listing.seats', 'мест') } : null,
    boat: item.length_m ? { icon: Ruler, label: item.length_m + ' m' } : null,
    truck: item.payload_kg ? { icon: Package, label: nf.format(item.payload_kg) + ' kg' } : null,
    trailer: item.payload_kg ? { icon: Package, label: nf.format(item.payload_kg) + ' kg' } : null,
    special: item.operating_weight ? { icon: Weight, label: nf.format(item.operating_weight) + ' kg' } : null,
    motorhome: item.berths ? { icon: Bed, label: item.berths + ' ' + t('listing.berths', 'сп.мест') } : null,
  };
  const sp = specific[vehicleType];
  if (sp) specs.push(sp);
  return specs.slice(0, 6);
}

export default function ListingCard({ item, vehicleType = 'car', linkTo }) {
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addCar, removeCar, isInCompare } = useCompare();
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageAreaRef = React.useRef(null);

  const isFav = isFavorite(item.id);
  const inCompare = isInCompare(item.id);

  const isCar = vehicleType === 'car';
  const href =
    linkTo ||
    (isCar
      ? getCarDetailsPath(item)
      : `/VehicleDetails?id=${item.id}&type=${vehicleType}`);

  const images = (item.images?.filter(Boolean) || []).slice(0, 4);

  useEffect(() => {
    if (isHovered && images.length > 1) {
      images.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [isHovered]);

  const handleMouseMove = (e) => {
    if (images.length <= 1) return;
    const rect = imageAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = (e.clientX - rect.left) / rect.width;
    const idx = Math.min(Math.floor(relX * images.length), images.length - 1);
    if (idx !== currentImageIndex) setCurrentImageIndex(idx);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0);
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(item.id);
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) removeCar(item.id);
    else addCar(item);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);

  const specs = getVehicleSpecs(item, vehicleType, t);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="h-full">
      <Link to={href} className="block h-full">
        <div className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 h-full flex flex-col">
          {/* Image */}
          <div
            ref={imageAreaRef}
            className="relative aspect-[4/3] overflow-hidden bg-slate-100"
            onMouseMove={handleMouseMove}>
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <div className="absolute bottom-0 left-0 right-0 flex gap-0.5 p-0">
                    {images.map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 h-1 transition-colors duration-100"
                        style={{
                          backgroundColor:
                            i === currentImageIndex ? '#059669' : 'rgba(255,255,255,0.6)',
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                <span className="text-slate-400 text-sm">{t('car.no_photo')}</span>
              </div>
            )}

            {/* New condition badge */}
            {item.condition === 'new' && !item.is_premium && (
              <div className="absolute top-3 left-3">
                <div className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-bold">
                  {t('conditions.new', 'Новый')}
                </div>
              </div>
            )}

            {/* Compare */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute top-2 sm:top-3 right-12 sm:right-14 w-8 h-8 sm:w-9 sm:h-9 rounded-full backdrop-blur-sm transition-all active:scale-95',
                inCompare
                  ? 'text-white hover:opacity-90'
                  : 'bg-white/90 text-slate-600 hover:bg-white'
              )}
              style={inCompare ? { backgroundColor: 'rgba(5,150,105,0.9)' } : {}}
              onClick={handleCompareClick}
              title={inCompare ? t('compare.remove', 'Убрать из сравнения') : t('compare.add', 'Добавить к сравнению')}>
              <GitCompareArrows className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>

            {/* Favorite */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 sm:top-3 right-2 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all active:scale-95"
              onClick={handleFavoriteClick}
              title={isFav ? t('car.remove_from_wishlist', 'Убрать из избранного') : t('car.add_to_wishlist', 'В избранное')}>
              <Heart
                className={cn(
                  'w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors',
                  isFav ? 'fill-current' : 'text-slate-600'
                )}
                style={isFav ? { color: 'rgba(5,150,105,1)' } : {}}
              />
            </Button>

            {/* Dealer badge */}
            <div className="absolute bottom-3 left-3 flex flex-col gap-2">
              {item.seller_type === 'dealer' && (
                <Badge
                  className="backdrop-blur-sm text-white border-0"
                  style={{ backgroundColor: 'rgba(5,150,105,0.85)' }}>
                  {t('car.dealer')}
                </Badge>
              )}
            </div>


          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 flex flex-col flex-1">
            <div className="mb-2 sm:mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg leading-tight line-clamp-1 group-hover:text-emerald-600 transition-colors">
                {item.brand} {item.model}
              </h3>
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="font-bold text-emerald-600 text-lg">{formatPrice(item.price)}</p>
                {item.original_price && item.original_price > item.price && (
                  <p className="text-sm text-slate-400 line-through leading-tight">
                    {formatPrice(item.original_price)}
                  </p>
                )}
              </div>
            </div>

            {/* Specs chips */}
            {specs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                {specs.map((s, i) => (
                  <span
                    key={i}
                    style={s.electric && ELECTRIC_ACCENT_ENABLED ? ELECTRIC_CHIP_STYLE : undefined}
                    className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-xs sm:text-sm">
                    {s.electric
                      ? <img src={ELECTRIC_BOLT_ICON} alt="" className={`w-3.5 h-3.5 flex-shrink-0 ${ELECTRIC_ACCENT_ENABLED ? 'invert' : 'dark:invert'}`} />
                      : <s.icon className="w-3.5 h-3.5" />}
                    {s.label}
                  </span>
                ))}
              </div>
            )}

            {/* Location */}
            <div className="mt-auto flex items-center gap-1 sm:gap-1.5 text-slate-400 text-xs sm:text-sm pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800 line-clamp-1">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="truncate">{translateLocation(t, item.location, item.country)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}