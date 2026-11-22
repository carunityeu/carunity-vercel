import React from 'react';
import TileExclusivePill from '@/components/cars/TileExclusivePill';

/**
 * Photo frame for listing cards: the photo keeps its rounded corner and the
 * "Only on CarUnity" pill shows when the listing is exclusive.
 * Anything passed as children (photo, dots, buttons) lives inside the clipped photo layer.
 *
 * @param radiusClass rounding of the photo
 * @param pillClass optional Tailwind position class for the pill, e.g. 'bottom-10'
 */
export default function PromoPhotoFrame({
  radiusClass = 'rounded-xl',
  className = '',
  style,
  pillClass,
  children
}) {
  return (
    <div className={`relative ${className}`} style={style}>
      <div className={`absolute inset-0 overflow-hidden ${radiusClass}`}>
        {children}
        <TileExclusivePill pillClass={pillClass} />
      </div>
    </div>
  );
}