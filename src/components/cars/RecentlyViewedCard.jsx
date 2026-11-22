import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { Heart, Car, GitCompareArrows } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompare } from '@/components/compare/CompareContext';
import { useTranslation } from 'react-i18next';

export default function RecentlyViewedCard({ car, formatPrice }) {
  const { t } = useTranslation();
  const [favorite, setFavorite] = useState(false);
  const { addCar, removeCar, isInCompare } = useCompare();
  const inCompare = isInCompare(car.id);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite(!favorite);
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) removeCar(car.id);
    else addCar(car);
  };

  return (
    <Link to={getCarDetailsPath(car)}>
      <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer">
        <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-700 overflow-hidden">
          {car.images?.[0] ? (
            <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Car className="w-8 h-8" />
            </div>
          )}

          {/* Compare Button */}
          <button
            onClick={handleCompare}
            className={cn(
              "absolute top-2 right-10 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-colors",
              inCompare ? "text-white" : "bg-white/90 text-slate-500 hover:bg-white"
            )}
            style={inCompare ? { backgroundColor: 'rgba(53,0,81,0.9)' } : {}}
            title={inCompare ? "Убрать из сравнения" : "Сравнить"}
          >
            <GitCompareArrows className="w-3.5 h-3.5" />
          </button>

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <Heart className={cn("w-3.5 h-3.5 transition-colors", favorite ? "fill-current" : "text-slate-500")} style={favorite ? { color: 'rgba(53,0,81,1)' } : {}} />
          </button>

          {/* Exclusive Listing */}

          </div>

        <div className="p-2.5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-xs truncate">
            {car.brand} {car.model} {car.year && `· ${car.year}`}
          </h3>
          <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-0.5">
            {formatPrice(car.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}