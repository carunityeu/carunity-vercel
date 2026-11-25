import React from 'react';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '@/components/favorites/FavoritesContext';
import { cn } from '@/lib/utils';

// Round "save" button on a listing photo. Always visible (no hover reveal, design code §7).
export default function FavoriteButton({ carId, className }) {
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(carId);
  const label = fav ? t('car.remove_from_wishlist') : t('car.add_to_wishlist');
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={fav}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(carId); }}
      className={cn('absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-page/90 text-brand-text', className)}>
      <Heart className={cn('h-[18px] w-[18px]', fav && 'fill-current')} strokeWidth={2} />
    </button>
  );
}
