import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { base44 } from '@/api/base44Client';
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
  GitCompareArrows } from
'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useCompare } from '@/components/compare/CompareContext';
import { useFavorites } from '@/components/favorites/FavoritesContext';
import { translateLocation } from '@/utils/locationUtils';
import TransmissionOrEnergy from '@/components/cars/TransmissionOrEnergy';



export default function CarCard({ car, onFavoriteToggle, isFavorite = false }) {
  const { t } = useTranslation();
  const { isFavorite: isFavHook, toggleFavorite: toggleFavHook } = useFavorites();
  const isFav = onFavoriteToggle ? isFavorite : isFavHook(car.id);
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageAreaRef = React.useRef(null);
  const { addCar, removeCar, isInCompare } = useCompare();
  const inCompare = isInCompare(car.id);

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeCar(car.id);
    } else {
      addCar(car);
    }
  };

  const images = (car.images?.filter(Boolean) || []).slice(0, 4);

  // Preload all images on hover
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

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(car.id, !isFav);
    } else {
      toggleFavHook(car.id);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('ru-RU').format(mileage) + ' ' + t('car.km');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}>
      
      <Link to={getCarDetailsPath(car)}>
        <div className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800">
          {/* Image */}
          <div
            ref={imageAreaRef}
            className="relative aspect-[4/3] overflow-hidden bg-slate-100"
            onMouseMove={handleMouseMove}>
            
            {images.length > 0 ?
            <>
                <img
                src={images[currentImageIndex]}
                alt={car.title}
                className="w-full h-full object-cover" />
              
                {/* Image bar indicator */}
                {images.length > 1 &&
              <div className="absolute bottom-0 left-0 right-0 flex gap-0.5 p-0">
                    {images.map((_, i) =>
                <div
                  key={i}
                  className="flex-1 h-1 transition-colors duration-100"
                  style={{ backgroundColor: i === currentImageIndex ? '#059669' : 'rgba(255,255,255,0.6)' }} />

                )}
                  </div>
              }
              </> :

            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                <span className="text-slate-400 text-sm">{t('car.no_photo')}</span>
              </div>
            }
            
            {/* Compare Button */}
             <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute top-2 sm:top-3 right-12 sm:right-14 w-8 h-8 sm:w-9 sm:h-9 rounded-full backdrop-blur-sm transition-all active:scale-95 sm:active:scale-100",
                inCompare ?
                "text-white hover:opacity-90" :
                "bg-white/90 text-slate-600 hover:bg-white"
              )}
              style={inCompare ? { backgroundColor: 'rgba(5,150,105,0.9)' } : {}}
              onClick={handleCompareClick}
              title={inCompare ? "Убрать из сравнения" : "Добавить к сравнению"}>
              
               <GitCompareArrows className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
             </Button>

             {/* Favorite Button */}
             <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 sm:top-3 right-2 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all active:scale-95 sm:active:scale-100"
              onClick={handleFavoriteClick}>
              
               <Heart className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors", isFav ? "fill-current" : "text-slate-600")} style={isFav ? { color: 'rgba(5,150,105,1)' } : {}} />
             </Button>

            {/* Exclusive Listing & Seller Type */}
            <div className="absolute bottom-3 left-3 flex flex-col gap-2">

              {car.exclusive_listing &&
              <div className="relative group/excl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md cursor-default select-none">
                    {t('car.only_on_cu', 'Только на CU')}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-900 text-white rounded-xl shadow-2xl p-4 pointer-events-none opacity-0 group-hover/excl:opacity-100 transition-opacity duration-200 z-50">
                    <p className="font-bold text-sm mb-2">{t('car.only_on_cu', 'Только на CU')}</p>
                    <p className="text-slate-300 text-xs leading-relaxed">{t('car.only_on_cu_desc', 'Не пропустите — продавец указал, что объявление размещается только на CarUnity')}</p>
                  </div>
                </div>
              }

              {car.seller_type === 'dealer' &&
              <Badge className="backdrop-blur-sm text-white border-0" style={{ backgroundColor: 'rgba(5,150,105,0.85)' }}>
                  {t('car.dealer')}
                </Badge>
              }
            </div>


          </div>

          {/* Content */}
          <div className="p-3 sm:p-4">
            {/* Title & Price */}
            <div className="mb-2 sm:mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg leading-tight line-clamp-1 group-hover:text-emerald-600 transition-colors">
                {car.brand} {car.model}
              </h3>
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="font-bold text-emerald-600 text-lg sm:text-lg">
                  {formatPrice(car.price)}
                </p>
                {car.original_price && car.original_price > car.price &&
                <p className="text-sm text-slate-400 line-through leading-tight">
                    {formatPrice(car.original_price)}
                  </p>
                }
              </div>
            </div>

            {/* Specs Tags */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              {car.year &&
              <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-sm sm:text-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  {car.year}
                </span>
              }
              {car.mileage !== undefined &&
              <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium">
                  <Gauge className="w-3.5 h-3.5" />
                  {formatMileage(car.mileage)}
                </span>
              }
              {car.fuel_type &&
              <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium">
                  <Fuel className="w-3.5 h-3.5" />
                  {t('fuel_types.' + car.fuel_type, car.fuel_type)}
                </span>
              }
              <TransmissionOrEnergy car={car} size="pill">
              {car.transmission &&
              <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium">
                  <Cog className="w-3.5 h-3.5" />
                  {t('transmission_types.' + car.transmission, car.transmission)}
                </span>
              }
              </TransmissionOrEnergy>
              {car.engine_power &&
              <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium">
                  <Zap className="w-3.5 h-3.5" />
                  {Math.round(car.engine_power * 0.7355)} {t('car.kw', 'кВт')}
                </span>
              }
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-slate-400 text-xs sm:text-sm pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800 line-clamp-1">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="truncate">{translateLocation(t, car.location, car.country)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>);

}