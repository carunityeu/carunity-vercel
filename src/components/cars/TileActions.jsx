import React from 'react';
import { GitCompareArrows, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCompare } from '@/components/compare/CompareContext';
import { useFavorites } from '@/components/favorites/FavoritesContext';
import { isElectricAccent, accentClasses } from '@/lib/electricAccent';

const BASE = 'h-8 w-8 md:h-7 md:w-7 rounded-lg border flex items-center justify-center transition-colors shadow-md';

// Compare + favorite buttons in the top-left corner of a tile photo.
// On desktop they drop in from the top edge on hover (see .tile-actions in index.css).
// Accent colour: blue for electric listings, green for every other fuel type.
export default function TileActions({ car }) {
  const { t } = useTranslation();
  const { addCar, removeCar, isInCompare } = useCompare();
  const { isFavorite, toggleFavorite } = useFavorites();
  const inCompare = isInCompare(car.id);
  const fav = isFavorite(car.id);
  const accent = accentClasses(isElectricAccent(car));

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const compareLabel = inCompare ? t('compare.remove') : t('compare.add_to_compare');
  const favLabel = fav ? t('car.remove_from_wishlist') : t('car.add_to_wishlist');

  return (
    <div className="tile-actions absolute top-2 left-2 z-10 flex gap-1.5">
      <button
        type="button"
        onClick={(e) => { stop(e); inCompare ? removeCar(car.id) : addCar(car); }}
        className={`${BASE} ${inCompare ? accent.photoActive : accent.photoIdle}`}
        title={compareLabel}
        aria-label={compareLabel}
      >
        <GitCompareArrows className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={(e) => { stop(e); toggleFavorite(car.id); }}
        className={`${BASE} ${fav ? accent.photoActive : accent.photoIdle}`}
        title={favLabel}
        aria-label={favLabel}
      >
        <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-white' : ''}`} />
      </button>
    </div>
  );
}